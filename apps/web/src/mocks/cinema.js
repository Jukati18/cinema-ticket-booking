import { ApiError } from '../lib/http';
import { combos } from './menu';
import { paymentMethods } from '../features/booking/payment-methods';
import { getRoomLayout } from './room-layouts';

export { default as movies } from './movies.json';
import movies from './movies.json';
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
export const cinemas = [
 { id: 'cinema-1', name: 'CineVibe Landmark 81 (IMAX)', city: 'TP. Hồ Chí Minh', formats: ['2D', 'IMAX Laser', '3D'] },
 { id: 'cinema-2', name: 'CineVibe Thảo Điền MegaMall', city: 'TP. Hồ Chí Minh', formats: ['2D', '3D', 'ScreenX 270°'] },
 { id: 'cinema-3', name: 'CineVibe Liễu Giai Hà Nội (Laser)', city: 'Hà Nội', formats: ['2D', 'Laser', '3D'] },
 { id: 'cinema-4', name: 'CineVibe Parkson Hải Phòng', city: 'Hải Phòng', formats: ['2D', '3D'] },
];
cinemas.push(
 { id: 'cinema-5', name: 'CineVibe Cầu Giấy', city: 'Hà Nội', formats: ['2D', '3D'] },
 { id: 'cinema-6', name: 'CineVibe Lê Chân', city: 'Hải Phòng', formats: ['2D', 'Laser'] },
 { id: 'cinema-7', name: 'CineVibe Hải Châu', city: 'Đà Nẵng', formats: ['2D', 'IMAX Laser', '3D'] },
 { id: 'cinema-8', name: 'CineVibe Sơn Trà', city: 'Đà Nẵng', formats: ['2D', '3D', 'ScreenX 270°'] },
);
export const showtimes = cinemas.flatMap((cinema, c) => Array.from({ length: 7 }, (_, day) => movies.flatMap((movie, i) => [17, 20, 9, 11, 13, 15, 22].map((hour, j) => {
 const date = new Date(tomorrow + 'T00:00:00+07:00'); date.setUTCDate(date.getUTCDate() + day);
 const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
 if (movie.releaseDate > dateKey) return null;
 const format = j % 3 === 0 ? '2D' : cinema.formats[1 + i % (cinema.formats.length - 1)];
 return { id: `show-${i + 1}-${j + 1}${c ? `-${cinema.id}` : ''}${day ? `-day-${day}` : ''}`, movieId: movie.id, cinemaId: cinema.id, cinemaName: cinema.name, roomId: `${cinema.id}-room-${i + 1}-${j + 1}`, roomName: `Phòng ${i * 7 + j + 1} · ${format}`, startsAt: `${dateKey}T${String(hour - (c % 2)).padStart(2, '0')}:30:00+07:00`, format, status: 'on_sale' };
}).filter(Boolean))).flat());
const pause = () => new Promise((resolve) => setTimeout(resolve, 220));
const storageKey = 'cinema-demo-db-v2';
function loadDb() {
  try { const value = JSON.parse(sessionStorage.getItem(storageKey)); if (value?.holds && value?.bookings) return value; } catch { /* Start a fresh demo when storage is unavailable. */ }
  return { holds: {}, bookings: {}, requests: {} };
}
function saveDb(db) { try { sessionStorage.setItem(storageKey, JSON.stringify(db)); } catch { /* Session storage is optional for the demo. */ } }
const seatIds = (showtimeId) => getRoomLayout(showtimeId).cells.filter((c) => c.kind === 'seat').flatMap((c) => c.seatIds);
function getMap(showtimeId, db) {
  return seatIds(showtimeId).map((id) => {
    let status = ['A3', 'A4', 'B7', 'C2'].includes(id) ? 'sold' : id === 'B3' ? 'held' : 'available';
    if (Object.values(db.bookings).some((b) => b.showtimeId === showtimeId && b.status === 'confirmed' && b.seatIds.includes(id))) status = 'sold';
    if (Object.values(db.holds).some((h) => h.showtimeId === showtimeId && Date.parse(h.expiresAt) > Date.now() && h.seatIds.includes(id))) status = 'held';
    const type = id[0] === 'G' ? 'couple' : ['E', 'F'].includes(id[0]) ? 'vip' : 'standard';
    return { id, row: id[0], number: Number(id.slice(1)), type, status, price: type === 'standard' ? 75000 : type === 'vip' ? 95000 : 110000, ...(type === 'couple' ? { coupleGroupId: `G-${Math.ceil(Number(id.slice(1)) / 2)}` } : {}) };
  });
}
function assertShowtime(id) { if (!showtimes.some((item) => item.id === id)) throw new ApiError('NOT_FOUND', 'Không tìm thấy suất chiếu'); }
export const mockApi = {
 async getCinemas() { await pause(); return cinemas; },
  async getCombos() { await pause(); return combos; },
  async completePayment(id, succeeded) {
    await pause(); const db = loadDb(); const b = db.bookings[id];
    if (!b) throw new ApiError('NOT_FOUND', 'Không tìm thấy đặt chỗ');
    if (b.status !== 'pending') return { id: b.id };
    const hold = db.holds[b.holdId];
    if (!hold || Date.parse(hold.expiresAt) <= Date.now()) { b.status = 'expired'; b.paymentStatus = 'failed'; }
    else { b.status = succeeded ? 'confirmed' : 'cancelled'; b.paymentStatus = succeeded ? 'succeeded' : 'failed'; }
    delete db.holds[b.holdId]; saveDb(db); return { id: b.id };
  },
  async lookupBooking({ reference, phone }) {
    await pause();
    const booking = Object.values(loadDb().bookings).find((item) => item.reference === reference.trim().toUpperCase() && item.contact?.phone === phone.trim());
    if (!booking) throw new ApiError('BOOKING_NOT_FOUND', 'Không tìm thấy đặt chỗ khớp mã và số điện thoại trong phiên này');
    return { id: booking.id };
  },
  async getMovies() { await pause(); return movies; },
  async getShowtimes(movieId) { await pause(); return showtimes.filter((item) => !movieId || item.movieId === movieId); },
  async getShowtime(id) { await pause(); assertShowtime(id); return { ...showtimes.find((item) => item.id === id), movie: movies.find((movie) => movie.id === showtimes.find((s) => s.id === id).movieId) }; },
  async getSeats(id) { await pause(); assertShowtime(id); return { showtimeId: id, seats: getMap(id, loadDb()), layout: getRoomLayout(id) }; },
  async createHold({ showtimeId, promoCode = '', seatIds: ids, comboItems = [], scenario = 'success' }) {
    await pause(); assertShowtime(showtimeId);
    if (!ids.length) throw new ApiError('INVALID_SEATS', 'Hãy chọn ít nhất một ghế');
    if (scenario === 'conflict') throw new ApiError('SEAT_ALREADY_HELD', 'Một ghế vừa được người khác giữ. Hãy chọn lại');
    const db = loadDb(); const map = getMap(showtimeId, db);
    if (new Set(ids).size !== ids.length || ids.some((id) => !map.some((s) => s.id === id && s.status === 'available'))) throw new ApiError('SEAT_ALREADY_HELD', 'Ghế không còn trống. Vui lòng tải lại sơ đồ');
    if (ids.some((id) => { const s = map.find((x) => x.id === id); return s.coupleGroupId && map.some((other) => other.coupleGroupId === s.coupleGroupId && !ids.includes(other.id)); })) throw new ApiError('INVALID_SEATS', 'Vui lòng chọn đủ cặp ghế đôi');
    const seen = new Set();
    const lines = comboItems.map(({ comboId, quantity }) => { const item = combos.find((c) => c.id === comboId); if (!item || seen.has(comboId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new ApiError('INVALID_COMBO', 'Combo hoặc số lượng chưa hợp lệ'); seen.add(comboId); return { ...item, quantity }; });
    const seatAmount = map.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
    const hold = { id: crypto.randomUUID(), showtimeId, seatIds: ids, combos: lines, expiresAt: new Date(Date.now() + (scenario === 'expired' ? 8000 : 300000)).toISOString(), seatAmount, totalAmount: seatAmount + lines.reduce((sum, c) => sum + c.quantity * c.price, 0) };
    if (promoCode && promoCode !== 'GIAM20K') throw new ApiError('INVALID_PROMO','Mã giảm giá không hợp lệ');
    hold.subtotalAmount=hold.totalAmount; hold.discountAmount=promoCode ? Math.min(20000,hold.totalAmount) : 0; hold.promoCode=promoCode; hold.totalAmount-=hold.discountAmount;
    db.holds[hold.id] = hold; saveDb(db); return hold;
  },
  async updateHoldPromo(id, promoCode) { await pause(); const db=loadDb(); const hold=db.holds[id]; if(!hold || Date.parse(hold.expiresAt)<=Date.now()) throw new ApiError('HOLD_EXPIRED','Thời gian giữ ghế đã hết'); if(promoCode && promoCode!=='GIAM20K') throw new ApiError('INVALID_PROMO','Mã giảm giá không hợp lệ'); hold.subtotalAmount ??= hold.totalAmount; hold.discountAmount=promoCode ? Math.min(20000,hold.subtotalAmount) : 0; hold.promoCode=promoCode; hold.totalAmount=hold.subtotalAmount-hold.discountAmount; saveDb(db); return hold; },
  async releaseHold(id) { await pause(); const db = loadDb(); delete db.holds[id]; saveDb(db); },
  async getHold(id) { await pause(); const hold = loadDb().holds[id]; if (!hold || Date.parse(hold.expiresAt) <= Date.now()) throw new ApiError('HOLD_EXPIRED', 'Thời gian giữ ghế đã hết'); return hold; },
  async createBooking({ holdId, contact, idempotencyKey, scenario = 'success', paymentMethod = 'momo', manualPayment = false }) {
    await pause(); const db = loadDb();
    if (db.requests[idempotencyKey]) return db.bookings[db.requests[idempotencyKey]];
    const hold = db.holds[holdId];
    if (!hold || Date.parse(hold.expiresAt) <= Date.now()) throw new ApiError('HOLD_EXPIRED', 'Thời gian giữ ghế đã hết. Vui lòng chọn lại');
    if (Object.values(db.bookings).some((b) => b.holdId === holdId)) throw new ApiError('BOOKING_EXISTS', 'Lượt giữ ghế này đã tạo đặt chỗ');
    if (!paymentMethods.some((m) => m.id === paymentMethod)) throw new ApiError('INVALID_PAYMENT_METHOD', 'Phương thức thanh toán không hợp lệ');
    const id = crypto.randomUUID();
    const booking = { id, holdId, showtimeId: hold.showtimeId, seatIds: hold.seatIds, totalAmount: hold.totalAmount, reference: `DEMO-${id.slice(0, 6).toUpperCase()}`, contact, status: 'pending', paymentStatus: 'pending', readyAt: Date.now() + 1800, scenario };
    Object.assign(booking, { subtotalAmount: hold.subtotalAmount, discountAmount: hold.discountAmount, promoCode: hold.promoCode, combos: hold.combos || [], paymentMethod, expiresAt: hold.expiresAt, manualPayment });
    db.bookings[id] = booking; db.requests[idempotencyKey] = id; saveDb(db); return booking;
  },
  async getBooking(id) {
    await pause(); const db = loadDb(); const booking = db.bookings[id];
    if (!booking) throw new ApiError('NOT_FOUND', 'Không tìm thấy đặt chỗ trong phiên demo này');
    if (booking.status === 'pending') {
      const hold = db.holds[booking.holdId];
      if (!hold || Date.parse(hold.expiresAt) <= Date.now()) { booking.status = 'expired'; booking.paymentStatus = 'failed'; }
      else if (!booking.manualPayment && Date.now() >= booking.readyAt) { booking.status = booking.scenario === 'failed' ? 'cancelled' : 'confirmed'; booking.paymentStatus = booking.scenario === 'failed' ? 'failed' : 'succeeded'; }
      if (booking.status !== 'pending') delete db.holds[booking.holdId];
      saveDb(db);
    }
    return { ...booking, showtime: showtimes.find((s) => s.id === booking.showtimeId), movie: movies.find((m) => m.id === showtimes.find((s) => s.id === booking.showtimeId)?.movieId) };
  },
};
