import { GoogleGenAI } from "@google/genai";
import { QueryResult, type Collection, type Metadata } from "chromadb";
import { useState } from "react";
import type { EMBEDDINGS_TYPE } from "../App";
import type { Movie } from "../types";

export function useQuery({ collection }: { collection: Collection | null }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const submitQuery = async (
    query: string,
    options: { embeddingType: keyof typeof EMBEDDINGS_TYPE },
  ) => {
    if (!collection) return;

    setIsLoading(true);
    setIsError(false);
    try {
      let result: Awaited<Promise<QueryResult<Metadata>>>;

      switch (options.embeddingType) {
        case "gemini":
          result = await queryWithGeminiEmbedding(query);
          break;
        default:
          result = await queryWithChromaEmbedding(query);
          break;
      }

      const formattedDocuments: Movie[] = [];

      const distances = result.distances[0].map((d) => d === null ? 0 : (1 - d + 1) / 2);

      for (let i = 0; i < result.ids[0].length; i++) {
        const metadata = result.metadatas[0][i];
        if (!metadata) continue;
        formattedDocuments.push({
          id: result.ids[0][i],
          distance: distances[i],
          title: metadata.title as string,
          tags: (metadata.tags as string).split(", "),
          synopsis: metadata.synopsis as string,
        });
      }

      setQuery("");
      return formattedDocuments;
    } catch (error) {
      setIsError(true);
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const queryWithGeminiEmbedding = async (query: string) => {
    if (!collection) throw new Error("Collection unavailable");
    const googleGenAI = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY,
    });

    const response = await googleGenAI.models.embedContent({
      model: "gemini-embedding-2",
      contents: `task: search result | query: ${query}`,
    });
    const queryEmbeddings = response.embeddings?.[0]?.values;
    if (!queryEmbeddings?.length) {
      throw new Error("Gemini returned an empty embedding");
    }
    return collection.query({ queryEmbeddings: [queryEmbeddings] });
  };

  const queryWithChromaEmbedding = async (query: string) => {
    if (!collection) throw new Error("Collection unavailable");
    return collection.query({ queryTexts: [query] });
  };

  return {
    query,
    setQuery,
    isLoading,
    isError,
    submitQuery,
  };
}
