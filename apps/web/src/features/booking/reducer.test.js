import { describe, it, expect } from 'vitest';
import { bookingReducer, initialBooking } from './reducer';
import { remainingSeconds } from '../../lib/format';
import { contactSchema } from './schema';
import { toggleSeats } from './seats';
describe('booking reducer', () => {
  it('selects a showtime', () => expect(bookingReducer(initialBooking, { type: 'SHOWTIME_SELECTED', id: 's1' }).showtimeId).toBe('s1'));
  it('resets seats and hold when changing showtime', () => expect(bookingReducer({ ...initialBooking, showtimeId: 's1', seatIds: ['A1'], hold: { id: 'h1' } }, { type: 'SHOWTIME_SELECTED', id: 's2' })).toEqual({ ...initialBooking, showtimeId: 's2' }));
  it('preserves selection when same showtime is selected', () => { const state = { ...initialBooking, showtimeId: 's1', seatIds: ['A1'] }; expect(bookingReducer(state, { type: 'SHOWTIME_SELECTED', id: 's1' })).toBe(state); });
  it('invalidates old hold after changing seats', () => expect(bookingReducer({ ...initialBooking, hold: { id: 'h1' } }, { type: 'SEATS_SELECTED', ids: ['A2'] }).hold).toBeNull());
  it('stores hold', () => expect(bookingReducer(initialBooking, { type: 'HOLD_CREATED', hold: { id: 'h' } }).hold.id).toBe('h'));
  it('clears selection on expiration', () => expect(bookingReducer({ ...initialBooking, seatIds: ['A1'], hold: { id: 'h' } }, { type: 'HOLD_EXPIRED' }).seatIds).toEqual([]));
  it('stores contact', () => expect(bookingReducer(initialBooking, { type: 'CONTACT_SAVED', contact: { fullName: 'An' } }).contact.fullName).toBe('An'));
  it('stores booking', () => expect(bookingReducer(initialBooking, { type: 'BOOKING_CREATED', booking: { id: 'b' } }).booking.id).toBe('b'));
  it('resets draft', () => expect(bookingReducer({ ...initialBooking, showtimeId: 's' }, { type: 'RESET' })).toEqual(initialBooking));
  it('ignores unknown actions', () => expect(bookingReducer(initialBooking, { type: 'OTHER' })).toBe(initialBooking));
});
describe('checkout rules', () => {
  it('never shows a negative countdown', () => expect(remainingSeconds('2026-01-01T00:00:00Z', Date.parse('2026-01-02T00:00:00Z'))).toBe(0));
  it('uses the returned absolute expiry', () => expect(remainingSeconds('2026-01-01T00:01:00Z', Date.parse('2026-01-01T00:00:00Z'))).toBe(60));
  it('rejects invalid contact', () => expect(contactSchema.safeParse({ fullName: '', email: 'wrong', phone: 'abc' }).success).toBe(false));
  it('accepts a valid demo contact', () => expect(contactSchema.safeParse({ fullName: 'Nguyễn An', email: 'an@example.com', phone: '0901234567' }).success).toBe(true));
  it('selects a couple together and deselects together', () => { const seats = [{ id: 'E1', status: 'available', coupleGroupId: 'e' }, { id: 'E2', status: 'available', coupleGroupId: 'e' }]; expect(toggleSeats([], seats[0], seats)).toEqual(['E1', 'E2']); expect(toggleSeats(['E1', 'E2'], seats[0], seats)).toEqual([]); });
  it('does not select half a couple when its partner is held', () => { const seats = [{ id: 'E1', status: 'available', coupleGroupId: 'e' }, { id: 'E2', status: 'held', coupleGroupId: 'e' }]; expect(toggleSeats([], seats[0], seats)).toEqual([]); });
});
