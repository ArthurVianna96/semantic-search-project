import type { Movie } from "../types";
import MovieTag from "./MovieTag";

export default function MovieCard({
  id,
  title,
  tags,
  synopsis,
  distance,
}: Movie) {
  return (
    <div className="movie-card">
      <div className="movie-header">
        <h2>
          <a href={`https://www.imdb.com/title/${id}`} target="_blank">
            {title}
          </a>
        </h2>
        <div className="score">{Math.round(1)}</div>
      </div>
      <div className="tags">
        {tags.map((tag) => (
          <MovieTag key={tag} tag={tag} />
        ))}
      </div>
      <p>{synopsis}</p>
    </div>
  );
}
