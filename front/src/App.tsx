import { ChromaClient, type Collection } from "chromadb";
import { useEffect, useState } from "react";
import "./App.css";
import MovieCard from "./components/MovieCard";
import { useQuery } from "./hooks/useQuery";
import type { Movie } from "./types";

function App() {
  const [chromaCollection, setChromaCollection] = useState<Collection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const { isLoading, isError, submitQuery, query, setQuery } = useQuery({
    collection: chromaCollection,
  });

  const queryDatabase = async () => {
    const result = await submitQuery(query);
    const formattedDocuments: Movie[] = [];

    for (let i = 0; i < result.ids[0].length; i++) {
      formattedDocuments.push({
        id: result.ids[0][i],
        distance: result.distances[0][i],
        title: result.metadatas[0][i].title as string,
        tags: (result.metadatas[0][i].tags as string).split(", "),
        synopsis: result.metadatas[0][i].synopsis as string,
      });
    }

    setRecommendedMovies(formattedDocuments);
  };

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

  const shouldRenderResults = !isError && !isLoading;

  return (
    <div className="page-container">
      <h1>Movie Recommender</h1>
      <form className="query-form">
        <textarea
          placeholder="type here your query to search for simmilar movies"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          onClick={queryDatabase}
          disabled={!isConnected || isLoading}
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
