import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router';
import { cinemaApi } from '../lib/cinema-api';
import { QueryState } from './BookingParts';
function dateParts(value) {
 const day=new Date(value+'T12:00:00+07:00');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const offset=Math.round((Date.parse(value+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
 const weekday=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',weekday:'long'}).format(day);
 const label=offset===0?'Hôm nay':offset===1?'Ngày mai':value.endsWith('-12-25')?'Giáng sinh':weekday==='Thứ Bảy'||weekday==='Chủ Nhật'?'Cuối tuần':'Sắp tới';
 return {label,weekday,date:new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit'}).format(day)};
}
export default function ShowtimeSchedule({ movieId }) {
 const [params, setParams] = useSearchParams();
 const shows = useQuery({ queryKey: ['showtimes'], queryFn: () => cinemaApi.getShowtimes() });
 const movies = useQuery({ queryKey: ['movies'], queryFn: cinemaApi.getMovies });
 const cinemas = useQuery({ queryKey: ['cinemas'], queryFn: cinemaApi.getCinemas });
 const cinemaId = params.get('cinemaId') || '';
 const base = (shows.data || []).filter(s => (!movieId || s.movieId === movieId) && (!cinemaId || s.cinemaId === cinemaId));
 const dates = [...new Set(base.map(s => s.startsAt.slice(0,10)))].sort();
 const date = dates.includes(params.get('date')) ? params.get('date') : dates[0];
 const formats = [...new Set(base.map(s => s.format))];
 const format = formats.includes(params.get('format')) ? params.get('format') : '';
 const sessions = base.filter(s => s.status === 'on_sale' && s.startsAt.startsWith(date || '') && (!format || s.format === format)).sort((a,b) => a.startsAt.localeCompare(b.startsAt));
 function update(key,value) { const next=new URLSearchParams(params); value ? next.set(key,value) : next.delete(key); setParams(next,{replace:true,preventScrollReset:true}); }
 return <section id="schedule" className={`new-schedule ${!movieId ? 'schedule-overview' : ''}`}><div className="catalog-heading"><div><span className="booking-caption">CineVibe Booking Engine</span><h2>Lịch chiếu & đặt vé trực tuyến</h2></div><select aria-label="Lọc rạp" value={cinemaId} onChange={e=>update('cinemaId',e.target.value)}><option value="">Tất cả rạp</option>{cinemas.data?.map(c=><option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}</select></div><div className="schedule-filters"><div className="date-strip" role="group" aria-label="Ngày chiếu">{dates.map(d=>{const parts=dateParts(d);return <button key={d} aria-label={parts.label+', '+parts.date+', '+parts.weekday} aria-pressed={date===d} onClick={()=>update('date',d)}><span className="date-caption">{parts.label}</span><span className="date-value">{parts.date}</span><span className="date-weekday">{parts.weekday}</span></button>;})}</div><div role="group" aria-label="Định dạng chiếu"><strong>Định dạng</strong>{['',...formats].map(f=><button key={f} aria-pressed={f===format} onClick={()=>update('format',f)}>{f||'Tất cả'}</button>)}</div></div><QueryState query={shows}>{(cinemas.data||[]).filter(c=>!cinemaId||c.id===cinemaId).map(c=>{const list=sessions.filter(s=>s.cinemaId===c.id);return <article className="cinema-sessions" key={c.id}><h3>{c.name.replace(/ \(.*?\)/g,'')} ({c.city})</h3>{list.length ? [...new Set(list.map(s=>s.format))].map(f=><div className="format-sessions" key={f}><span className="badge blue">{f}</span><div className="showtime-row">{list.filter(s=>s.format===f).map(s=><Link key={s.id} className="showtime-button" to={`/booking/${s.id}/seats`} aria-label={`Chọn suất ${s.startsAt}, ${c.name}`}><strong>{s.startsAt.slice(11,16)}</strong>{!movieId && <small className="session-movie-title">{movies.data?.find(m=>m.id===s.movieId)?.title}</small>}</Link>)}</div></div>) : <p className="muted">Chưa có lịch chiếu phù hợp.</p>}</article>;})}</QueryState></section>;
}
