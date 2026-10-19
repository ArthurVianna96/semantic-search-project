# Movie search frontend

React and TypeScript UI for comparing Gemini and Chroma default embeddings over movie synopses.

Follow the [project setup guide](../README.md) to start Chroma, load collections, and configure API keys.

From this directory:

```sh
npm ci
cp .env.example .env
# Fill in the API keys before starting Vite.
npm run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173`. Select an embedding model before searching. Its collection must already be loaded in Chroma.

```sh
npm run build
npm run lint
```

Vite reads `.env` automatically. Restart after editing it. All `VITE_` variables are visible in the browser bundle.
