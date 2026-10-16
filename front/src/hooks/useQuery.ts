import { type Collection } from "chromadb";
import { useState } from "react";

export function useQuery({ collection }: { collection: Collection | null }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const submitQuery = async (query: string) => {
    if (!collection) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const result = await collection.query({ queryTexts: [query] });
      setQuery("");
      return result;
    } catch (error) {
      setIsError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    isLoading,
    isError,
    submitQuery,
  };
}
