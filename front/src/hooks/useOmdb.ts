import { useEffect, useState } from "react";
import type { OMDBMovieMetadata } from "../types";

const OMDB_BASE_URL = "https://www.omdbapi.com";

export const useOmdb = ({ id }: { id: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [info, setInfo] = useState<OMDBMovieMetadata>();

  useEffect(() => {
    const fetchTitleInfo = async () => {
      try {
        const url = `${OMDB_BASE_URL}?i=${id}&apiKey=${import.meta.env.VITE_OMDB_API_KEY}`;

        const result = await fetch(url);
        const data = await result.json();

        if (!result.ok || data.Response === "False") {
          throw new Error(data.Error || "Movie details unavailable");
        }

        setInfo({
          year: data.Year,
          actors: data.Actors,
          director: data.Director,
          imdbRating: data.imdbRating,
          poster: data.Poster,
          rated: data.Rated,
          runtime: data.Runtime,
          released: data.Released,
        });
      } catch (error) {
        setIsError(true);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitleInfo();
  }, [id]);

  return { isLoading, isError, info };
};
