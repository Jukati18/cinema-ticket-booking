import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Ticket, Phone, Search, ShieldCheck, Mail, CircleHelp } from 'lucide-react';
import { cinemaApi, isMock } from '../lib/cinema-api';
import { contactSchema } from '../features/booking/schema';
import { Button } from '../components/ui/button';

const schema = z.object({ reference: z.string().trim().min(3, 'Nhập mã đặt chỗ từ 3 ký tự').max(64, 'Mã đặt chỗ tối đa 64 ký tự').transform((value) => value.toUpperCase()), phone: contactSchema.shape.phone });
export function Component() {
 const navigate = useNavigate(); const [error, setError] = useState('');
 const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { reference: '', phone: '' } });
 async function lookup(values) {
  setError('');
  try { const booking = await cinemaApi.lookupBooking(values); navigate(`/bookings/${encodeURIComponent(booking.id)}/result`); }
  catch (e) { setError(e.message); }
 }
 return <><div className="ticket-tabs"><Link to="/movies">Phim & lịch chiếu</Link><span className="flex items-center gap-2"><Search size={17} />Tra cứu vé</span></div><section className="panel lookup-panel"><div className="lookup-heading"><span className="badge blue"><Search size={16} />CỔNG TRA CỨU VÉ TRỰC TUYẾN</span><h1>Tra cứu thông tin đặt vé</h1><p className="muted">Nhập mã đặt chỗ và số điện thoại đã dùng khi đặt vé để xem lại thông tin.</p></div><form onSubmit={handleSubmit(lookup)} noValidate><div className="lookup-fields"><div className="field"><label htmlFor="reference">Mã đặt chỗ <span aria-hidden="true">*</span></label><div className="input-icon"><Ticket size={18} /><input id="reference" placeholder="VD: DEMO-ABC123" autoComplete="off" maxLength={64} spellCheck={false} required {...register('reference')} aria-invalid={!!errors.reference} aria-describedby={errors.reference ? 'reference-error' : undefined} /></div>{errors.reference && <p id="reference-error" className="field-error">{errors.reference.message}</p>}</div><div className="field"><label htmlFor="lookup-phone">Số điện thoại đặt vé <span aria-hidden="true">*</span></label><div className="input-icon"><Phone size={18} /><input id="lookup-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="VD: 0901234567" required {...register('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'lookup-phone-error' : undefined} /></div>{errors.phone && <p id="lookup-phone-error" className="field-error">{errors.phone.message}</p>}</div></div>{error && <p className="error" role="alert">{error}</p>}<div className="lookup-actions"><span className="muted flex items-center gap-2 text-xs"><ShieldCheck size={18} className="cyan shrink-0" />Cần khớp cả mã đặt chỗ và số điện thoại</span><Button type="submit" disabled={isSubmitting}><Search size={17} />{isSubmitting ? 'Đang tra cứu…' : 'Tra cứu vé ngay'}</Button></div></form>{isMock && <p className="notice">Bản chạy thử chỉ tìm được vé đã đặt trong cùng tab trình duyệt này. Hãy dùng mã DEMO và số điện thoại bạn vừa nhập khi đặt vé; không có vé thật hoặc email thật.</p>}<div className="lookup-help"><div><h2><CircleHelp size={18} className="cyan" />Chưa có mã đặt chỗ?</h2><p>Hoàn tất một lượt đặt vé để nhận mã ở trang kết quả.</p><Link to="/movies">Chọn phim & đặt vé →</Link></div><div><h2><Mail size={18} className="amber" />Không tìm thấy vé?</h2><p>Kiểm tra lại mã và số điện thoại. Trong bản demo, dữ liệu thuộc phiên của từng tab và chưa được lưu trên máy chủ.</p></div></div></section></>;
}
