import { useState } from "react";
import "./App.css";
import MovieCard from "./components/MovieCard";
import { useChroma } from "./hooks/useChroma";
import { useQuery } from "./hooks/useQuery";
import type { Movie } from "./types";

export const EMBEDDINGS_TYPE = {
  gemini: {
    collectionName: "movies-gemini-embedding-2",
    embeddingType: "gemini",
  },
  chroma_default: {
    collectionName: "movies_chroma_default_embedding",
    embeddingType: "chroma_default",
  },
};

function App() {
  const [embeddingType, setEmbeddingType] = useState(EMBEDDINGS_TYPE["gemini"]);
  const { chromaCollection, isConnected } = useChroma({
    collectionName: embeddingType.collectionName,
  });
  const { isLoading, isError, submitQuery, query, setQuery } = useQuery({
    collection: chromaCollection,
  });

  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);

  const queryDatabase = async () => {
    if (!isConnected || isLoading || !query.trim()) return;
    const movies = await submitQuery(query, {
      embeddingType:
        embeddingType.embeddingType as keyof typeof EMBEDDINGS_TYPE,
    });

    setRecommendedMovies(movies ?? []);
  };

  const changeEmbeddingType = (type: keyof typeof EMBEDDINGS_TYPE) => {
    setEmbeddingType(EMBEDDINGS_TYPE[type]);
    setRecommendedMovies([]);
  };

  const shouldRenderResults = !isError && !isLoading;

  return (
    <div className="page-container">
      <h1>Movie Recommender</h1>
      <form className="query-form" onSubmit={(event) => { event.preventDefault(); queryDatabase(); }}>
        <fieldset className="embedding-switch" disabled={isLoading}>
          <legend>Embedding model</legend>
          <div className="embedding-options">
            {(["gemini", "chroma_default"] as const).map((type) => (
              <label key={type} className="embedding-option">
                <input
                  type="radio"
                  name="embedding-model"
                  value={type}
                  checked={embeddingType.embeddingType === type}
                  onChange={() => changeEmbeddingType(type)}
                />
                <span>{type === "gemini" ? "Gemini" : "Chroma default"}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <textarea
          placeholder="type here your query to search for simmilar movies"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            const key = e.code;
            if (key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              queryDatabase();
            }
          }}
        />
        <button
          type="button"
          onClick={queryDatabase}
          disabled={!isConnected || isLoading || !query.trim()}
        >
          Submit
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error searching the results, please try again</p>}
      {shouldRenderResults && (
        <div className="recommended-movies">
          {recommendedMovies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
