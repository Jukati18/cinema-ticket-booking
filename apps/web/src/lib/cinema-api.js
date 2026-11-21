import { request } from './http';
import { mockApi } from '../mocks/cinema';
export const isMock = import.meta.env.VITE_DATA_SOURCE !== 'api';
// Provisional endpoints: review docs/api/frontend-backend-proposal.md before switching.
const realApi = {
 updateHoldPromo: (id,promoCode) => request(`/holds/${encodeURIComponent(id)}/promotion`, {method:'PATCH',body:JSON.stringify({promoCode})}),
 getCinemas: () => request('/cinemas'),
  getCombos: () => request('/combos'),
  lookupBooking: ({ reference, phone }) => request('/bookings/lookup', { method: 'POST', body: JSON.stringify({ reference, phone }) }),
  getMovies: () => request('/movies'),
  getShowtimes: (movieId) => request(`/showtimes${movieId ? `?movieId=${encodeURIComponent(movieId)}` : ''}`),
  getShowtime: (id) => request(`/showtimes/${encodeURIComponent(id)}`),
  getSeats: (id) => request(`/showtimes/${encodeURIComponent(id)}/seats`),
  getHold: (id) => request(`/holds/${encodeURIComponent(id)}`),
  createHold: ({ showtimeId, seatIds, comboItems }) => request('/holds', { method: 'POST', body: JSON.stringify({ showtimeId, seatIds, comboItems }) }),
  releaseHold: (id) => request(`/holds/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  createBooking: ({ holdId, contact, idempotencyKey, paymentMethod }) => request('/bookings', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ holdId, contact, paymentMethod }) }),
  getBooking: (id) => request(`/bookings/${encodeURIComponent(id)}`),
};
export const cinemaApi = isMock ? mockApi : realApi;
