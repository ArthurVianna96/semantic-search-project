import { ChromaClient } from "chromadb";

const chromaClient = new ChromaClient();
const collection = await chromaClient.getOrCreateCollection({ name: "movies" });

const result = await collection.query({ queryTexts: ["A movie about animals"]});

console.log(result)