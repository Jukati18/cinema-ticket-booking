import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contactSchema } from '../features/booking/schema';
import { useBooking } from '../features/booking/context';
import { cinemaApi, isMock } from '../lib/cinema-api';
import { Steps, Summary, Timer, QueryState } from '../components/BookingParts';
import { Button } from '../components/ui/button';
import { paymentMethods } from '../features/booking/payment-methods';
import { UserRound, Mail, Phone, ContactRound, Zap, WalletCards, ShieldCheck } from 'lucide-react';
export function Component() {
  const { showtimeId } = useParams(); const [params] = useSearchParams(); const navigate = useNavigate(); const client = useQueryClient(); const { state, dispatch } = useBooking();
  const holdId = params.get('hold') || ''; const [expired, setExpired] = useState(false); const [error, setError] = useState(''); const [scenario, setScenario] = useState('success'); const [returning, setReturning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const key = useRef(crypto.randomUUID()); const submitting = useRef(false);
  const form = useForm({ resolver: zodResolver(contactSchema), defaultValues: state.contact || { fullName: '', email: '', phone: '' } });
  const show = useQuery({ queryKey: ['showtime', showtimeId], queryFn: () => cinemaApi.getShowtime(showtimeId) });
  const hold = useQuery({ queryKey: ['hold', holdId], queryFn: () => cinemaApi.getHold(holdId), retry: false });
  const onExpire = useCallback(() => { setExpired(true); dispatch({ type: 'HOLD_EXPIRED' }); }, [dispatch]);
  async function submit(contact) {
    if (submitting.current || expired) return; submitting.current = true; setError('');
    try { const booking = await cinemaApi.createBooking({ holdId, contact, idempotencyKey: key.current, scenario, paymentMethod, manualPayment: isMock }); dispatch({ type: 'CONTACT_SAVED', contact }); dispatch({ type: 'BOOKING_CREATED', booking }); navigate(`/bookings/${booking.id}/${isMock ? 'payment' : 'result'}`, { replace: true }); }
    catch (e) { setError(e.message); if (e.code === 'HOLD_EXPIRED') onExpire(); Object.entries(e.fieldErrors || {}).forEach(([name, message]) => form.setError(name, { message: String(message) })); }
    finally { submitting.current = false; }
  }
  async function updatePromo(code) { try { await cinemaApi.updateHoldPromo(holdId,code); await client.invalidateQueries({queryKey:['hold',holdId]}); } catch(e) {setError(e.message);} }
  async function back() {
    setReturning(true); setError('');
    try { await cinemaApi.releaseHold(holdId); dispatch({ type: 'HOLD_EXPIRED' }); await client.invalidateQueries({ queryKey: ['seats', showtimeId] }); navigate(`/booking/${showtimeId}/seats`, { replace: true }); }
    catch (e) { setError(e.message); } finally { setReturning(false); }
  }
  const invalid = expired || hold.isError || (hold.data && hold.data.showtimeId !== showtimeId);
  return <><Steps step={3} /><div className="page-heading"><p className="eyebrow">Đặt vé trực tuyến / Thanh toán & nhập thông tin</p><h1>Xác nhận đặt vé</h1><p className="muted">Bạn có thể đặt vé mà không cần tài khoản.</p></div>{invalid ? <section className="panel"><h2>Không có lượt giữ ghế hợp lệ</h2><p role="alert">{expired ? 'Thời gian giữ ghế đã hết. Hãy chọn lại ghế.' : hold.error?.message || 'Lượt giữ ghế không thuộc suất chiếu này.'}</p><Button onClick={back} disabled={returning}>Trở lại chọn ghế</Button>{error && <p role="alert">{error}</p>}</section> : <QueryState query={show}><QueryState query={hold}>{show.data && hold.data && <div className="booking-grid"><section className="panel"><Timer expiresAt={hold.data.expiresAt} onExpire={onExpire} /><div className="form-heading"><h2><ContactRound size={24} className="muted" />Thông tin người nhận vé</h2><span className="badge">Khách vãng lai</span></div><div className="guest-note"><Zap size={22} className="amber shrink-0" /><div><strong>Đặt vé không cần đăng nhập tài khoản</strong><p>Kiểm tra họ tên, số điện thoại và email trước khi tiếp tục.</p></div></div><form id="checkout-contact" onSubmit={form.handleSubmit(submit)} noValidate><div className="contact-grid">{[['fullName', 'Họ và tên', 'text', 'name'], ['email', 'Email nhận vé', 'email', 'email'], ['phone', 'Số điện thoại', 'tel', 'tel']].map(([name, label, type, autoComplete]) => <div className="field" key={name}><label htmlFor={name}>{label} <span aria-hidden="true">*</span></label><div className="input-icon">{name === 'fullName' ? <UserRound size={17} /> : name === 'email' ? <Mail size={17} /> : <Phone size={17} />}<input id={name} type={type} autoComplete={autoComplete} required {...form.register(name)} aria-invalid={!!form.formState.errors[name]} aria-describedby={form.formState.errors[name] ? `${name}-error` : undefined} /></div><p className="field-error" id={`${name}-error`}>{form.formState.errors[name]?.message}</p></div>)}</div><fieldset className="payment-methods"><legend><WalletCards size={22} />Chọn phương thức thanh toán</legend><p className="muted text-sm">Tất cả phương thức trong bản này đều là mô phỏng.</p>{paymentMethods.map((method) => <label className="method-option" key={method.id}><input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} disabled={form.formState.isSubmitting} /><span className="method-logo" style={{ background: method.color }}>{method.label}</span><span><strong>{method.name}</strong><small>{method.description}</small></span><ShieldCheck size={20} className="cyan ml-auto shrink-0" /></label>)}</fieldset><p className="notice">{isMock ? 'Bản chạy thử không gửi email và không thu tiền. Dùng thông tin giả để kiểm tra giao diện.' : 'Kiểm tra thông tin và tổng tiền trước khi tiếp tục thanh toán.'}</p>{error && <p className="error" role="alert">{error}</p>}</form>{isMock && <details className="dev-tools"><summary>Tình huống chạy thử</summary><label htmlFor="payment-scenario" className="mt-3">Kết quả thanh toán giả lập</label><select id="payment-scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}><option value="success">Thành công</option><option value="failed">Thất bại</option></select></details>}</section><Summary show={show.data} seats={hold.data.seatIds} combos={hold.data.combos || []} total={hold.data.subtotalAmount ?? hold.data.totalAmount} discount={hold.data.discountAmount} appliedCode={hold.data.promoCode || ''} onPromoChange={updatePromo}><div className="actions"><Button type="submit" form="checkout-contact" disabled={form.formState.isSubmitting || expired || returning}>{form.formState.isSubmitting ? 'Đang xử lý…' : isMock ? 'Thanh toán giả lập' : 'Tiếp tục thanh toán'}</Button><Button type="button" variant="outline" disabled={form.formState.isSubmitting || returning} onClick={back}>Chọn lại ghế</Button></div></Summary></div>}</QueryState></QueryState>}</>;
}
