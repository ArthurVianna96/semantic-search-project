import { ChromaClient, type Collection } from "chromadb";
import { useEffect, useState } from "react";

export function useChroma({ collectionName }: { collectionName: string }) {
  const [connection, setConnection] = useState<{
    name: string;
    collection: Collection;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initializeChroma = async () => {
      try {
        const collection = await new ChromaClient().getCollection({ name: collectionName });
        if (!cancelled) setConnection({ name: collectionName, collection });
      } catch {
        if (!cancelled) setConnection(null);
      }
    };
    initializeChroma();
    return () => { cancelled = true; };
  }, [collectionName]);

  const chromaCollection = connection?.name === collectionName ? connection.collection : null;
  return { chromaCollection, isConnected: chromaCollection !== null };
}
