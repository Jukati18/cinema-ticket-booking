import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cinemaApi, isMock } from '../lib/cinema-api';
import { useBooking } from '../features/booking/context';
import { Summary, Steps, QueryState } from '../components/BookingParts';
import SeatMap from '../components/SeatMap';
import { Button } from '../components/ui/button';
import { CalendarDays, Film } from 'lucide-react';
import { showtime } from '../lib/format';
import ComboPicker from '../components/ComboPicker';
export function Component() {
  const { showtimeId } = useParams(); const navigate = useNavigate(); const client = useQueryClient(); const { state, dispatch, promoCode } = useBooking();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [scenario, setScenario] = useState('success');
  const show = useQuery({ queryKey: ['showtime', showtimeId], queryFn: () => cinemaApi.getShowtime(showtimeId) });
  const menu = useQuery({ queryKey: ['combos'], queryFn: cinemaApi.getCombos });
  const map = useQuery({ queryKey: ['seats', showtimeId], queryFn: () => cinemaApi.getSeats(showtimeId), refetchInterval: 5000, refetchOnWindowFocus: true });
  useEffect(() => { dispatch({ type: 'SHOWTIME_SELECTED', id: showtimeId }); }, [dispatch, showtimeId]);
  const ids = state.showtimeId === showtimeId ? state.seatIds : [];
  const selected = ids.filter((id) => map.data?.seats.some((s) => s.id === id && s.status === 'available'));
  const total = map.data?.seats.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0) || 0;
  const comboLines = (menu.data || []).filter((c) => state.comboItems.some((v) => v.comboId === c.id)).map((c) => ({ ...c, quantity: state.comboItems.find((v) => v.comboId === c.id).quantity }));
  const comboAmount = comboLines.reduce((sum, c) => sum + c.quantity * c.price, 0);
  async function hold() {
    if (busy) return; setBusy(true); setError('');
    try { const result = await cinemaApi.createHold({ showtimeId, seatIds: selected, comboItems: state.comboItems, promoCode, scenario }); dispatch({ type: 'HOLD_CREATED', hold: result }); navigate(`/booking/${showtimeId}/checkout?hold=${encodeURIComponent(result.id)}`); }
    catch (e) { setError(e.message); dispatch({ type: 'SEATS_SELECTED', ids: [] }); await client.invalidateQueries({ queryKey: ['seats', showtimeId] }); }
    finally { setBusy(false); }
  }
  return <><Steps step={2} /><div className="page-heading"><p className="eyebrow">Đặt vé trực tuyến / Chọn ghế</p><h1>Chọn chỗ ngồi của bạn</h1><p className="muted">Chọn ghế còn trống. Ghế được giữ sau khi bạn nhấn tiếp tục.</p></div><QueryState query={show}><QueryState query={map}>{show.data && map.data && <div className="booking-grid"><div><section className="panel"><div className="seat-room"><Film size={28} className="cyan shrink-0" /><div><span className="badge red">{show.data.cinemaName}</span><h2 className="mt-3 mb-0">Sơ đồ {show.data.roomName}</h2><p className="flex items-center gap-2"><CalendarDays size={14} />{showtime(show.data.startsAt)} · {show.data.format}</p></div></div><SeatMap seats={map.data.seats} layout={map.data.layout} selected={selected} disabled={busy || map.isError} onChange={(next) => { setError(''); dispatch({ type: 'SEATS_SELECTED', ids: next }); }} />{selected.length !== ids.length && <p className="notice" role="status">Trạng thái ghế đã thay đổi. Vui lòng kiểm tra lựa chọn.</p>}{error && <p className="error" role="alert">{error}</p>}{isMock && <details className="dev-tools"><summary>Tình huống chạy thử</summary><label htmlFor="hold-scenario" className="mt-3">Kết quả giữ ghế giả lập</label><select id="hold-scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}><option value="success">Giữ ghế thành công · 5 phút</option><option value="conflict">Ghế bị khách khác giữ</option><option value="expired">Giữ ghế chỉ 8 giây để thử hết hạn</option></select></details>}</section><QueryState query={menu}><ComboPicker menu={menu.data || []} value={state.comboItems} onChange={(items) => dispatch({ type: 'COMBOS_SELECTED', items })} disabled={busy} /></QueryState></div><Summary show={show.data} seats={selected} combos={comboLines} total={total + comboAmount}><div className="actions"><Button disabled={!selected.length || busy} onClick={hold}>{busy ? 'Đang giữ ghế…' : `Tiếp tục với ${selected.length} ghế`}</Button><Button variant="outline" onClick={() => navigate('/movies')}>Đổi suất chiếu</Button></div></Summary></div>}</QueryState></QueryState></>;
}
