import { Heart, DoorOpen, Check, X, Hourglass } from 'lucide-react';
import { toggleSeats } from '../features/booking/seats';

// Compatibility for an API without a physical layout: never invent an aisle.
function fallbackLayout(seats) {
 const labels = [...new Set(seats.map((s) => s.row))];
 const columns = Math.max(1, ...labels.map((row) => seats.filter((s) => s.row === row).length));
 return { rows: labels.length, columns, rowLabels: labels.map((label, row) => ({ label, row })), cells: labels.flatMap((label, row) => seats.filter((s) => s.row === label).map((seat, column) => ({ kind: 'seat', row, column, seatIds: [seat.id] }))) };
}
export default function SeatMap({ seats, layout, selected, onChange, disabled = false }) {
 const room = layout || fallbackLayout(seats);
 const seatColumns = new Set(room.cells.filter((c) => c.kind === 'seat').flatMap((c) => Array.from({ length: c.columnSpan || 1 }, (_, i) => c.column + i)));
 const columnTracks = Array.from({ length: room.columns }, (_, i) => seatColumns.has(i) ? 36 : 12);
 const rowTracks = Array.from({ length: room.rows }, (_, i) => room.cells.some((c) => c.kind === 'seat' && c.row === i) ? 36 : room.cells.some((c) => c.kind === 'exit' && c.row === i) ? 28 : 8);
 const boardWidth = 32 + columnTracks.reduce((sum, width) => sum + width, 0) + (room.columns + 1) * 6;
 return <><div className="screen" /><p className="screen-label">Màn hình</p><div className="seat-scroll physical-room-scroll" tabIndex={0} role="region" aria-label="Sơ đồ phòng chiếu, có thể cuộn ngang"><div className="physical-room" style={{ minWidth: `${boardWidth}px` }}><div className="auditorium-grid" role="group" aria-label="Sơ đồ chọn ghế" style={{ gridTemplateColumns: `16px ${columnTracks.map((width) => `${width}px`).join(' ')} 16px`, gridTemplateRows: rowTracks.map((height) => `${height}px`).join(' ') }}>
 {room.rowLabels?.map(({ label, row }) => <span key={`left-${label}`} className="row-label" style={{ gridColumn: 1, gridRow: row + 1 }}>{label}</span>)}
 {room.rowLabels?.map(({ label, row }) => <span key={`right-${label}`} className="row-label" style={{ gridColumn: room.columns + 2, gridRow: row + 1 }}>{label}</span>)}
 {room.cells.map((cell, index) => {
  const style = { gridColumn: `${cell.column + 2} / span ${cell.columnSpan || 1}`, gridRow: `${cell.row + 1} / span ${cell.rowSpan || 1}` };
  if (cell.kind === 'aisle') return <div key={`aisle-${index}`} className="floor-aisle" style={style} aria-hidden="true" />;
  if (cell.kind === 'exit') return <div key={`exit-${index}`} className="room-exit" style={style}><DoorOpen size={14} />{cell.label}</div>;
  if (cell.kind !== 'seat') return null;
  const group = cell.seatIds.map((id) => seats.find((s) => s.id === id));
  if (!group.length || group.some((s) => !s)) return null;
  const first = group[0]; const couple = group.length === 2 && group.every((s) => s.type === 'couple');
  const sold = group.some((s) => s.status === 'sold'); const held = group.some((s) => s.status === 'held');
  const unavailable = group.some((s) => s.status !== 'available'); const pressed = group.every((s) => selected.includes(s.id));
  return <button key={cell.seatIds.join('-')} type="button" style={style} className={`seat physical-seat ${first.type} ${couple ? 'couple-pair' : ''} ${sold ? 'is-sold' : held ? 'is-held' : ''}`} disabled={disabled || unavailable} aria-label={`Ghế ${cell.seatIds.join('–')}, ${couple ? 'ghế đôi' : first.type === 'vip' ? 'VIP' : 'thường'}, ${unavailable ? 'không khả dụng' : 'còn trống'}`} aria-pressed={pressed} onClick={() => onChange(toggleSeats(selected, first, seats))}>{sold ? <X size={15} aria-hidden="true"/> : held ? <Hourglass size={13} aria-hidden="true"/> : couple ? <><Heart size={15} aria-hidden="true" /><span>{first.row}{group.map((s) => s.number).join('–')}</span>{pressed && <Check size={13} aria-hidden="true" />}</> : pressed ? <><Check size={14} aria-hidden="true" /><span className="seat-id">{first.id}</span></> : first.id}</button>;
 })}</div></div></div><p className="seat-map-hint">Khoảng trống thể hiện lối đi hoặc vị trí không đặt ghế. Trên màn hình nhỏ, vuốt ngang để xem toàn bộ phòng.</p><div className="legend"><span><i className="dot" />Ghế thường</span><span><i className="dot vip" />VIP</span><span><Heart size={13} />Ghế đôi</span><span><i className="dot selected" />Đang chọn</span><span><i className="dot unavailable" />Không khả dụng</span></div><p className="muted text-sm">Ghế đôi được chọn theo cặp. Giá hiển thị tính trên mỗi chỗ ngồi.</p></>;
}
