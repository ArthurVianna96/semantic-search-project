import { ChromaClient } from "chromadb";
import csv from "csv-parser";
import fs from "fs";

const chromaClient = new ChromaClient();
const collection = await chromaClient.getOrCreateCollection({ name: "movies_chroma_default_embedding" });

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
            let endIdex = startIndex + 500;
            console.log(`Adding documents from ${startIndex} to ${endIdex}`)
    
            await collection.add({
                ids: ids.slice(startIndex, endIdex),
                documents: documents.slice(startIndex, endIdex),
                metadatas: metadatas.slice(startIndex, endIdex)
            })

            startIndex = endIdex;
        }

        console.log("Done!")
    })
