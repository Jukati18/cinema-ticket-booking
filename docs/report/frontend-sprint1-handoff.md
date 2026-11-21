# Bàn giao frontend Sprint 1

Ngày 19/11/2026. Thực hiện local cho SCRUM-22, SCRUM-23 và SCRUM-24. Không push, tạo PR hoặc cập nhật trạng thái Jira.

## Kết quả và việc còn chờ

| Ticket | Đã thực hiện | Còn chờ |
|---|---|---|
| SCRUM-22 | UC01, UC02, phần FE UC05, user story/tiêu chí chấp nhận, bảng dữ liệu và đề xuất API | Template Phong, review nghiệp vụ, chốt hợp đồng với Việt/Phong |
| SCRUM-23 | React/Vite, Tailwind/shadcn, Router 8 lazy routes, Query 5, Context/reducer, API adapter, cấu hình và README | Review khung frontend cùng Lộc/Việt |
| SCRUM-24 | Chọn suất → ghế → contact → kết quả bằng mock; pending, thất bại, xung đột và hết hạn | OpenAPI chính thức và tích hợp API thật thuộc bước phối hợp tiếp theo |

## Kiểm tra đã chạy

- `npm run lint` trong apps/web: đạt.
- `npm test`: 18 test đạt, gồm reducer, quy tắc ghế đôi/countdown/schema, SeatMap và form checkout/lỗi server.
- `npm run build`: đạt; initial JS khoảng 112.41 KB gzip, CSS 4.65 KB gzip; có lazy chunks cho các route. Đây là số build, không phải điểm Lighthouse.
- `npx playwright test`: 4 kịch bản đạt (mock local). Có kiểm tra bố cục không tràn cả trang tại 360/768/1280 px cho danh sách, chọn ghế và checkout.
- Kịch bản trình duyệt: thành công + kiểm chứng form + refresh kết quả; xung đột ghế; hết hạn; thanh toán thất bại + checkout không hợp lệ.
- Đã xem ảnh sơ đồ mobile và trang kết quả desktop.
- `git diff --check`: không có lỗi whitespace (Git có cảnh báo chuyển LF/CRLF lockfile trên Windows).

Chưa kiểm tra toàn bộ services, Docker Compose, cloud, API thật, coverage backend hoặc Lighthouse. Không khẳng định đáp ứng toàn bộ đề đồ án chỉ dựa trên demo.

## Review và bàn giao

1. Đọc [SCRUM-22](scrum-22-catalog-customer.md).
2. Gửi [đề xuất giao tiếp](../api/frontend-backend-proposal.md) cho Việt/Phong để chốt từng dòng endpoint, field, enum và lỗi.
3. Việt/Phong cần quyết định cơ chế guest auth, bước payment và phục hồi idempotency trước khi chuyển sang API thật.
4. Khánh đối chiếu schema contact/PII và dữ liệu email; Lộc đối chiếu component/router và test.
5. Repo yêu cầu PR gắn từng ticket. Hiện thay đổi chưa commit; khi người dùng cho phép có thể tách commit/PR theo tài liệu, khung và luồng mock. Không push thẳng main.

## Chạy demo

```powershell
cd D:\WebProject\cinema-ticket-booking
npm run dev --prefix apps/web
```

Mở http://localhost:5173. Không cần bật database/backend để chạy mock. Mật khẩu hoặc tài khoản thật không cần thiết; dùng contact giả. Mục Tra cứu và các route auth/admin hiện là placeholder rõ ràng, chưa có chức năng thật.
