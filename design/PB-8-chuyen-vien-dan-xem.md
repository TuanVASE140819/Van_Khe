# PB-8 · Chuyển cảnh khi cuộn và chuyên viên dẫn xem dự án

> Phản hồi khách lần 2 (24/10/2026), nguyên văn: *"khách yêu cầu cần animation và có đồ họa animation chuyển cảnh khi kéo xuống kiểu có 1 người nhân viên tư vấn rùi kéo xuống người đó đi qua lại và giới thiệu dự án"*.
> Tài liệu này ghi kịch bản, nhân vật, cách chuyển cảnh và các quy tắc để hiệu ứng không làm hỏng những gì bản 2 đã sửa (PB-7). Mọi tên, giá, câu thoại vẫn là **dữ liệu mẫu**.

**Design read:** trang chủ dự án nhà ở cho người mua để ở, thêm một lớp kể chuyện bằng cuộn trang: một chuyên viên tư vấn (nhân vật minh họa) dẫn khách đi qua 6 dự án, giữ ngôn ngữ biên tập của bản 2 (ảnh thật, góc vuông, một màu nhấn).

## Kịch bản

Phần "Sáu dự án, năm tỉnh thành" nằm ngay dưới ảnh hero. Khi cuộn tới, sân khấu đứng yên, cuộn tiếp là tua kịch bản; cuộn ngược thì mọi thứ chạy ngược.

| Cảnh | Chuyên viên làm gì | Màn hình |
|---|---|---|
| Mở đầu | Đi từ mép trái vào, vẫy tay chào | Tiêu đề, lời giới thiệu, "Kéo xuống để bắt đầu", "Xem dạng danh sách", lộ trình 6 dự án (bấm để tới thẳng) |
| 1 Vân Khê Riverside | Đi sang trái, quay lại, đưa tay giới thiệu ảnh bên phải | Ảnh dự án quét vào, số thứ tự 01/06, tên, trạng thái, quy mô, giá, "Xem dự án" |
| 2 Vân Khê Sky | Đi sang phải, giới thiệu ảnh bên trái | Ảnh cũ bị quét đi theo hướng chị đi, ảnh mới lộ ra theo cùng hướng |
| 3 … 6 | Đi qua lại, ảnh đổi bên mỗi cảnh | Như trên |
| Kết | Đi về bên trái, giới thiệu khối kêu gọi | "Anh chị ưng dự án nào?", nút "Đăng ký tư vấn", "Xem tất cả dự án" |

Ở mỗi điểm dừng, chị Linh nói một câu riêng của dự án (bong bóng lời nói), ví dụ: *"Cả khu chỉ có 48 biệt thự, căn nào cũng có hồ bơi riêng, đi bộ ra biển Mỹ Khê 300 m."* Câu thoại nằm trong `projects.json`, trường `pitch`.

## Nhân vật

- **Chuyên viên "Linh"** (tên mẫu, đổi được): áo vest xanh rừng đúng màu nhấn của trang, sơ mi trắng, quần than chì, tóc búi, bảng tên, cầm tập tài liệu. Vẽ phẳng (flat vector) nhìn nghiêng 3/4, tỉ lệ người thật khoảng 7,5 đầu.
- **Không dùng** người 3D low-poly (bài học bản 1: khách chê "trông quá AI") và không dùng video người mẫu có sẵn (không đi qua lại đúng chỗ, không đổi được câu thoại).
- Vẽ bằng SVG, có khung xương 14 khớp (hông, gối, cổ chân, vai, khuỷu, cổ tay hai bên, thân, đầu). Dáng đi tính theo công thức: bước chân tỉ lệ với quãng đường cuộn nên chân không bị trượt trên sàn, chân trụ luôn chạm sàn, thân nhún nhẹ theo bước. Khi đứng lại: thở nhẹ và chớp mắt theo thời gian thực.
- Dáng: đứng, đi, vẫy tay, đưa tay giới thiệu. Xem tất cả dáng ở trang chỉ có khi chạy dev: `http://127.0.0.1:5300/__nhan-vat`.

## Chuyển cảnh và chuyển động khác trên trang chủ

| Chỗ | Hiệu ứng | Vì sao |
|---|---|---|
| Hero | Ảnh trôi chậm hơn trang, chữ mờ dần và trượt lên khi cuộn qua | Chuyển từ ảnh mở đầu sang phần đi xem dự án |
| Đi xem dự án | Ảnh quét theo hướng chuyên viên đi, có vạch màu nhấn ở mép quét; chữ cảnh cũ trượt ngang và mờ đi, chữ cảnh mới trượt lên; thanh tiến độ mảnh ở đáy | Mắt đi theo nhân vật, biết đang ở dự án mấy trên 6 |
| Đoạn giới thiệu chủ đầu tư | Từng chữ đậm dần theo nhịp cuộn | Đọc chậm lại ở câu quan trọng |
| Số liệu (6 dự án, 4.608 căn…) | Đếm lên một lần khi hiện ra | Nhấn vào con số |
| Ảnh dự án chủ lực, ảnh tiện ích | Ảnh trôi nhẹ trong khung, mỗi ảnh một tốc độ | Có chiều sâu, không đứng im |
| Tiến độ xây dựng | Vạch màu nhấn chạy từ mốc đầu tới **mốc đã xong gần nhất**, không vẽ quá phần chưa làm | Đúng sự thật về tiến độ |
| Khối đăng ký tư vấn | Từ khung nhỏ mở ra tràn màn hình | Báo hiệu bước cuối |

## Quy tắc

- Mọi chuyển động gắn với vị trí cuộn, không tự chạy, không chiếm quyền cuộn của người dùng. Cuộn ngược là chạy ngược.
- Người không muốn xem cả kịch bản: có "Xem dạng danh sách" và lộ trình bấm thẳng tới từng dự án.
- Bàn phím: bấm Tab tới liên kết của một dự án chưa hiện thì trang tự cuộn tới lúc chuyên viên đứng ở dự án đó.
- Người dùng chọn **giảm chuyển động** trong hệ điều hành, hoặc màn hình thấp hơn 520px (điện thoại xoay ngang): hiện bản tĩnh cùng nội dung (ảnh, thông tin, câu thoại dạng trích dẫn), không có hiệu ứng nào.
- Bong bóng lời nói không đè lên chữ của cảnh; tay nhân vật nằm trên bong bóng.
- Chỉ đổi `transform`, `opacity`, `clip-path`; một vòng `requestAnimationFrame` chung, chỉ chạy khi có cuộn. Không thêm thư viện: tăng khoảng 8 KB (gzip) cho cả phần hiệu ứng và nhân vật.

## Kiểm thử (24/10/2026)

- 18 unit test, gồm khung xương (chân trụ luôn chạm sàn qua cả chu kỳ bước, sải chân hợp lý) và kịch bản (đúng cảnh khi đứng, quét ảnh đúng chiều khi đi, nhảy tới cảnh khi bấm lộ trình).
- 23 kiểm tra trình duyệt trên bản build vẫn đạt (lọc, form, 404, không tràn ngang 360px), không lỗi console.
- Kiểm riêng phần đi xem dự án: bản tĩnh khi giảm chuyển động (8 câu thoại hiện đủ), chế độ tối, bấm lộ trình tới "Vân Khê Villas", Tab tới "Vân Khê Park", không tràn ngang; thời gian khung hình khi cuộn đều: trung vị 6,9 ms, p95 7,2 ms (trình duyệt không giao diện).
- Đã thử ở 1440 × 900, 1280 × 800, 1024 × 768, 768 × 1024 và 390 × 844.
- Video quay màn hình: [`design/video/di-xem-du-an-may-tinh.mp4`](video/di-xem-du-an-may-tinh.mp4), [`design/video/di-xem-du-an-dien-thoai.mp4`](video/di-xem-du-an-dien-thoai.mp4).

## Cần khách quyết

- Tên và hình chuyên viên: giữ nhân vật minh họa "Linh", hay đổi theo tên một chuyên viên thật (có thể vẽ lại theo đồng phục thật của công ty).
- Câu thoại từng dự án: hiện là câu mẫu, cần bộ phận kinh doanh duyệt.
