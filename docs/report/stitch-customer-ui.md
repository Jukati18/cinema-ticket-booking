# Giao diện khách hàng theo Stitch

Ngày đối chiếu 19/11/2026. Nguồn trực tiếp qua MCP Stitch, project `9620295992814181764` Cinema Ticket Booking System.

## Màn hình đã dùng

| Giao diện | Desktop screen ID | Mobile screen ID |
|---|---|---|
| Trang chủ và lịch chiếu | cfb83df5b3ed48b3b4f660fd8ecea186 | 39c409aeece644099422d7a931e3d52d |
| Chọn ghế | e5b80275589f4e989ef0df25d479660c | b9653835e11c462a8985b6af3eeabcfe |
| Thông tin và thanh toán | a070514122534c52a3c84428662f114c | 3612864334324c7b8be9a7067e275f86 |
| Kết quả và Digital Pass | 742e32d52444455d9f71e8b7e3cf1085 | 365fa65730964c96a5558d14de285fed |

HTML cả 8 màn được đọc qua download_file, ảnh desktop được đối chiếu trực tiếp. Không thay đổi project/screen trên Stitch.

## Token và kích thước

Cập nhật typography theo yêu cầu người dùng: thay Plus Jakarta Sans bằng Oswald 600 cho tiêu đề lớn/phim và Noto Sans 400–700 cho nội dung/form. Tham khảo phong cách rạp tại https://cinestar.com.vn/; không sao chép font độc quyền. Bỏ tracking âm trên tiêu đề, tăng line-height và cỡ chữ form; self-host đủ Latin/Vietnamese. Lint/build và hai bài browser test liên quan đến responsive/luồng đặt vé/tra cứu đều đạt sau thay đổi.

- Surface #10131a; panel thấp #191b23; panel/input #1d1f27; raised #272a32; border #32353d.
- Accent #e11d48, chữ chính #e1e2ec, chữ phụ #e5bdbe, cyan #4cd7f6, amber #ffb95f.
- Font Plus Jakarta Sans, self-host Latin/Vietnamese qua @fontsource, không cần Google Fonts khi chạy.
- Khung nội dung tối đa 1280 px, desktop padding 40 px, gutter 24 px; header desktop 80 px.
- Mobile padding 16 px, header 64 px; headline 30 px ở hero và 28 px ở trang thao tác.
- Canvas nguồn desktop 2560 px/mobile 780 px được chuyển thành layout responsive, không scale toàn bộ HTML thành ảnh.
- Tái sử dụng shadcn Button, route lazy, Query, reducer và form; CSS nằm tại apps/web/src/stitch.css.

## Giới hạn theo SCRUM-24

Cập nhật mới theo yêu cầu mở rộng của người dùng: đã thêm combo bắp/nước, số lượng, tổng tiền; 4 phương thức MoMo/VNPAY/NAPAS/thẻ quốc tế; trang payment với QR demo cho ví, màn mô phỏng cho thẻ, xác nhận/hủy, giữ nguyên hết hạn và hiển thị món trên kết quả. Các câu ghi combo/phương thức chưa triển khai ở bản gốc dưới đây đã được thay thế bởi cập nhật này. Vẫn chưa có thanh toán thật, QR vé/check-in thật, voucher hoặc email/SMS thật. Kiểm tra: 23 unit/component tests và 10 E2E mock đạt, gồm cả 4 phương thức, tổng tiền combo và nhả ghế khi hủy.

Cập nhật sau yêu cầu bổ sung: trang /lookup đã có giao diện và tra cứu mock theo mã + số điện thoại trong cùng phiên tab; không còn placeholder. Lint/build và 2 kịch bản trình duyệt liên quan đều đạt, gồm sai/đúng số điện thoại, mã không phân biệt chữ hoa, kiểm chứng form và bố cục 360/768/1280 px. Các giới hạn tra cứu nêu trong bản gốc bên dưới chỉ còn áp dụng cho backend thật.

Giữ cấu trúc hình ảnh, màu, font, hero, card lịch chiếu, màn chiếu cyan, ghế theo loại, cột summary và Digital Pass. Đây là bản triển khai responsive theo thiết kế và phạm vi ticket, không phải bản sao pixel-perfect của mọi nội dung trên canvas.

- Không triển khai Admin/Staff của Lộc.
- Không thêm combo, voucher, loyalty, thanh toán MoMo/VNPAY thật, QR check-in thật, gửi lại SMS/email hoặc hủy/tra cứu vé. Các nội dung này trong thiết kế vượt phạm vi demo tuần đầu hoặc chưa có backend.
- Thanh toán chỉ có cổng giả lập đúng luồng hiện tại; không trình bày chứng nhận bảo mật, email đã gửi hoặc giao dịch thật khi chưa có.
- Fixture phim chuyển sang Dune, Mai và Godzilla để đồng nhất thế giới hình ảnh Stitch. Một asset Panda trong Stitch có ảnh trống; dùng asset Godzilla có sẵn trong cùng thiết kế thay thế.
- Sơ đồ vẫn là phòng mock 5 hàng x 8 ghế; không biến sơ đồ minh họa 12 ghế/hàng thành ràng buộc dữ liệu mới.
- Thời hạn giữ ghế vẫn 5 phút (8 giây trong tình huống thử), không đổi thành 10 phút chỉ vì canvas ghi như vậy.
- Giữ dữ liệu và tính giá ở adapter mock; payload và hợp đồng backend không bị thay đổi bởi việc đổi giao diện.

## Bàn giao

Kiểm tra sau khi đổi giao diện: lint và production build đạt; 19 test unit/component đạt. Thêm regression test cho tình huống phim tải xong trước lịch chiếu. Kiểm thử trình duyệt bao gồm 4 màn hình ở 360/768/1280 px, thành công/refresh, xung đột ghế, hết hạn và thanh toán thất bại. Chưa đo Lighthouse hoặc tích hợp backend thật.

- Màu/kích thước: apps/web/src/stitch.css.
- Header/footer và điều hướng: components/CustomerLayout.jsx.
- Các trang: pages/CatalogPage.jsx, SeatsPage.jsx, CheckoutPage.jsx, ResultPage.jsx.
- Tóm tắt/timer: components/BookingParts.jsx.
- Ảnh từ HTML Stitch lưu local tại public/stitch, không cần API key để hiển thị ảnh.
- Bản xem thử: http://127.0.0.1:5173/movies, chạy npm run dev --prefix apps/web tại repo.
- Không commit, push, tạo PR hoặc cập nhật Jira trong lần làm này.
