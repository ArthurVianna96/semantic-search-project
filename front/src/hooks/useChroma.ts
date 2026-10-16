import { ChromaClient, type Collection } from "chromadb";
import { useEffect, useState } from "react";

export function useChroma() {
  const [chromaCollection, setChromaCollection] = useState<Collection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeChroma = async () => {
      try {
        const chromaClient = new ChromaClient();
        const collection = await chromaClient.getOrCreateCollection({
          name: "movies",
        });

        setChromaCollection(collection);
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    initializeChroma();
  }, []);

  return { chromaCollection, isConnected };
}
