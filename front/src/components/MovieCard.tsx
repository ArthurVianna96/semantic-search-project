import { useId, useState } from "react";
import { useOmdb } from "../hooks/useOmdb";
import type { Movie } from "../types";
import MovieTag from "./MovieTag";

export default function MovieCard({
  id,
  title,
  tags,
  synopsis,
  distance,
}: Movie) {
  const { isError, isLoading, info } = useOmdb({ id });
  const [failedPoster, setFailedPoster] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const synopsisId = useId();
  const poster = info?.poster;
  const hasPoster = poster && poster !== "N/A" && poster !== failedPoster;
  const metadata = [info?.year, info?.rated, info?.runtime].filter(
    (value) => value && value !== "N/A",
  );
  const rating = Number(info?.imdbRating);
  const matchPercentage = Number.isFinite(distance)
    ? Math.round(Math.max(0, Math.min(1, distance)) * 100)
    : null;

  return (
    <article className="movie-card" aria-label={title}>
      <div className="movie-poster">
        {hasPoster ? (
          <img
            src={poster}
            alt={`${title} poster`}
            loading="lazy"
            onError={() => setFailedPoster(poster)}
          />
        ) : (
          <div className="movie-poster-fallback">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 3v18M16 3v18M4 8h4M4 16h4M16 8h4M16 16h4" />
            </svg>
            <span>{isLoading ? "Loading poster…" : "No poster available"}</span>
          </div>
        )}
      </div>
      <div className="movie-content">
        <header className="movie-header">
          <div className="movie-heading">
            <h2>
              <a
                href={`https://www.imdb.com/title/${encodeURIComponent(id)}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
                <span className="movie-external" aria-hidden="true">
                  ↗
                </span>
                <span className="movie-sr-only"> (opens in a new tab)</span>
              </a>
            </h2>
            {metadata.length > 0 && (
              <p className="movie-metadata">{metadata.join(" · ")}</p>
            )}
          </div>
          <div className="movie-scores">
          {matchPercentage !== null && (
            <div className="movie-rating movie-match" aria-label={`${matchPercentage}% match to your search`}>
              <strong>{matchPercentage}%</strong>
              <span className="movie-rating-source">Match</span>
            </div>
          )}
          {Number.isFinite(rating) && rating > 0 && (
            <div
              className="movie-rating"
              aria-label={`IMDb rating ${rating} out of 10`}
            >
              <span aria-hidden="true">★</span>
              <strong>{rating.toFixed(1)}</strong>
              <span className="movie-rating-source">IMDb</span>
            </div>
          )}
          </div>
        </header>
        {tags.length > 0 && (
          <div className="tags" aria-label="Genres">
            {tags.map((tag) => (
              <MovieTag key={tag} tag={tag} />
            ))}
          </div>
        )}
        <p
          id={synopsisId}
          className="movie-synopsis"
          data-collapsed={!expanded}
        >
          {synopsis || "No synopsis available."}
        </p>
        {synopsis && (
          <button
            type="button"
            className="movie-synopsis-toggle"
            aria-expanded={expanded}
            aria-controls={synopsisId}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Read full synopsis"}
          </button>
        )}
        {isLoading && (
          <p className="movie-status" role="status">
            Loading movie details…
          </p>
        )}
        {isError && (
          <p className="movie-status">Additional movie details unavailable.</p>
        )}
      </div>
    </article>
  );
}
