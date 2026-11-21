# Frontend khách hàng

React 19 + Vite, JavaScript/JSX, React Router 8 Data Router, TanStack Query 5, Tailwind 4, shadcn/ui Button, Context/useReducer, react-hook-form và zod 4.

## Chạy local

Từ thư mục repo:

```powershell
npm ci --prefix apps/web
npm run dev --prefix apps/web
```

Mở http://localhost:5173. Mặc định là mock, không cần backend/PostgreSQL. Phim và poster là minh họa, không thu tiền/gửi email. Dùng contact giả (an@example.com).

Vite đọc root `.env` bằng envDir `../..`. Không cần .env để dùng mock mặc định. VITE_DATA_SOURCE=mock và VITE_API_URL được mô tả ở root .env.example. Không nhúng bí mật trong VITE_* hoặc commit .env.

## Route

| Route | Nội dung |
|---|---|
| /, /movies | Chọn phim/suất; tìm tên qua query q |
| /booking/:showtimeId/seats | Ghế thường/VIP/đôi; giữ ghế |
| /booking/:showtimeId/checkout?hold=... | Form guest và đếm ngược |
| /bookings/:bookingId/result | Poll pending và kết quả |
| /lookup | Tra cứu mã đặt chỗ + số điện thoại, chạy mock cùng phiên tab |
| /login, /register, /profile | Trang rỗng dành cho sprint sau |
| /admin | Trang rỗng để Lộc tiếp quản |
| Route khác | Không tìm thấy |

## Tổ chức code và state

- routes/router.jsx: route objects, layout, lazy routes.
- pages/: màn hình; không gọi fetch trực tiếp.
- lib/cinema-api.js: adapter; lib/http.js: envelope/lỗi/timeout.
- mocks/cinema.js: fixture, hold và payment giả lập trong sessionStorage một tab.
- features/booking/: reducer, provider và schema form.
- components/ui/button.jsx: sinh bằng shadcn CLI, chỉnh token và kích thước chạm.
- components/SeatMap.jsx và BookingParts.jsx: sơ đồ, tiến trình, tóm tắt, timer, loading/error.

TanStack Query giữ server state; URL giữ bộ lọc/ID; Context giữ draft; react-hook-form giữ input. Refresh checkout đọc lại hold theo ID, không coi Context là bằng chứng quyền sở hữu. Cơ chế guest authorization thật chưa có, cần chốt với BE.

## Thử các tình huống

Sơ đồ hiện nhận layout tọa độ theo phòng: lối đi dọc/ngang, cửa vào/ra, ô trống không có ghế. Thử show-1-1, show-2-1, show-3-1 để xem ba bố cục khác nhau. Ghế đôi hiển thị một ô rộng có tim (E1–2), chọn/bỏ chọn cả cặp. Mobile cuộn trong sơ đồ để giữ nguyên vị trí vật lý.

Cập nhật: chọn combo ở trang ghế, điều chỉnh số lượng; chọn MoMo/VNPAY/thẻ nội địa/thẻ quốc tế ở checkout. Sau khi gửi form, mở /bookings/:id/payment để xem QR demo hoặc màn mô phỏng thẻ. Bấm mô phỏng thành công/thất bại để chuyển sang kết quả. QR không chứa tài khoản nhận tiền, không dùng để chuyển tiền thật. Các dòng mô tả bản cũ chưa có combo bên dưới đã được thay thế.

Chọn phim/suất → chọn ghế → Tiếp tục → nhập thông tin → Thanh toán giả lập → chờ xác nhận.

Mở “Tình huống chạy thử” tại sơ đồ để thử xung đột ghế hoặc hold 8 giây. Ở checkout có lựa chọn thanh toán thất bại. Các điều khiển này chỉ có ở mock, không gửi qua adapter API thật.

## Kiểm tra

```powershell
npm run lint --prefix apps/web
npm test --prefix apps/web
npm run build --prefix apps/web
cd apps/web
npx playwright install chromium
npx playwright test
```

Playwright tự mở dev server. Đây là E2E mock local, chưa thay thế kiểm thử toàn hệ thống bằng Docker Compose/API thật của Lộc.

## Bàn giao

Giao diện khách hàng hiện được chuyển sang thiết kế CineVibe lấy trực tiếp qua MCP Stitch. [Nguồn màn hình, token và giới hạn](../../docs/report/stitch-customer-ui.md). CSS: src/stitch.css; ảnh local: public/stitch; font được self-host. Admin/Staff và các tính năng sprint sau chưa triển khai.

- SCRUM-22: [use case/user story](../../docs/report/scrum-22-catalog-customer.md), còn chờ template/review nhóm.
- SCRUM-23: khung SPA, router, UI, query/reducer và cấu hình adapter.
- SCRUM-24: bốn màn hình mock và nhánh lỗi. Chưa nối backend/payment/notification.
- [Đề xuất giao tiếp FE–BE](../../docs/api/frontend-backend-proposal.md): endpoint, gửi/nhận, lỗi, quyết định cần chốt và file cần sửa khi tích hợp.

Chưa triển khai autocomplete/filter đầy đủ, auth, hủy vé hoặc email QR. Combo, tra cứu và chọn phương thức thanh toán hiện chạy bằng mock; chưa nối hệ thống thật. SeatMap demo là phòng đều 8 ghế/hàng; cần layout DTO cho phòng thật. Cần chốt guest auth, bước payment và phục hồi idempotency qua refresh trước khi dùng API thật.
