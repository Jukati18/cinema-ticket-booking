import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { ShieldCheck, CreditCard } from 'lucide-react';
import { cinemaApi, isMock } from '../lib/cinema-api';
import { paymentMethods } from '../features/booking/payment-methods';
import { Steps, Summary, QueryState, Timer } from '../components/BookingParts';
import { Button } from '../components/ui/button';
import { money } from '../lib/format';

export function Component() {
 const { bookingId } = useParams(); const navigate = useNavigate(); const client = useQueryClient();
 const [qr, setQr] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
 const booking = useQuery({ queryKey: ['booking', bookingId], queryFn: () => cinemaApi.getBooking(bookingId), refetchInterval: 2000, retry: 1 });
 const data = booking.data; const method = paymentMethods.find((m) => m.id === data?.paymentMethod) || paymentMethods[0];
 const hasQr = method.id === 'momo' || method.id === 'vnpay';
 useEffect(() => { let active = true; if (data?.id && isMock && hasQr) QRCode.toDataURL(`CINEVIBE_DEMO_ONLY|${data.id}|${data.totalAmount}|${method.id}`, { width: 256, margin: 3, errorCorrectionLevel: 'M' }).then((value) => { if (active) setQr(value); }).catch(() => { if (active) setError('Không tạo được mã QR demo'); }); return () => { active = false; }; }, [data?.id, data?.totalAmount, method.id, hasQr]);
 const expire = useCallback(() => { client.invalidateQueries({ queryKey: ['booking', bookingId] }); }, [client, bookingId]);
 async function finish(succeeded) {
  if (busy || !isMock) return; setBusy(true); setError('');
  try { await cinemaApi.completePayment(bookingId, succeeded); await client.invalidateQueries({ queryKey: ['booking', bookingId] }); navigate(`/bookings/${bookingId}/result`, { replace: true }); }
  catch (e) { setError(e.message); } finally { setBusy(false); }
 }
 return <><Steps step={3} /><div className="page-heading"><p className="eyebrow">Cổng thanh toán mô phỏng</p><h1>{method.name}</h1><p className="muted">Không chuyển tiền thật. Không nhập thông tin ngân hàng hoặc thẻ thật.</p></div><QueryState query={booking}>{data && <div className="booking-grid"><section className="panel demo-payment"><span className="badge red">DEMO · KHÔNG CÓ GIÁ TRỊ THANH TOÁN</span><h2 className="mt-6">{data.status === 'pending' ? hasQr ? 'Quét mã thanh toán minh họa' : 'Xác nhận giao dịch mô phỏng' : 'Giao dịch đã có kết quả'}</h2>{data.status === 'pending' && data.expiresAt && <Timer expiresAt={data.expiresAt} onExpire={expire} />}{hasQr ? <div className="demo-qr">{qr ? <img src={qr} width="256" height="256" alt="Mã QR demo, không thể chuyển tiền" /> : <p role="status">Đang tạo QR demo…</p>}<p>QR DEMO · KHÔNG QUÉT BẰNG ỨNG DỤNG NGÂN HÀNG</p></div> : <div className="demo-card"><CreditCard size={48} /><h3>{method.label} · Bản chạy thử</h3><p>Không cần nhập số thẻ, CVV hoặc OTP. Dùng nút bên dưới để mô phỏng kết quả.</p></div>}<p className="payment-amount">{money(data.totalAmount)}</p><p className="muted text-sm">Mã đặt chỗ: <strong>{data.reference}</strong></p>{error && <p role="alert" className="error">{error}</p>}{data.status === 'pending' && isMock ? <div className="actions justify-center"><Button disabled={busy} onClick={() => finish(data.scenario !== 'failed')}>{busy ? 'Đang xử lý…' : data.scenario === 'failed' ? 'Mô phỏng thanh toán thất bại' : 'Mô phỏng thanh toán thành công'}</Button><Button variant="outline" disabled={busy} onClick={() => finish(false)}>Mô phỏng thất bại / Hủy</Button></div> : <Button onClick={() => navigate(`/bookings/${bookingId}/result`, { replace: true })}>Xem kết quả đặt vé</Button>}<p className="notice"><ShieldCheck size={18} className="inline mr-2" />QR chỉ chứa định danh demo và số tiền minh họa; không có số tài khoản nhận tiền. Khi nối payment service thật, backend phải xác nhận kết quả qua webhook.</p></section><Summary show={{ ...data.showtime, movie: data.movie }} seats={data.seatIds} combos={data.combos || []} total={data.subtotalAmount ?? data.totalAmount} discount={data.discountAmount} appliedCode={data.promoCode} locked /></div>}</QueryState></>;
}
