export interface Movie {
  id: string;
  distance: number;
  title: string;
  tags: string[];
  synopsis: string;
}

export interface OMDBMovieMetadata {
  year: string;
  rated: string;
  runtime: string;
  director: string;
  actors: string;
  poster: string;
  imdbRating: string;
  released: string;
}
