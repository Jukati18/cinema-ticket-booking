import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { CheckboxGroup, Form, SelectField, TextAreaField, TextField, useZodForm } from '@/components/common/Form';
import { AGE_RATINGS, MOVIE_STATUSES, STATUS_LABELS, movieSchema, movieToFormValues } from '@/features/catalog/movie-schema';
import { GENRES, createAdminMovies } from '@/mocks/admin-movies';

const genreOptions = GENRES.map((genre) => ({ value: genre, label: genre }));
const ageOptions = AGE_RATINGS.map((rating) => ({ value: rating, label: rating }));
const statusOptions = MOVIE_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }));

function MovieForm({ movie, onSave, onCancel }) {
  const methods = useZodForm(movieSchema, { defaultValues: movieToFormValues(movie) });
  return (
    <section className="panel admin-form-panel">
      <div className="form-heading">
        <h2>{movie ? 'Sửa phim' : 'Thêm phim'}</h2>
        <Button type="button" variant="ghost" onClick={onCancel}>Đóng</Button>
      </div>
      <Form methods={methods} className="admin-form" onSubmit={(values) => onSave(values)}>
        <TextField name="title" label="Tên phim" />
        <TextField name="originalTitle" label="Tên gốc" />
        <TextAreaField name="description" label="Mô tả" />
        <TextField name="durationMinutes" label="Thời lượng (phút)" type="number" min="1" step="1" inputMode="numeric" />
        <TextField name="releaseDate" label="Ngày khởi chiếu" type="date" />
        <SelectField name="ageRating" label="Độ tuổi" options={ageOptions} />
        <TextField name="director" label="Đạo diễn" />
        <TextField name="cast" label="Diễn viên" placeholder="Tên cách nhau bởi dấu phẩy" />
        <TextField name="posterUrl" label="Poster" placeholder="https://… hoặc /movies/…" />
        <TextField name="trailerUrl" label="Trailer" placeholder="https://…" />
        <CheckboxGroup name="genres" label="Thể loại" options={genreOptions} />
        <SelectField name="status" label="Trạng thái" options={statusOptions} />
        <div className="actions">
          <Button type="submit">{movie ? 'Lưu thay đổi' : 'Thêm phim'}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        </div>
      </Form>
    </section>
  );
}

export function Component() {
  const [movies, setMovies] = useState(createAdminMovies);
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const [warning, setWarning] = useState('');
  const visible = useMemo(
    () => (status === 'all' ? movies : movies.filter((movie) => movie.status === status)),
    [movies, status],
  );

  function saveMovie(values) {
    if (editor?.id) {
      setMovies((current) => current.map((movie) => (movie.id === editor.id ? { ...movie, ...values } : movie)));
      setNotice(`Đã cập nhật “${values.title}”.`);
    } else {
      setMovies((current) => [{ id: `movie-${Date.now()}`, hasActiveShowtimes: false, ...values }, ...current]);
      setNotice(`Đã thêm “${values.title}” vào danh sách.`);
    }
    setWarning('');
    setEditor(null);
  }

  function removeMovie(movie) {
    if (movie.hasActiveShowtimes) {
      setNotice('');
      setWarning(`Không xóa “${movie.title}” vì còn suất chiếu đang lịch. Hãy chuyển trạng thái sang Đã kết thúc.`);
      return;
    }
    setMovies((current) => current.filter((item) => item.id !== movie.id));
    setWarning('');
    setNotice(`Đã xóa “${movie.title}”.`);
    if (editor?.id === movie.id) setEditor(null);
  }

  function endMovie(movie) {
    setMovies((current) => current.map((item) => (item.id === movie.id ? { ...item, status: 'ended', hasActiveShowtimes: false } : item)));
    setWarning('');
    setNotice(`Đã chuyển “${movie.title}” sang Đã kết thúc.`);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-bar">
        <p className="muted">Danh sách mẫu theo thực thể Movie. Dữ liệu chỉ nằm trên trang này.</p>
        <Button type="button" onClick={() => { setEditor({ id: null }); setNotice(''); }}><Plus size={16} />Thêm phim</Button>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
      {warning && (
        <p className="notice admin-warning" role="alert">
          {warning}
        </p>
      )}
      {editor && (
        <MovieForm
          key={editor.id || 'new'}
          movie={movies.find((movie) => movie.id === editor.id)}
          onSave={saveMovie}
          onCancel={() => setEditor(null)}
        />
      )}
      <DataTable
        rows={visible}
        rowKey={(movie) => movie.id}
        pageSize={5}
        searchPlaceholder="Tìm theo tên phim hoặc đạo diễn"
        getSearchText={(movie) => `${movie.title} ${movie.originalTitle} ${movie.director}`}
        toolbar={(
          <label className="admin-filter">
            Trạng thái
            <select aria-label="Lọc theo trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Tất cả</option>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}
        columns={[
          {
            id: 'title',
            header: 'Phim',
            cell: (movie) => (
              <span className="admin-movie">
                <img src={movie.posterUrl} alt="" />
                <span>
                  <strong>{movie.title}</strong>
                  <small>{movie.originalTitle}</small>
                </span>
              </span>
            ),
          },
          { id: 'duration', header: 'Phút', cell: (movie) => movie.durationMinutes },
          { id: 'release', header: 'Khởi chiếu', cell: (movie) => movie.releaseDate },
          { id: 'age', header: 'Tuổi', cell: (movie) => movie.ageRating },
          { id: 'genres', header: 'Thể loại', cell: (movie) => movie.genres.join(', ') },
          { id: 'status', header: 'Trạng thái', cell: (movie) => <span className={`badge ${movie.status === 'now_showing' ? 'red' : movie.status === 'coming_soon' ? 'blue' : 'gold'}`}>{STATUS_LABELS[movie.status]}</span> },
          {
            id: 'actions',
            header: 'Thao tác',
            cell: (movie) => (
              <div className="admin-row-actions">
                <Button type="button" size="sm" variant="outline" onClick={() => { setEditor(movie); setNotice(''); }}><Pencil size={14} />Sửa</Button>
                {movie.hasActiveShowtimes && <Button type="button" size="sm" variant="secondary" onClick={() => endMovie(movie)}>Kết thúc</Button>}
                <Button type="button" size="sm" variant="ghost" onClick={() => removeMovie(movie)}><Trash2 size={14} />Xóa</Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
