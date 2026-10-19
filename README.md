# Semantic movie search

A learning project for exploring semantic search, embeddings, and vector databases through movie recommendations. Describe a story, mood, or theme, such as "toys that come to life". The app retrieves movies whose stored embeddings are closest to your query.

The goal is to understand how text becomes a vector, how nearest-neighbor retrieval works, and how changing the embedding model changes the results. This is retrieval over a movie dataset, not generated movie recommendations or a personalized recommendation model.

![Movie search demo showing a Gemini query, movie results, and an expanded synopsis](docs/assets/movie-search-demo.gif)

## How it works

1. A loader reads movie titles, tags, and plot synopses from `data-loader/mpst_full_data.csv`.
2. It generates embeddings and stores them with movie metadata in Chroma.
3. The browser embeds your search using the selected model and queries the corresponding collection.
4. Movie cards show the retrieved synopsis and tags. OMDb supplies posters, release details, and IMDb ratings.

An embedding is a numeric representation of text. Semantic search compares these representations rather than requiring exact keyword matches. Documents and queries must use the same embedding model and vector dimensions. Matching dimensions alone does not make different models compatible.

| UI option | Collection | Embedding dimensions | Generation |
| --- | --- | --- | --- |
| Gemini | `movies-gemini-embedding-2` | 3072 | Gemini API, `gemini-embedding-2` |
| Chroma default | `movies_chroma_default_embedding` | 384 | Chroma default embedding function |

Gemini embeds each movie separately using its title, tags, and synopsis. Query text uses a search task prefix. The default loader embeds a JSON string containing the same movie fields. Switching models therefore compares both the model and input formatting.

The cards' Match percentage is currently `round(clamp(1 - distance / 2, 0, 1) * 100)`. It is a display transformation, not a probability or calibrated measure of relevance. The loaders do not explicitly configure a distance metric, so do not interpret this as a cosine similarity percentage or compare scores across models as equivalent.

## Requirements

- Node.js 24 and npm.
- Python 3.14 or newer, as required by `vector_database/pyproject.toml`.
- [uv](https://docs.astral.sh/uv/) to install and run the Python environment.
- Internet access for model downloads, Gemini requests, and OMDb metadata.
- A Gemini API key for the Gemini path and an OMDb API key for movie details.

Chroma default search works without a Gemini key. OMDb is optional for retrieval; missing credentials leave cards without external movie details.

## Run locally

Commands below start from the repository root unless a `cd` changes the directory. Keep the database and frontend running in separate terminals.

### 1. Start Chroma

```sh
cd vector_database
uv sync --locked
uv run chroma run config.yaml --path ./chroma --host localhost --port 8000
```

The positional `config.yaml` argument matches the installed Chroma CLI. The configuration allows browser requests from `http://localhost:5173`. Database files persist in `vector_database/chroma/`, which Git ignores. This component uses YAML configuration and needs no `.env` file.

### 2. Install loader dependencies and configure credentials

In another terminal:

```sh
cd data-loader
npm ci
cp .env.example .env
```

Set `GOOGLE_GEN_AI_API_KEY` in `data-loader/.env` if using Gemini. Obtain a key through [Google AI Studio](https://aistudio.google.com/apikey).

The loaders expect `mpst_full_data.csv` in their working directory, with `imdb_id`, `title`, `tags`, and `plot_synopsis` columns. If missing from your checkout, obtain the MPST movie synopsis dataset and place it at `data-loader/mpst_full_data.csv`. See the [MPST dataset paper](https://aclanthology.org/L18-1274/) for its description and attribution.

### 3. Load the embedding collections

Run from `data-loader/`, with Chroma running. Load whichever options you intend to use.

Chroma default:

```sh
node load-data.js
```

Gemini:

```sh
node --env-file=.env load-data-gemini.js
```

Node loads this `.env` only when passed `--env-file`. The default loader does not require environment variables.

Both scripts process the whole CSV. The default loader writes batches of 500 documents. The Gemini loader makes one API request per movie and writes batches of 100 embeddings. A full Gemini import consumes API quota and may incur charges. Wait for `Done!` before searching that collection.

The scripts use `collection.add`, not an update or resume workflow. They do not track import progress or retry failed API requests. A failed batch can leave a partially populated collection; rerunning may encounter existing movie IDs. Avoid rerunning a completed import just to restart the app.

### 4. Start the frontend

In another terminal:

```sh
cd front
npm ci
cp .env.example .env
```

Edit `front/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_GOOGLE_GEN_AI_API_KEY` | Embeds searches when Gemini is selected. Use the same Gemini credentials as the loader. |
| `VITE_OMDB_API_KEY` | Fetches posters and IMDb metadata. Obtain a key from [OMDb](https://www.omdbapi.com/apikey.aspx). |

```sh
npm run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173`. Select Gemini or Chroma default, enter a description, and submit. Gemini is selected initially. Choose Chroma default if you loaded only that collection. Enter submits; Shift+Enter adds a new line. Switching models clears the previous results.

Vite loads `front/.env` automatically. Restart the dev server after changing it. Variables prefixed with `VITE_` are exposed to the browser. This learning app calls Gemini directly from the browser; a deployed app should put credentialed requests behind a backend rather than bundle a private key.

### 5. Check the frontend

```sh
cd front
npm run build
npm run lint
```

The build checks TypeScript and produces `front/dist/`. Lint runs Oxlint. There is no automated end-to-end test suite or implemented loader test command.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Chroma connection error | Start Chroma on `localhost:8000` before running a loader or searching. |
| Browser CORS error | Start Chroma with `config.yaml` and use the frontend at exactly `http://localhost:5173`. |
| Submit stays disabled | The selected collection must exist and be reachable, and the query must contain text. Load that collection first; reload the page if it was created after the frontend started. |
| Expected 384 dimensions, got 3072 | Gemini queries reached a default-model collection. Keep the collection names in the loaders and frontend aligned; do not mix embeddings. |
| Gemini key missing | Loader needs `--env-file=.env`; frontend needs `VITE_GOOGLE_GEN_AI_API_KEY` and a dev-server restart. |
| Gemini model not found | The loader and query code use `gemini-embedding-2`. Check model availability for your API key before substituting another model; changing models requires re-embedding into a separate collection. |
| Gemini quota or request failure | Check API quota and the loader output. Imports currently have no retry or checkpoint support. |
| No poster or IMDb details | Check the OMDb key and API response. Retrieval does not depend on OMDb. |

## Repository layout

- `front/`: React, TypeScript, and Vite search UI.
- `data-loader/`: CSV imports for the two embedding paths.
- `vector_database/`: Python dependency lockfile and Chroma server configuration.
- `vector_database/chroma/`: generated local database data, excluded from Git.

`data-loader/test_db.js` is an older manual query script targeting the legacy `movies` collection. It does not validate the current Gemini or Chroma default collections.

This README covers the current loaders, frontend hooks, environment variables, and database startup configuration. It intentionally uses ordinary Markdown without YAML frontmatter for GitHub rendering.
