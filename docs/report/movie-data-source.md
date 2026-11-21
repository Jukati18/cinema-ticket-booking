# Nguồn dữ liệu phim

Nhập ngày 19/11/2026 từ https://m.touchcinema.com/phim bằng scripts/import-movies.mjs. Chạy thủ công từ gốc repo: node scripts/import-movies.mjs. Không crawl khi khách mở web.

10 phim đầu tiên trong danh sách công khai (8 ở mục đang chiếu, 2 ở mục sắp chiếu). Trại Giam Hạnh Phúc đang được nguồn giới thiệu suất sớm; trạng thái frontend xác định theo ngày khởi chiếu chính thức.

Tên, thể loại, thời lượng, ngày khởi chiếu và poster lấy từ nguồn; mỗi phim lưu sourceUrl, sourcePosterUrl, importedAt. Mô tả ngắn được tạo từ thể loại và ngày khởi chiếu, không phải nội dung tóm tắt phim.

Cả 4 rạp CineVibe đều có 10 phim, mỗi phim 2 suất. Giờ chiếu, phòng, ghế và giá là minh họa, không phải lịch của Touch Cinema. Suất không trước ngày khởi chiếu. Mỗi phim dùng một phòng riêng tại mỗi rạp để không trùng lịch.

Đổi phiên dữ liệu demo sang v2 để tránh gán đặt vé cũ vào phim mới. Bộ phim là snapshot, không tự cập nhật. Poster và dữ liệu nguồn dùng cho bản demo đồ án; nguồn được dẫn ở từng thẻ phim.

- [Ngày Con Còn Mẹ](https://m.touchcinema.com/phim/ngay-con-con-me) — 113 phút, 2026-11-11
- [Trại Giam Hạnh Phúc](https://m.touchcinema.com/phim/trai-giam-hanh-phuc) — 127 phút, 2026-11-20
- [Godzilla Trừ Không](https://m.touchcinema.com/phim/godzilla-tru-khong) — 135 phút, 2026-11-06
- [Chị Chị Em Em 3](https://m.touchcinema.com/phim/chi-chi-em-em-3) — 122 phút, 2026-10-30
- [Bò Sữa Bay](https://m.touchcinema.com/phim/bo-sua-bay) — 108 phút, 2026-11-06
- [Thòng Lọng Ma: Quỷ Cái Đòi Mạng](https://m.touchcinema.com/phim/thong-long-ma-quy-cai-doi-mang) — 105 phút, 2026-11-13
- [Chàng Mèo Mang Mũ (Lồng Tiếng)](https://m.touchcinema.com/phim/chang-meo-mang-mu) — 107 phút, 2026-11-06
- [Ramayana: Khởi Nguồn Một Huyền Thoại](https://m.touchcinema.com/phim/ramayana-khoi-nguon-mot-huyen-thoai) — 168 phút, 2026-11-06
- [Đấu Trường Sinh Tử: Bình Minh Ngày Chiêu Quân](https://m.touchcinema.com/phim/dau-truong-sinh-tu-binh-minh-ngay-chieu-quan) — 158 phút, 2026-11-20
- [Ma Mút Con Vượt Kỷ Băng Hà (Lồng Tiếng)](https://m.touchcinema.com/phim/ma-mut-con-vuot-ky-bang-ha) — 73 phút, 2026-11-20