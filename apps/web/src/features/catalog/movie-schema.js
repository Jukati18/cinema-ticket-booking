import { z } from 'zod';

export const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C18'];
export const MOVIE_STATUSES = ['coming_soon', 'now_showing', 'ended'];

export const STATUS_LABELS = {
  coming_soon: 'Sắp chiếu',
  now_showing: 'Đang chiếu',
  ended: 'Đã kết thúc',
};

const httpUrl = z.url('Liên kết không hợp lệ');

function isMediaLink(value) {
  return value.startsWith('/') || httpUrl.safeParse(value).success;
}

export const movieSchema = z.object({
  title: z.string().trim().min(1, 'Nhập tên phim'),
  originalTitle: z.string().trim().min(1, 'Nhập tên gốc'),
  description: z.string().trim().min(1, 'Nhập mô tả'),
  durationMinutes: z.coerce
    .number({ error: 'Thời lượng phải là số nguyên dương' })
    .int('Thời lượng phải là số nguyên dương')
    .positive('Thời lượng phải lớn hơn 0'),
  releaseDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Chọn ngày khởi chiếu'),
  ageRating: z.enum(AGE_RATINGS, { error: 'Chọn độ tuổi' }),
  director: z.string().trim().min(1, 'Nhập đạo diễn'),
  cast: z.string().trim().min(1, 'Nhập diễn viên, cách nhau bởi dấu phẩy').transform((value) => value.split(',').map((name) => name.trim()).filter(Boolean)),
  posterUrl: z.string().trim().min(1, 'Nhập poster').refine(isMediaLink, 'Poster phải là URL hoặc đường dẫn bắt đầu bằng /'),
  trailerUrl: z.string().trim().min(1, 'Nhập link trailer').pipe(httpUrl),
  genres: z.preprocess(
    (value) => (Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []),
    z.array(z.string().min(1)).min(1, 'Chọn ít nhất một thể loại'),
  ),
  status: z.enum(MOVIE_STATUSES, { error: 'Chọn trạng thái phát hành' }),
});

export const emptyMovieForm = {
  title: '',
  originalTitle: '',
  description: '',
  durationMinutes: '',
  releaseDate: '',
  ageRating: 'P',
  director: '',
  cast: '',
  posterUrl: '',
  trailerUrl: '',
  genres: [],
  status: 'coming_soon',
};

export function movieToFormValues(movie) {
  if (!movie) return emptyMovieForm;
  return {
    title: movie.title,
    originalTitle: movie.originalTitle,
    description: movie.description,
    durationMinutes: movie.durationMinutes,
    releaseDate: movie.releaseDate,
    ageRating: movie.ageRating,
    director: movie.director,
    cast: movie.cast.join(', '),
    posterUrl: movie.posterUrl,
    trailerUrl: movie.trailerUrl,
    genres: movie.genres,
    status: movie.status,
  };
}
