import { beforeEach, it, expect } from 'vitest';
import { mockApi } from './cinema';
beforeEach(() => sessionStorage.clear());
const contact = { fullName: 'Nguyễn An', email: 'an@example.com', phone: '0901234567' };
it('prices combos from the mock catalog, ignoring a caller-supplied price', async () => {
 const h = await mockApi.createHold({ showtimeId: 'show-1-1', seatIds: ['A1'], comboItems: [{ comboId: 'combo-cheese', quantity: 2, price: 1 }] });
 expect(h.totalAmount).toBe(285000); expect(h.combos[0].price).toBe(105000);
});
it('rejects invalid combo quantities before creating a hold', async () => {
 await expect(mockApi.createHold({ showtimeId: 'show-1-1', seatIds: ['A1'], comboItems: [{ comboId: 'combo-cheese', quantity: -1 }] })).rejects.toMatchObject({ code: 'INVALID_COMBO' });
 expect((await mockApi.getSeats('show-1-1')).seats.find((s) => s.id === 'A1').status).toBe('available');
});
it('keeps confirmed payment terminal when an old failure request is repeated', async () => {
 const h = await mockApi.createHold({ showtimeId: 'show-1-1', seatIds: ['A1'] });
 const b = await mockApi.createBooking({ holdId: h.id, contact, idempotencyKey: 'demo-test', manualPayment: true, paymentMethod: 'vnpay' });
 expect((await mockApi.getBooking(b.id)).status).toBe('pending');
 await mockApi.completePayment(b.id, true); await mockApi.completePayment(b.id, false);
 expect((await mockApi.getBooking(b.id)).status).toBe('confirmed');
});
it('refuses payment success for a booking whose hold has expired', async () => {
 const h = await mockApi.createHold({ showtimeId: 'show-1-1', seatIds: ['A1'] });
 const b = await mockApi.createBooking({ holdId: h.id, contact, idempotencyKey: 'demo-expired', manualPayment: true });
 const db = JSON.parse(sessionStorage.getItem('cinema-demo-db-v2')); db.holds[h.id].expiresAt = '2000-01-01T00:00:00Z'; sessionStorage.setItem('cinema-demo-db-v2', JSON.stringify(db));
 await mockApi.completePayment(b.id, true); expect((await mockApi.getBooking(b.id)).status).toBe('expired');
});
