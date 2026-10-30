# PB-7 · Phản hồi khách: "trông quá AI"

> Khách chưa duyệt bản 1. Lý do: giao diện có cảm giác do AI làm, không giống website của một chủ đầu tư thật.
> Tài liệu này ghi lại vì sao (để Designer không lặp lại), định hướng bản 2 theo skill `pl-art-direction`, và kết quả tự kiểm.
> Mọi tên dự án, giá, địa chỉ, số điện thoại vẫn là **dữ liệu mẫu**. Ảnh là ảnh minh họa Unsplash, chưa phải ảnh dự án.

## Phản hồi khách lần 1 (24/10/2026)

Nguyên văn: *"khách chưa ưng vì lý do quá ai"*.

| Dấu hiệu | Bản 1 | Vì sao khách thấy giả |
|---|---|---|
| Ảnh | Phối cảnh 3D low-poly, cây như đồ chơi | Không chủ đầu tư nào dùng ảnh kiểu này; nhìn là biết ảnh dựng vội |
| Bố cục | Hero chia đôi bo góc → lưới thẻ → 4 ô icon "cam kết" → 4 bước số tròn → form | Đúng khuôn landing page mẫu mà AI hay tạo, thay chữ là dùng cho ngành nào cũng được |
| Hình khối | Mọi thứ bo 14px, nút viên thuốc, chip tròn, bóng mềm | Ngôn ngữ của app SaaS, không phải của kiến trúc, nhà ở |
| Biểu tượng | Icon cho từng dòng lợi ích | Trang trí thay cho nội dung thật |
| Câu chữ | "Nhà ven sông, sống chậm giữa phố", "Mua nhà an tâm hơn", "Bốn bước tới ngày nhận nhà" | Đẹp nhưng chung chung, không có con số hay chi tiết riêng của dự án |
| Nội dung | Không có tiến độ xây dựng, thời gian di chuyển, ảnh nội thất | Thiếu những thứ người mua nhà thật cần xem, nên trang thành "vỏ" |
| Màu | Xanh lục ngọc trên nền xám nhạt, mọi khối giống nhau | Không có cá tính thương hiệu |

## Định hướng bản 2

**Design read:** website dự án của chủ đầu tư nhà ở cho người mua để ở 30-45 tuổi (xem nhiều trên điện thoại), ngôn ngữ biên tập kiến trúc, theo hướng ảnh tràn màn hình + chữ có chân cho tiêu đề + góc vuông + đường kẻ mảnh.

### Moodboard (đã mở và chụp từng site ngày 24/10/2026)

| Site | Học gì | Không học gì |
|---|---|---|
| [masterisehomes.com](https://masterisehomes.com) (trong nước) | Hero là một ảnh thật toàn cảnh sông Sài Gòn lúc hoàng hôn; nút viền mảnh góc vuông; chân trang ghi văn phòng Hà Nội, TP.HCM và số đăng ký kinh doanh | Khẩu hiệu "Kiến tạo trải nghiệm xứng tầm"; hàng huy chương giải thưởng; ảnh người mẫu dàn dựng |
| [gamudaland.com.vn](https://gamudaland.com.vn) (trong nước) | Ảnh thật của khu đô thị; ô tìm dự án theo địa điểm ngay dưới hero; thẻ dự án ghi loại hình, vị trí, "Từ … tỷ" và trạng thái ("Vừa ra mắt", "Số lượng có hạn"); tiêu đề chữ có chân có dấu tiếng Việt | Khẩu hiệu "Kiến tạo khu đô thị lý tưởng"; nút viên thuốc đỏ, thẻ bo lớn; đoạn mô tả bị cắt "…" |
| [berkeleygroup.co.uk](https://www.berkeleygroup.co.uk) (nước ngoài, chuẩn chất lượng) | Tìm nhà theo vị trí, giá, số phòng ngủ là việc đầu tiên; thẻ dự án ghi tên, địa chỉ, khoảng giá; một hàng số liệu chủ đầu tư bằng con số thật | Nút đỏ lặp lại ở mọi khối; các cột chữ dài giữa trang |

Vinhomes.vn chặn trình duyệt tự động (Cloudflare) nên không đưa vào.

Đối chiếu: bản 2 đã có hero ảnh thật, thẻ dự án đủ trạng thái, loại hình, vị trí, giá từ, hàng số liệu chủ đầu tư. Việc nên làm tiếp học từ Gamuda Land và Berkeley: đưa ô lọc nhanh "Khu vực, Loại hình, Giá" lên ngay dưới hero. **Đã làm 25/10/2026** (`src/components/QuickSearch.vue`): ba ô chọn và nút báo trước số dự án khớp ("Xem 2 dự án"), không khớp thì nút khoá ghi "Chưa có dự án phù hợp"; bấm thì sang `/du-an` với đúng bộ lọc trên URL. Vuông sắc, nhãn chữ hoa nhỏ, nút màu nhấn, như các ô của trang danh sách; điện thoại một cột.

### Kế hoạch ảnh

| Vị trí | Nội dung | Tỉ lệ / kích thước | Nguồn | Giấy phép |
|---|---|---|---|---|
| Hero trang chủ | Trung tâm TP.HCM nhìn từ bờ sông lúc hoàng hôn | 16:9, 2000px | Unsplash | Unsplash License |
| Thẻ và thư viện ảnh 6 dự án | Ngoại thất đúng loại hình (tháp căn hộ, nhà phố liền kề, biệt thự hồ bơi), nội thất phòng khách, phòng ngủ | 16:10, 1600px + bản 800px | Unsplash | Unsplash License |
| Khối "Trong khuôn viên" | Hồ bơi giữa vườn, căn hộ mẫu, phòng tập | 16:11 và 4:5 | Unsplash | Unsplash License |
| Trang đăng ký tư vấn | Phòng khách căn hộ mẫu | 16:10 | Unsplash (dùng lại ảnh dự án) | Unsplash License |

Danh sách đường dẫn từng ảnh gốc: [`public/images/CREDITS.md`](../public/images/CREDITS.md). Ảnh nào không thuộc dự án đều có chú thích "Ảnh minh họa" ngay dưới ảnh. **Trước khi chạy thật:** thay bằng phối cảnh và ảnh chụp thật của chủ đầu tư, giữ đúng tỉ lệ.

### Chữ

- Cặp font: **Noto Serif Display** (tiêu đề, 500 và 600) + **Be Vietnam Pro** (nội dung, 300-600). Tự host bằng `@fontsource`.
- Lý do dùng chữ có chân: ngành kiến trúc, nhà ở cao cấp; hai site trong nước ở moodboard cũng dùng chữ có chân cho tiêu đề. Nhấn mạnh chỉ bằng độ đậm của cùng font.
- Đã thử 5 font có chân ở cỡ 58px với câu `Vân Khê Riverside · ẩm ướt Đắk Lắk Quý`: Cormorant Garamond (chọn ban đầu) đặt dấu mũ lệch và dấu sắc chữ "ý" dính vào chữ, nên bị loại; EB Garamond, Playfair Display, Lora đạt; **Noto Serif Display** đặt dấu chồng gọn nhất và có độ tương phản nét hợp ảnh kiến trúc nên được chọn.

### Màu (họ "Rừng", một điểm nhấn)

| Token | Sáng | Tối | Tương phản |
|---|---|---|---|
| Nền / chữ chính | `#f3f4f1` / `#16211c` | `#0f1512` / `#e8ece9` | 15,0 / 15,5 |
| Chữ phụ trên nền | `#4d5a53` | `#a6b3ac` | 6,6 / 8,5 |
| Điểm nhấn (nút, trạng thái "Đang mở bán") | `#1f4d3a` | `#8fc4a5` | 8,7 / 9,3 so với nền |
| Khối tư vấn (khối màu duy nhất) / chữ phụ trên khối | `#1f4d3a` / `#b9c9bf` | `#173b2c` / `#a9bfb2` | 5,6 / 6,3 |

Không dùng: navy + vàng đồng, kem be + đồng thau, gradient tím, xanh ngọc của bản 1.

### Hình khối

Vuông sắc toàn trang: ảnh, nút, ô nhập, bảng đều bo 0px (`--radius: 0`). Phân khối bằng đường kẻ 1px và khoảng trắng, không bóng đổ.

### Bố cục từng khối (trang chủ)

| # | Khối | Họ bố cục | Trên điện thoại |
|---|---|---|---|
| 1 | Hero | Ảnh tràn màn hình, chữ ở góc dưới trái; header trong suốt nằm trên ảnh | Ảnh giữ nguyên, chữ một cột |
| 1a | Tìm nhanh (thêm 25/10) | Dải kẻ mảnh: tiêu đề nhỏ bên trái, ba ô chọn và nút bên phải | Một cột, nút rộng hết hàng |
| 2 | Giới thiệu chủ đầu tư | Đoạn tuyên ngôn chữ lớn + hàng 4 số liệu | Số liệu 2 × 2 |
| 3 | Sáu dự án | Dải thẻ cuộn ngang có nút trước / sau | Vuốt ngang |
| 4 | Vân Khê Riverside | Ảnh dọc một bên, thông số + bảng thời gian di chuyển một bên | Ảnh trên, chữ dưới |
| 5 | Trong khuôn viên | Ghép 3 ảnh lệch nhịp có chú thích | Một cột |
| 6 | Tiến độ xây dựng | Dòng thời gian 4 mốc, mốc đã xong tô đặc | Dòng thời gian dọc |
| 7 | Hẹn xem căn hộ mẫu | Khối màu xanh rừng + form | Form một cột |

Trang chi tiết thêm: bảng giá theo loại căn, tiện ích dạng danh sách chữ, bản đồ, tiến độ, form điền sẵn dự án, dự án khác.

## Checklist chống giao diện AI (tự kiểm bản 2, 24/10/2026)

| # | Kiểm | Kết quả |
|---|---|---|
| 1 | Design read | Đạt: một dòng ở trên |
| 2 | Moodboard | Đạt: 3 site thật (2 trong nước, 1 nước ngoài), mỗi site ghi điều học cụ thể |
| 3 | Ảnh | Đạt: 22 ảnh Unsplash đúng chủ đề, có nguồn và chú thích "Ảnh minh họa". Còn phải thay bằng ảnh thật của khách |
| 4 | Hero | Đạt: ảnh thật làm chủ; tiêu đề 1 dòng là tên dự án; nhãn + tiêu đề + 1 câu thông số + 2 nút; nút thấy ngay ở 1440px và 390px |
| 5 | Chữ | Đạt: một cặp font, đã thử dấu chồng ở cỡ lớn, có lý do dùng chữ có chân |
| 6 | Màu | Đạt: một điểm nhấn xanh rừng ở mọi khối; tương phản ≥ 5,6:1 ở cả hai chế độ |
| 7 | Hình khối | Đạt: vuông sắc toàn trang, ghi trong `tokens.css` |
| 8 | Bố cục | Đạt: 7 khối, 7 họ bố cục khác nhau; chỉ 1 khối ảnh-chữ |
| 9 | Icon | Đạt: chỉ còn icon chức năng (mũi tên điều hướng, điện thoại, ghim bản đồ, mở / đóng menu, bộ lọc, báo lỗi và gửi thành công của form) |
| 10 | Thẻ | Đạt: không có hàng thẻ bằng nhau chỉ để liệt kê lợi ích; thẻ chỉ dùng cho dự án |
| 11 | Nhãn nhỏ trên tiêu đề | Đạt: 2 nhãn cho 7 khối ("Dự án chủ lực, TP. Thủ Đức", "Cập nhật 10/2026") |
| 12 | Nút | Đạt: một nhãn "Đăng ký tư vấn" cho ý định tư vấn ở mọi nơi (đã đổi "Nhận bảng giá"); nút không xuống dòng |
| 13 | Câu chữ | Đạt: không câu sáo, không gạch dài; giá ghi "dữ liệu mẫu"; số và đơn vị không bị ngắt dòng ("3,2 tỷ", "250 - 400 m²") |
| 14 | Nội dung ngành | Đạt: bảng giá theo loại căn, tiến độ xây dựng, thời gian di chuyển, pháp lý, bản đồ, nhà mẫu |
| 15 | Chuyển động | Đạt: khối hiện dần khi cuộn tới, ảnh phóng nhẹ khi rê chuột; tắt hết khi chọn giảm chuyển động |
| 16 | Hai chế độ | Đạt: sáng và tối theo hệ thống, đã chụp và kiểm tương phản |
| 17 | Thử "đổi tên" | Đạt: trang có tên sông, quận, mốc bàn giao, giá theo loại căn; đổi sang ngành khác là không dùng được |

Còn thiếu so với site thật (cần tài liệu của khách, không tự bịa): mặt bằng căn và mặt bằng tầng, ảnh tiến độ thi công theo tháng, chính sách thanh toán.

## Kiểm thử bản 2

- 9 unit test (lọc, sắp xếp, định dạng giá, giữ số và đơn vị liền nhau, kiểm tra form, gửi form).
- 23 kiểm tra trình duyệt trên bản build: tiêu đề trang, lọc theo URL, trạng thái rỗng, sắp xếp, thư viện ảnh, JSON-LD, form báo lỗi và gửi thành công, 404, không tràn ngang ở 360px. Không có lỗi console.
- Đã sửa trong lúc kiểm: menu điện thoại chỉ cao bằng thanh header (do `backdrop-filter` của header giới hạn phần tử `fixed` bên trong) → đưa menu ra `body` bằng `Teleport`.
- Ảnh chụp: [`design/screenshots/`](screenshots/).

## Phản hồi khách lần 2 (24/10/2026)

Khách muốn thêm chuyển động: hiệu ứng chuyển cảnh khi cuộn và một chuyên viên tư vấn đi qua lại giới thiệu dự án. Thiết kế, quy tắc và kiểm thử: [`PB-8-chuyen-vien-dan-xem.md`](PB-8-chuyen-vien-dan-xem.md). Mục 15 (chuyển động) của checklist được kiểm lại ở đó; khối "6 dự án cuộn ngang" được thay bằng phần đi xem dự án nên bố cục trang chủ vẫn giữ mỗi khối một kiểu.
