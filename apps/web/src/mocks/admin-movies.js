import catalog from './movies.json';

const lockedShowtimes = new Set(['movie-1', 'movie-4']);

export const GENRES = [...new Set(catalog.flatMap((movie) => movie.genres))].sort((a, b) => a.localeCompare(b, 'vi'));

export function createAdminMovies() {
  return catalog.map((movie) => ({
    id: movie.id,
    title: movie.title,
    originalTitle: movie.title,
    description: movie.synopsis,
    durationMinutes: movie.durationMinutes,
    releaseDate: movie.releaseDate,
    ageRating: movie.ageRating,
    director: movie.director,
    cast: movie.cast ?? [],
    posterUrl: movie.posterUrl,
    trailerUrl: movie.trailerUrl,
    genres: movie.genres,
    status: movie.status,
    hasActiveShowtimes: lockedShowtimes.has(movie.id),
  }));
}
