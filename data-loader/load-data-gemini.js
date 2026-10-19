import { ChromaClient } from "chromadb";
import csv from "csv-parser";
import fs from "fs";

import { GoogleGenAI } from "@google/genai";

const googleGenAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_API_KEY });

const chromaClient = new ChromaClient();
const collection = await chromaClient.getOrCreateCollection({ name: "movies-gemini-embedding-2" });

const ids = [];
const documents = [];
const metadatas = [];

fs.createReadStream("mpst_full_data.csv")
    .pipe(csv())
    .on('data', (row) => {
        const document = { title: row["title"], tags: row["tags"], synopsis: row["plot_synopsis"] }
        ids.push(row["imdb_id"])
        documents.push(JSON.stringify(document))
        metadatas.push(document)
    })
    .on("end", async () => {
        let startIndex = 0;

        while (startIndex < ids.length) {
            let endIdex = startIndex + 100;
            
            const documentsToEmbed = documents.slice(startIndex, endIdex);

            console.log(`Embedding documents from ${startIndex} to ${endIdex}`)
            const embeddings = [];
            for (const document of documentsToEmbed) {
                const { title, tags, synopsis } = JSON.parse(document);
                const response = await googleGenAI.models.embedContent({
                    model: "gemini-embedding-2",
                    contents: `title: ${title} | text: ${tags}. ${synopsis}`,
                });
                const values = response.embeddings?.[0]?.values;
                if (!values?.length) {
                    throw new Error("Gemini returned an empty embedding");
                }
                embeddings.push(values);
            }

            console.log(`Adding documents from ${startIndex} to ${endIdex}`)
            
            await collection.add({
                ids: ids.slice(startIndex, endIdex),
                embeddings,
                metadatas: metadatas.slice(startIndex, endIdex)
            })

            startIndex = endIdex;
        }

        console.log("Done!")
    })
