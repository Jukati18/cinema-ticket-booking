# Use case và User story — Chức năng khách hàng

Người phụ trách: Dương Châu Phát (M4 — Frontend khách hàng).
Ngày soạn: 19/11/2026. Cập nhật và đối chiếu: 20/11/2026.
Trạng thái: bản soạn để nhóm review, chưa phải đặc tả API hoặc ERD đã được phê duyệt.

## 1. Danh sách use case trong phạm vi

| ID | Tên use case | Actor chính | Module |
|---|---|---|---|
| UC01 | Tìm phim/suất chiếu (autocomplete, lọc rạp/ngày/định dạng/khung giờ) | Guest, Customer | Catalog |
| UC02 | Xem chi tiết phim và lịch chiếu | Guest, Customer | Catalog |
| UC05 | Nhập thông tin và thanh toán | Guest, Customer | Booking + Payment |

Cả ba use case trên thuộc mức **Chi tiết** tuần này theo tài liệu nhóm; với UC05, bản này chỉ đặc tả phần giao diện. Guest là khách chưa đăng nhập; Customer là khách đã đăng ký và xác thực email. Danh sách toàn hệ thống và phân công các thành viên khác giữ tại tài liệu chung, không sao chép thành phạm vi sở hữu của Châu Phát.

## 2. UC01 — Tìm phim và suất chiếu

| Mục | Nội dung |
|---|---|
| ID | UC01 |
| Actor chính | Guest, Customer |
| Module | Catalog |
| Mục tiêu | Tìm phim hoặc suất chiếu đáp ứng nhu cầu của khách |
| Tiền điều kiện | Khách có thể truy cập khu vực công khai; không bắt buộc đăng nhập |
| Kích hoạt | Khách nhập từ khóa hoặc thay đổi bộ lọc lịch chiếu |
| Đầu vào | Từ khóa; cinemaId tùy chọn; ngày chiếu; định dạng; khung giờ; thông tin phân trang theo hợp đồng API |

### Luồng chính
1. Khách mở danh sách phim hoặc lịch chiếu. Hệ thống tải dữ liệu phim, danh sách rạp và các lựa chọn lọc.
2. Khách nhập tên phim; giao diện lấy gợi ý autocomplete, hiển thị tên phim và poster để phân biệt kết quả.
3. Khách chọn gợi ý bằng chuột hoặc bàn phím để mở UC02; hoặc tiếp tục tìm và lọc suất chiếu.
4. Khách chọn rạp, ngày, định dạng và/hoặc khung giờ. Không chọn rạp cụ thể có nghĩa là Tất cả rạp, không tự suy ra vị trí khách.
5. Giao diện gửi các điều kiện hợp lệ, lưu từ khóa/bộ lọc trong URL và đưa trang kết quả về trang 1 khi đổi điều kiện.
6. Hệ thống trả danh sách phù hợp cùng dữ liệu phân trang. Giao diện hiển thị kết quả, tên rạp rõ ràng và giờ theo Asia/Ho_Chi_Minh.
7. Khách mở phim hoặc chọn suất; suất được chuyển tiếp bằng showtimeId tới UC03.

### Luồng thay thế và nhánh lỗi
- **Từ khóa rỗng:** hiển thị danh sách theo điều kiện lọc hiện có, không báo lỗi nhập liệu.
- **Không có kết quả:** hiển thị thông báo và thao tác xóa/đổi bộ lọc, không hiển thị suất của điều kiện cũ như kết quả mới.
- **Đổi từ khóa nhanh:** trì hoãn gọi gợi ý hợp lý; hủy hoặc bỏ qua phản hồi cũ để không ghi đè kết quả từ khóa mới.
- **Điều kiện URL sai:** chuẩn hóa hoặc hiển thị lỗi theo quy tắc API được nhóm chốt; không gửi giá trị sai tới backend.
- **Lỗi mạng/dịch vụ:** hiển thị lỗi, cho thử lại và giữ điều kiện tìm kiếm hợp lệ.
- **Bàn phím:** phím lên/xuống chọn gợi ý, Enter mở kết quả, Escape đóng gợi ý; focus nhìn thấy được.

### Hậu điều kiện
- **Thành công:** khách nhìn thấy kết quả đúng điều kiện hoặc chuyển tới phim/suất đã chọn; URL phản ánh điều kiện tìm kiếm.
- **Không có kết quả/thất bại:** không tạo đặt chỗ, không giữ ghế và không thay đổi dữ liệu nghiệp vụ; khách có thể sửa điều kiện hoặc thử lại.

### Trường dữ liệu màn hình cần
- Phim gợi ý/danh sách: id, title, posterUrl, durationMinutes, genres, ageRating nếu có.
- Rạp: id, name, city; định dạng hợp lệ theo rạp nếu API cung cấp.
- Suất: id, movieId, cinemaId, cinemaName, startsAt, format, language nếu có, status.
- Danh sách: items và thông tin page, pageSize, total theo envelope được duyệt.
- Lỗi: code, message; requestId nếu có.

## 3. UC02 — Xem chi tiết phim và lịch chiếu

| Mục | Nội dung |
|---|---|
| ID | UC02 |
| Actor chính | Guest, Customer |
| Module | Catalog |
| Mục tiêu | Hiểu thông tin phim, xem lịch và chọn suất phù hợp |
| Tiền điều kiện | Có movieId từ danh sách hoặc đường dẫn trực tiếp; không bắt buộc đăng nhập |
| Kích hoạt | Khách chọn poster/tên phim hoặc truy cập trang chi tiết |
| Đầu vào | movieId; rạp, ngày, định dạng, khung giờ nếu khách lọc lịch |

### Luồng chính
1. Giao diện tải chi tiết phim và lịch chiếu; hiển thị trạng thái đang tải.
2. Hiển thị tên, poster, thể loại, thời lượng, nội dung, phân loại tuổi; ngày khởi chiếu, đạo diễn, diễn viên, quốc gia và ngôn ngữ khi có dữ liệu.
3. Khách đọc thông tin; có thể mở trailer nếu có đường dẫn hợp lệ, đóng modal và quay về trang hiện tại.
4. Khách chọn Chọn suất chiếu. Giao diện đưa khách tới phần lịch chiếu của chính bộ phim đó.
5. Hệ thống hiển thị các suất theo rạp và định dạng/ngôn ngữ; giờ tăng dần trong mỗi nhóm. Khách có thể thay đổi bộ lọc.
6. Khách chọn suất đang mở bán. Giao diện chuyển showtimeId tới UC03 và hiển thị đúng phim, rạp, phòng, giờ tại trang chọn ghế.
7. Nếu đang có lựa chọn/giữ ghế ở suất khác, giao diện yêu cầu xác nhận trước khi bỏ lựa chọn và phối hợp backend giải phóng lượt giữ cũ theo hợp đồng.

### Luồng thay thế và nhánh lỗi
- **Không tìm thấy phim:** hiển thị trang không tìm thấy, có đường về danh sách phim.
- **Thiếu thông tin phụ:** ghi Đang cập nhật hoặc ẩn trường không có dữ liệu; không tự bịa diễn viên, quốc gia, trailer hoặc đánh giá.
- **Không có lịch phù hợp:** giữ thông tin phim, thông báo rõ và cho đổi bộ lọc.
- **Suất đã ngừng bán/đã bắt đầu:** không cho tiếp tục với trạng thái đã biết; backend kiểm tra lại khi giữ ghế để xử lý trường hợp trạng thái vừa đổi.
- **Lỗi tải:** hiển thị lỗi và thử lại; không làm mất bộ lọc hợp lệ.
- **Hủy đổi suất:** giữ nguyên lựa chọn/lượt giữ còn hiệu lực, không tự xóa.

### Hậu điều kiện
- **Thành công:** khách xem đúng dữ liệu phim; nếu chọn suất, UC03 nhận đúng showtimeId. Chỉ xem phim hoặc bấm chọn suất chưa đồng nghĩa giữ ghế thành công.
- **Thất bại/hủy thao tác:** không phát sinh booking hoặc thanh toán; dữ liệu giữ ghế trước đó chỉ thay đổi sau thao tác được xác nhận và phản hồi hợp lệ của backend.

### Trường dữ liệu màn hình cần
- Chi tiết phim: id, title, posterUrl, synopsis, durationMinutes, genres, ageRating; releaseDate, director, cast, country, language, trailerUrl nếu có.
- Rạp: id, name, city, address nếu có.
- Suất: id, movieId, cinemaId, cinemaName, roomId, roomName, startsAt, format, language nếu có, status.
- Trạng thái suất dùng enum nhóm chốt; các trạng thái nghiệp vụ trong đề gồm on_sale, started, completed.

## 4. UC05 — Nhập thông tin và thanh toán: phần giao diện

| Mục | Nội dung |
|---|---|
| ID | UC05 |
| Actor chính | Guest, Customer |
| Actor hệ thống phối hợp | Payment service |
| Module | Booking + Payment |
| Phân công | Châu Phát: giao diện và dữ liệu màn hình; Việt: xử lý thanh toán; Phong: đặt chỗ/lượt giữ ghế |
| Tiền điều kiện | Có lượt giữ ghế còn hiệu lực từ UC03; combo từ UC04 nếu khách chọn |
| Kích hoạt | Khách tiếp tục từ bước chọn ghế và bắp nước |
| Đầu vào | holdId, thông tin khách, phương thức thanh toán, khóa chống gửi lặp theo hợp đồng API |

### Luồng chính
1. Giao diện lấy lượt giữ và hiển thị phim, rạp, phòng, suất, ghế, combo, chi tiết tiền từ backend cùng thời gian giữ còn lại.
2. Guest nhập họ tên, email và số điện thoại. Customer có thể dùng thông tin hồ sơ điền sẵn và chỉnh thông tin nhận vé theo quy tắc nhóm chốt.
3. Khách chọn một phương thức thanh toán giả lập. Giao diện kiểm chứng các trường bắt buộc bằng react-hook-form và zod, dùng quy tắc thống nhất với backend.
4. Khách xác nhận tiếp tục. Giao diện khóa gửi lặp và gửi yêu cầu tạo đặt chỗ từ holdId, thông tin nhận vé, phương thức và idempotency key; không dùng giá do frontend tính làm nguồn tin cậy.
5. Backend kiểm tra lượt giữ, tính tiền và trả định danh đặt chỗ/giao dịch cùng hướng dẫn thanh toán.
6. Giao diện hiển thị màn thanh toán tương ứng với phương thức đã chọn, không yêu cầu chọn lại. Nếu QR, số tiền hiển thị phải khớp giao dịch backend trả về.
7. Giao diện theo dõi trạng thái đặt chỗ/giao dịch bằng cơ chế nhóm chốt. Trạng thái chờ được thể hiện là đang chờ, không suy ra thành công từ URL hoặc thao tác bấm nút.
8. Khi core xác nhận đặt chỗ thành công, giao diện hiển thị kết quả và mã đặt chỗ. Việc tạo/gửi vé QR qua email chuyển tiếp UC06 của Khánh Lê; không gọi trực tiếp dịch vụ notification từ SPA.

### Luồng thay thế và nhánh lỗi
- **Form sai:** hiện lỗi cạnh trường, đưa focus tới trường sai đầu tiên, chưa gọi tạo booking.
- **Hold hết hạn/không thuộc suất:** chặn gửi, thông báo và cho về chọn ghế. Backend quyết định việc nhả ghế.
- **Giá hoặc ghế thay đổi:** lấy dữ liệu backend mới, yêu cầu khách kiểm tra lại trước khi tiếp tục; không tự ghi đè lượt giữ của người khác.
- **Thanh toán thất bại/hủy/hết hạn:** hiện đúng trạng thái và đường xử lý phù hợp. Quyền thử lại, tạo giao dịch mới hoặc giữ ghế lại do backend quyết định.
- **Timeout sau gửi:** tra cứu theo booking hoặc idempotency key trước khi tạo lại, tránh đơn trùng.
- **Đổi phương thức:** quay về bước chọn phương thức, giữ thông tin khách và lượt giữ còn hiệu lực; giao dịch cũ được xử lý theo quy tắc payment service, không tạo hai giao dịch cùng có thể thanh toán.
- **Refresh/mở link trực tiếp:** lấy lại trạng thái từ backend; kiểm tra quyền xem và giới hạn thông tin cá nhân theo hợp đồng, không chỉ dựa vào ID trên URL.

### Hậu điều kiện
- **Thành công:** core đã xác nhận booking; giao diện hiển thị đúng mã và số tiền, chuyển tiếp UC06. Frontend không tự cập nhật database hoặc xác nhận webhook.
- **Đang chờ:** giữ đúng trạng thái pending và khả năng xem lại giao dịch trong thời hạn hợp lệ, không cấp vé hợp lệ sớm.
- **Thất bại/hủy/hết hạn:** không hiển thị vé hợp lệ. Giao diện thông báo và đồng bộ trạng thái từ backend; nhả ghế, hoàn tiền và xử lý giao dịch thuộc các use case backend tương ứng.

### Trường dữ liệu màn hình cần
- Hold: id, showtimeId, seatIds, combos, expiresAt, chi tiết giá và totalAmount.
- Contact: fullName, email, phone.
- Yêu cầu tạo booking: holdId, contact, paymentMethod, idempotency key theo vị trí được OpenAPI quy định.
- Booking/giao dịch: id, reference, status, paymentStatus, totalAmount, paymentMethod, expiresAt và dữ liệu hướng dẫn thanh toán giả lập theo phương thức.
- Tóm tắt: phim, rạp, phòng, giờ, ghế và combo theo snapshot của backend.
- Lỗi: code, message, fieldErrors nếu có; không trả password/token hoặc thông tin cá nhân của khách khác.

Tên trường là đề xuất frontend, không phải schema đã được duyệt. Enum và quan hệ giữa trạng thái booking/payment phải thống nhất với Việt và Phong.

## 5. User story thuộc Châu Phát

Giữ ID và nội dung theo danh sách chung, bổ sung tiêu chí chấp nhận. Đây là tiêu chí yêu cầu, không phải checklist khẳng định code đã đáp ứng.

### US01 — Gợi ý tìm phim

**Là khách, tôi muốn gõ tên phim và thấy gợi ý ngay, để tìm nhanh.**

Tiêu chí chấp nhận:
1. Khi nhập từ khóa có phim phù hợp, hiện gợi ý tên và poster; chọn gợi ý mở đúng UC02.
2. Có trạng thái đang tải, không có kết quả và lỗi kèm thử lại.
3. Phản hồi của từ khóa cũ không được thay thế kết quả từ khóa mới.
4. Có thể chọn bằng bàn phím; Enter mở và Escape đóng danh sách.
5. Xóa từ khóa khôi phục danh sách theo bộ lọc còn hiệu lực, không làm thay đổi dữ liệu đặt vé nhanh.

### US02 — Lọc suất chiếu

**Là khách, tôi muốn lọc suất chiếu theo rạp, ngày, định dạng, khung giờ, để chọn suất phù hợp.**

Tiêu chí chấp nhận:
1. Các bộ lọc kết hợp đồng thời; kết quả thỏa tất cả điều kiện được chọn.
2. Mặc định Tất cả rạp; không tự lọc theo vị trí khách. Kết quả nhiều rạp có tên rạp phân biệt rõ.
3. Ngày và giờ hiển thị/lọc theo Asia/Ho_Chi_Minh; định dạng chỉ có các lựa chọn hợp lệ.
4. Điều kiện được lưu trong URL, tải lại trang giữ điều kiện hợp lệ; đổi bộ lọc đưa trang kết quả về trang 1.
5. Giờ tăng dần trong từng nhóm rạp/định dạng; chỉ suất mở bán mới có thể tiếp tục đặt.
6. Không có kết quả phải có thông báo và thao tác đổi/xóa bộ lọc. Lỗi tải không được ngụy trang thành kết quả rỗng.

### US03 — Xem chi tiết phim

**Là khách, tôi muốn xem chi tiết phim (nội dung, thời lượng, thể loại), để quyết định xem.**

Tiêu chí chấp nhận:
1. Mở từ danh sách hoặc URL trực tiếp đều hiển thị đúng phim theo movieId.
2. Có tên, poster, nội dung, thời lượng, thể loại; thông tin bổ sung có dữ liệu thì hiển thị, thiếu thì không tự bịa.
3. Hiện lịch của chính phim đó và cho chọn suất phù hợp để sang UC03.
4. Phim không tồn tại có trạng thái không tìm thấy; phim không có suất vẫn xem được thông tin và đổi điều kiện lịch.
5. Trailer nếu có mở/đóng được và không làm mất lựa chọn hợp lệ trên trang.
6. Việc xem phim/chọn suất không tự tạo booking hoặc xác nhận giữ ghế.

## 6. Tham chiếu phối hợp, không đổi chủ sở hữu

| Nội dung tham chiếu | Người phụ trách trong tài liệu nhóm | Vai trò của Châu Phát |
|---|---|---|
| UC03, UC04, UC07, UC22; US04–US10 | Phong | Hiển thị sơ đồ, combo, trạng thái, form tra cứu; dùng dữ liệu và quy tắc đã chốt |
| UC08; US11 | Phong; Việt phụ trách hoàn tiền | UI hủy vé ở sprint tương ứng, không tự viết chính sách hoàn tiền |
| UC05 phần thanh toán, UC23; US12, US13, US15 | Việt | UI chọn phương thức, theo dõi và hiển thị kết quả; không sở hữu xác minh webhook |
| UC06; US14 | Khánh Lê | Hiển thị kết quả gửi vé/QR do hệ thống cung cấp |
| Xác thực, hồ sơ, lịch sử | Khánh Lê | Tích hợp UI ở các sprint tương ứng |

US09, US12 và US13 không được tính là user story riêng do Châu Phát phụ trách trong SCRUM-22; phần giao diện liên quan được mô tả trong UC05. Lộc phụ trách frontend Admin/Staff và QA theo kế hoạch chung.

## 7. Dữ liệu và điểm cần nhóm chốt

- ID là giá trị định danh do API cung cấp; frontend không suy ra quyền sở hữu từ ID.
- Tiền là số nguyên VND; thời điểm dùng ISO 8601 có offset/UTC; ngày lọc theo Việt Nam.
- Backend xác định tên bảng, quan hệ, ràng buộc và dữ liệu lưu trữ. Các tên trường trên chỉ biểu diễn nhu cầu DTO của màn hình.
- Phong và Việt xác nhận envelope, phân trang, enum, lỗi, quy tắc giữ ghế, tính tiền, quyền xem booking guest, idempotency và vòng đời giao dịch.
- Khánh Lê đối chiếu validation/schema dùng chung, dữ liệu hồ sơ và kết quả gửi email/QR.
- Cuối Sprint 1 nhóm cần chốt OpenAPI và ERD theo kế hoạch. Bản [đề xuất giao tiếp frontend–backend](../api/frontend-backend-proposal.md) chỉ là tài liệu phối hợp, không thay thế bản được duyệt.

## Phụ lục — Tài liệu kỹ thuật liên quan

Các tài liệu sau hỗ trợ triển khai SCRUM-23/24, không thay thế nội dung use case/user story ở trên:
- [Đề xuất giao tiếp frontend–backend](../api/frontend-backend-proposal.md).
- [Bàn giao frontend Sprint 1](frontend-sprint1-handoff.md).
