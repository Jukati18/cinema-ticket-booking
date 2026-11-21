import { z } from 'zod';
// Provisional FE constraints. Align with shared BE schemas before integration.
export const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Nhập họ tên từ 2 ký tự').max(100, 'Họ tên tối đa 100 ký tự'),
  email: z.email('Email chưa đúng định dạng').max(254, 'Email quá dài'),
  phone: z.string().trim().regex(/^0\d{9}$/, 'Nhập số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0'),
});
