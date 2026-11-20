# Đề xuất giao tiếp frontend và backend cho luồng khách

SCRUM-22/23/24 · Dương Châu Phát · 19/11/2026.

**Chưa thống nhất và chưa phải OpenAPI v1.** Đây là bản bàn giao nhu cầu màn hình để Việt/Phong review. Mock không phải backend hoặc giao dịch thực tế.

## File cần bàn giao cho backend

1. Tài liệu này: endpoint, request, response, lỗi và câu hỏi cần chốt.
2. `apps/web/src/lib/cinema-api.js`: toàn bộ adapter và công tắc mock/API.
3. `apps/web/src/lib/http.js`: đọc envelope `{ data }` và lỗi `{ error }`.
4. `apps/web/src/features/booking/schema.js`: kiểm chứng form tạm, cần đồng bộ shared schema.
5. `apps/web/src/mocks/cinema.js`: fixture/hành vi demo để tham khảo.
6. `docs/report/scrum-22-catalog-customer.md`: nghiệp vụ và tiêu chí chấp nhận.

Nếu backend đổi đường dẫn/tên trường, sửa mapping trong adapter, không rải fetch hoặc mapping ở từng trang.

## Quy ước đề xuất

- ID opaque dạng string; tiền integer VND; thời điểm ISO 8601 có offset/UTC; FE hiển thị Asia/Ho_Chi_Minh.
- FE gửi ID và lựa chọn. Backend quyết định giá, trạng thái ghế, hạn hold và thanh toán thành công.
- Thành công: `{ "data": ... }`. Hiện movies/showtimes nhận mảng trực tiếp tại data.
- Nếu chốt phân trang `{ data: { items, page, pageSize, total } }`, cần đổi adapter và màn danh sách. Demo nhỏ hiện chưa phân trang.
- Lỗi: `{ "error": { "code": "HOLD_EXPIRED", "message": "Thời gian giữ ghế đã hết", "fieldErrors": {}, "requestId": "..." } }`.
- fieldErrors tạm là tên trường → chuỗi. Timeout FE 12 giây; timeout tạo booking không chứng minh chưa tạo thành công.

## Endpoint và DTO đề xuất

| Màn hình | Method/path | FE gửi | data trả về |
|---|---|---|---|
| Danh sách | GET /movies | Bản cuối cần q, cinemaId, date, format, timeFrom, timeTo, page/pageSize | Movie[]; cần chốt phân trang |
| Chi tiết phim | GET /movies/:id | movieId | Movie detail; chưa có trang/adapter này trong demo tuần 1 |
| Lịch chiếu | GET /showtimes | movieId và các bộ lọc | Showtime[] |
| Tóm tắt suất | GET /showtimes/:id | showtimeId | Showtime kèm movie |
| Chọn ghế | GET /showtimes/:id/seats | showtimeId | { showtimeId, seats: Seat[] } |
| Giữ ghế | POST /holds | { showtimeId, seatIds } | Hold |
| Khôi phục checkout | GET /holds/:id | holdId + quyền phiên guest cần chốt | Hold hợp lệ |
| Chọn lại ghế | DELETE /holds/:id | holdId + quyền sở hữu | { released: true }; adapter hiện yêu cầu JSON có data |
| Tạo đặt chỗ | POST /bookings | { holdId, contact }, header Idempotency-Key | Booking và bước thanh toán cần chốt |
| Kết quả | GET /bookings/:id | bookingId + quyền xem | Booking kèm showtime, movie |

DTO hiện dùng:

```text
Movie: id, title, synopsis, durationMinutes, genres: string[], posterUrl
Showtime: id, movieId, cinemaId, cinemaName, roomName, startsAt, format, status
Seat: id, row, number, type (standard/vip/couple), status (available/held/sold), price, coupleGroupId?
Hold: id, showtimeId, seatIds: string[], expiresAt, totalAmount
Contact: fullName, email, phone
Booking: id, reference, showtimeId, seatIds, totalAmount, status, paymentStatus, showtime, movie
```

Không cần trả toàn bộ contact ở trang kết quả. BE phải giới hạn PII theo quyền.

## Ví dụ khách đặt hai vé

1. FE đọc GET /showtimes/show-1-1/seats. Backend trả danh sách ghế còn trống/đã giữ/đã bán.
2. FE gửi POST /holds:

```json
{ "showtimeId": "show-1-1", "seatIds": ["A1", "A2"] }
```

Backend trả 201, ví dụ:

```json
{ "data": { "id": "hold-opaque", "showtimeId": "show-1-1", "seatIds": ["A1", "A2"], "expiresAt": "2026-11-22T10:35:00Z", "totalAmount": 150000 } }
```

Backend giữ tất cả hoặc không giữ ghế nào; kiểm tra tranh chấp và ghế đôi. FE đếm theo expiresAt, không có quyền gia hạn bằng đồng hồ client.

3. FE gửi POST /bookings với header Idempotency-Key là UUID:

```json
{ "holdId": "hold-opaque", "contact": { "fullName": "Nguyễn An", "email": "an@example.com", "phone": "0901234567" } }
```

Không gửi giá tin cậy, trạng thái confirmed hoặc API key/HMAC của service. Backend trả pending và hướng dẫn thanh toán.

4. Việt/Phong cần chốt core có tạo payment rồi trả URL hay FE phải gọi bước riêng. Mock hiện tự mô phỏng kết quả sau khoảng 2 giây; chưa có tích hợp payment thật.
5. FE đọc booking mỗi 1 giây khi pending, dừng ở terminal. Tần suất và giới hạn thời gian polling cần chốt trước khi nối thật.
6. Core nhận webhook, kiểm chứng và cập nhật; notification gửi email qua lời gọi server-to-server. SPA không gọi notification trực tiếp.
7. FE chỉ hiện thành công nếu core trả confirmed; không tin success=true trong URL.

## Mã lỗi và cách xử lý

| HTTP đề xuất | Code | Frontend |
|---|---|---|
| 400/422 | VALIDATION_ERROR | Gắn fieldErrors vào form |
| 404 | NOT_FOUND | Báo không tồn tại, cho trở về |
| 409 | SEAT_ALREADY_HELD | Báo xung đột, làm mới ghế, chọn lại |
| 409/410 | HOLD_EXPIRED | Chặn checkout, xóa hold, chọn lại |
| 409 | BOOKING_EXISTS | Tra cứu booking cũ trước khi tạo lại |
| 429 | RATE_LIMITED | Chờ theo Retry-After cần chốt |
| 5xx/timeout | lỗi hệ thống | Cho thử lại an toàn, không kết luận chưa tạo booking |

Trạng thái đề xuất: booking pending/confirmed/cancelled/expired; payment pending/succeeded/failed. Mock ánh xạ payment failed → booking cancelled; cần nhóm duyệt.

## Câu hỏi nhóm cần chốt

| Quyết định | Phối hợp |
|---|---|
| Endpoint, envelope, pagination, query params, enum | Việt + Phong + Phát |
| Chứng minh quyền guest bằng cookie hay token; CORS/CSRF phù hợp | Khánh + Phong + Việt |
| Thời hạn hold, giới hạn ghế, ghế lẻ/đôi, giá trên mỗi chỗ/cặp | Phong |
| Payment initiation, retry, idempotency, timeout và nhả ghế | Việt + Phong |
| Contact bắt buộc, dữ liệu email và che PII | Khánh |
| Ai nối thật: SCRUM-24 ghi Việt, SCRUM-18 đang giao Phong | Nhóm |

## Đổi sang API thật

### Layout phòng chiếu theo tọa độ

GET /showtimes/:id/seats đề xuất trả thêm layout độc lập với trạng thái ghế:

```json
{
  "layout": {
    "id": "room-layout-1", "rows": 9, "columns": 12,
    "rowLabels": [{ "label": "A", "row": 1 }],
    "cells": [
      { "kind": "seat", "row": 1, "column": 1, "seatIds": ["A1"] },
      { "kind": "seat", "row": 7, "column": 1, "columnSpan": 2, "seatIds": ["E1", "E2"] },
      { "kind": "aisle", "row": 0, "column": 5, "columnSpan": 2, "rowSpan": 9, "label": "Lối đi dọc" },
      { "kind": "exit", "row": 8, "column": 0, "columnSpan": 3, "label": "Lối vào" }
    ]
  }
}
```

Tọa độ zero-based; span mặc định 1; ô không có cell là khoảng sàn không đặt ghế, không phải ghế bán hết. Backend kiểm tra bounds, không chồng cell, seatId có thật và duy nhất. Cặp đôi có seatIds của hai chỗ liền nhau, span 2; cả hai Seat vẫn có cùng coupleGroupId trong seats[] và được chọn/giữ nguyên cặp. Seat status không được dùng để định nghĩa khoảng trống.

Mock hiện có ba layout khác nhau theo phòng, bao gồm các khoảng trống bất đối xứng. Layout ổn định theo phòng/suất; chỉ trạng thái ghế đổi khi poll. FE vẫn cuộn ngang trong vùng sơ đồ ở mobile để giữ đúng quan hệ vị trí; không tự dồn ghế làm mất lối đi. Nếu BE chưa trả layout, fallback hiển thị ghế theo hàng và không tự bịa vị trí lối đi.

### Bổ sung combo và phương thức thanh toán theo yêu cầu người dùng

- GET /combos đề xuất trả data là mảng { id, name, description, price, image }.
- POST /holds gửi thêm comboItems: [{ comboId, quantity }]. FE không gửi giá tin cậy. Demo xác minh ID/số lượng 1–10 và tính lại từ menu mock.
- Hold trả seatAmount, combos (snapshot tên/giá/số lượng) và totalAmount gồm ghế + combo. Đây là snapshot demo, cần BE xác nhận combo thuộc booking hay hold.
- POST /bookings gửi thêm paymentMethod: momo/vnpay/napas/card. Booking trả combos, paymentMethod, expiresAt.
- Bản mock có route /bookings/:id/payment, QR chứa CINEVIBE_DEMO_ONLY + UUID + số tiền + phương thức. Không phải VietQR/MoMo/VNPAY payload thật, không có tài khoản nhận tiền.
- createBooking với manualPayment là cờ nội bộ mock, không gửi tới API thật. Mock không tự xác nhận sau vài giây; người thử bấm nút mô phỏng để kiểm tra thành công/thất bại. Thanh toán pending bị hết hạn khi hold hết hạn. Kết quả terminal không bị đảo bởi yêu cầu lặp.
- completePayment chỉ có trong mock. Không xây endpoint client tự xác nhận thanh toán thật. BE cần cung cấp initiation/checkoutUrl/QR payload từ payment service và cập nhật core bằng webhook đã xác minh.
- Thẻ nội địa/quốc tế chỉ có màn mô phỏng, không có trường số thẻ/CVV/OTP. Tần suất poll và quy tắc retry/idempotency phải chốt theo hợp đồng thật.

Bổ sung theo yêu cầu người dùng: trang /lookup đã hoạt động trong mock. Adapter đề xuất POST /bookings/lookup với body { reference, phone }, trả { data: { id } } khi khớp cả hai; không khớp trả lỗi chung BOOKING_NOT_FOUND. Backend cần xác nhận endpoint, rate limit, quyền guest khi mở kết quả và hạn chế PII. Không đưa số điện thoại vào query string. Mock chỉ tìm trong sessionStorage cùng tab, không phải cơ chế bảo mật production.

1. Chốt OpenAPI v1, auth guest, payment initiation và phục hồi idempotency qua refresh.
2. Sửa cinema-api.js/http.js theo schema; đồng bộ contactSchema với BE.
3. Đặt VITE_DATA_SOURCE=api trong root .env; VITE_API_URL là URL core. Restart Vite/rebuild Docker.
4. Kiểm thử lại bằng backend thật; adapter hiện là đề xuất, không chạy được với core chỉ có /health.

## Giới hạn demo

- Mock lưu sessionStorage một tab gồm contact giả; không dùng dữ liệu thật; không đồng bộ nhiều người/tab.
- Hold demo 5 phút; nhánh hết hạn 8 giây; poll ghế 5 giây. Không có WebSocket.
- Chỉ tìm tên phim; autocomplete, filter đầy đủ và phân trang thuộc bước hoàn thiện sau.
- SeatMap demo đều 8 ghế/hàng; cần DTO tọa độ/layout cho phòng thật.
- Combo, chi tiết phim đầy đủ, tra cứu/hủy, auth và email QR thuộc sprint sau.
- Chưa có guest authorization, payment initiation thật và phục hồi key gửi booking qua refresh. Không coi bản này là đủ điều kiện production.


### Cụm rạp (bổ sung)
Frontend có bộ chọn cụm rạp ở header và Đặt vé nhanh, đồng bộ qua URL `cinemaId`. Đề xuất `GET /cinemas` trả mảng `{ id, name, city }`; `GET /showtimes` phải trả `cinemaId`, `cinemaName`, `roomId`, `roomName`. Hiện frontend lọc theo `cinemaId` trên danh sách nhận được; backend cần hỗ trợ bộ lọc này khi phân trang. Bốn cụm rạp và lịch chiếu hiện là dữ liệu mock theo thiết kế Stitch, chưa phải dữ liệu backend.
