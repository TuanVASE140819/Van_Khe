# Vân Khê Land: website giới thiệu dự án bất động sản

Website mẫu cho một chủ đầu tư: trang chủ, danh sách dự án có bộ lọc, trang chi tiết (ảnh, tiện ích, bảng giá, bản đồ), form đăng ký tư vấn / đặt lịch xem nhà, SEO cơ bản, chạy tốt từ màn hình 360px, có chế độ tối theo hệ thống.

> **Toàn bộ nội dung là dữ liệu mẫu:** tên thương hiệu "Vân Khê Land", tên dự án, giá, địa chỉ, hotline, email đều là minh họa; ảnh là ảnh Unsplash minh họa, không phải ảnh dự án. Thay bằng thông tin và ảnh thật trước khi đưa lên mạng.
>
> Đây là **bản 2**, làm lại sau khi khách chê bản 1 "trông quá AI". Lý do, định hướng và checklist tự kiểm: [`design/PB-7-phan-hoi-khach.md`](design/PB-7-phan-hoi-khach.md).

## Chạy

```bash
npm install
npm run dev        # http://127.0.0.1:5300
npm test           # 24 test: lọc, ô tìm nhanh, sắp xếp, định dạng giá và diện tích, form, khung xương nhân vật, kịch bản đi xem dự án, thẻ chia sẻ từng trang
npm run build      # type-check + build vào dist/ + HTML tĩnh có thẻ chia sẻ riêng cho từng trang + sitemap.xml, robots.txt
npm run preview    # xem bản build tại http://127.0.0.1:5301
```

Biến môi trường (tạo `.env.local`):

| Biến | Dùng cho |
|---|---|
| `VITE_SITE_URL` | Địa chỉ web chính thức, vd `https://vankhe.vn`. Dùng cho canonical, ảnh chia sẻ, sitemap |
| `VITE_LEAD_ENDPOINT` | API nhận form (POST JSON: `name, phone, email, project, intent, visitDate, slot, note, submittedAt, page`). **Bỏ trống thì form chỉ lưu tạm trong trình duyệt** (`localStorage` khoá `vankhe-leads`), không ai nhận được: bắt buộc cấu hình khi chạy thật |

## Sửa nội dung

- **Dự án:** `src/data/projects.json`. Mỗi dự án có `slug` (đường dẫn), loại (`can-ho` / `nha-pho` / `biet-thu`), trạng thái (`dang-mo-ban` / `sap-mo-ban` / `da-ban-giao`), `priceFrom` tính bằng đồng (`null` = chưa công bố giá, site hiện "Liên hệ để nhận báo giá"), toạ độ `lat`/`lng` cho bản đồ, `units` (số căn), `travel` (thời gian di chuyển), `progress` (mốc tiến độ, `done: true` là đã xong), danh sách tiện ích, bảng giá, ảnh.
- **Ảnh:** `public/images/`, WebP 1600×1000 kèm bản nhỏ `-800.webp` cho thẻ và ảnh thu nhỏ (ảnh hero `hero.webp` 2000×1125). Mỗi dự án 6 ảnh (ngoại thất, phòng khách, bếp, phòng ngủ, phòng tắm). Ảnh tiện ích của từng dự án (`amenityPhotos` trong JSON: mã tiện ích, ảnh, chú thích) ở `public/images/tien-ich/`, WebP 1200×900, hiện thành hàng ảnh trên danh sách tiện ích. Ảnh chia sẻ Facebook, Zalo (JPG 1200×630) ở `public/images/chia-se/`, cắt từ ảnh đầu tiên của mỗi dự án: **thay ảnh thì chạy lại** `python scripts/anh-chia-se.py` (cần Pillow). Ảnh hiện tại lấy từ Unsplash theo Unsplash License, nguồn từng ảnh ở [`public/images/CREDITS.md`](public/images/CREDITS.md). Thay bằng phối cảnh hoặc ảnh thật của dự án, giữ tỉ lệ, và sửa chú thích "Ảnh minh họa" khi ảnh đã là ảnh thật.
- **Thông tin công ty:** khối `company` trong cùng tệp JSON.
- **Màu, chữ, bo góc:** `src/styles/tokens.css` (họ màu "Rừng", góc vuông 0px, chữ tiêu đề Noto Serif Display + chữ nội dung Be Vietnam Pro). Định hướng bản 2: [`design/PB-7-phan-hoi-khach.md`](design/PB-7-phan-hoi-khach.md); quy ước gốc của bản 1 (sơ đồ trang, form, SEO vẫn dùng): [`design/PB-1-design-system.md`](design/PB-1-design-system.md).

## Chuyển động và chuyên viên tư vấn

Thiết kế và quy tắc: [`design/PB-8-chuyen-vien-dan-xem.md`](design/PB-8-chuyen-vien-dan-xem.md). Video quay màn hình trong [`design/video/`](design/video/).

| Muốn đổi | Sửa ở |
|---|---|
| Câu chuyên viên nói ở từng dự án | `pitch` của dự án trong `src/data/projects.json` |
| Tên chuyên viên, câu chào và câu kết | `GUIDE` và `lines` trong `src/components/tour/ProjectTour.vue` |
| Hình nhân vật (màu áo, tóc, tỉ lệ) | `src/components/tour/ConsultantFigure.vue` (SVG); xem mọi dáng ở `/__nhan-vat` khi chạy `npm run dev` |
| Dáng đi, vẫy tay, đưa tay giới thiệu | `src/lib/rig.ts` |
| Thứ tự cảnh, vị trí đứng, độ dài mỗi cảnh | `stopsFor()` trong `ProjectTour.vue`, logic trong `src/lib/tour.ts` |
| Hiệu ứng cuộn khác (hero, chữ đậm dần, số đếm, ảnh trôi, khối tư vấn) | `src/lib/scrollfx.ts` (`v-parallax`, `v-count`) và `HomeView.vue` |

## Trang

| Đường dẫn | Nội dung |
|---|---|
| `/` | Ảnh tràn màn hình của dự án chủ lực, phần **đi xem 6 dự án cùng chuyên viên tư vấn** (cuộn để chuyên viên đi qua lại giới thiệu từng dự án), giới thiệu chủ đầu tư và số liệu, thông số và thời gian di chuyển của Vân Khê Riverside, ảnh tiện ích, tiến độ xây dựng, form hẹn xem căn hộ mẫu |
| `/du-an` | Lọc theo khu vực, loại hình, khoảng giá, trạng thái; sắp xếp theo ngày mở bán hoặc giá. Bộ lọc nằm trên URL nên gửi link được |
| `/du-an/:slug` | Ảnh, giới thiệu, thông tin nhanh, bảng giá, tiện ích, bản đồ OpenStreetMap và thời gian di chuyển, tiến độ, form điền sẵn dự án, dự án khác |
| `/dang-ky-tu-van?du-an=slug` | Form đầy đủ, hotline, căn hộ mẫu |

## Đã làm cho tiếp cận và hiệu năng

- Nhãn trên ô nhập, lỗi ngay dưới ô và gắn `aria-describedby`; bấm gửi khi còn lỗi thì con trỏ nhảy tới ô lỗi đầu tiên; kết quả đọc qua `aria-live`.
- Liên kết "Bỏ qua tới nội dung", viền focus rõ, vùng bấm ≥ 44px, menu điện thoại phủ toàn màn hình, đóng bằng Esc.
- Tương phản chữ ≥ 5,6:1 ở cả chế độ sáng và tối; số và đơn vị ("3,2 tỷ", "250 - 400 m²") không bị ngắt dòng.
- Ảnh có kích thước cố định (không nhảy layout), có bản 800px cho thẻ (`srcset`), ảnh dưới màn hình đầu tải lười, ảnh hero tải ưu tiên (`fetchpriority`). Font tự host.
- Hiệu ứng hiện dần dùng IntersectionObserver; hiệu ứng theo cuộn dùng một vòng `requestAnimationFrame` chung, chỉ đổi `transform`, `opacity`, `clip-path`. Người dùng chọn giảm chuyển động thì tắt hết, phần đi xem dự án chuyển sang bản tĩnh cùng nội dung.

## Giới hạn

- Thẻ chia sẻ (PB-6): khi build, `scripts/prerender.mjs` sinh HTML tĩnh cho từng trang (`dist/du-an/<slug>.html` và `dist/du-an/<slug>/index.html`) với tiêu đề, mô tả, ảnh chia sẻ, dữ liệu có cấu trúc của trang đó, nên Facebook, Zalo hiện đúng ảnh và tên dự án khi gửi link. Nội dung thẻ viết một chỗ ở `src/lib/seo-pages.ts`, trình duyệt và bước build dùng chung. Phần thân trang vẫn do JavaScript dựng (chưa render sẵn nội dung).
- Máy chủ phải trả file `.html` cho đường dẫn không đuôi (`/du-an/van-khe-sky` → `du-an/van-khe-sky.html`) và trả `index.html` cho đường dẫn lạ. Netlify, Vercel, Cloudflare Pages, GitHub Pages, `npm run preview` làm sẵn; nginx cần `try_files $uri $uri.html $uri/ /index.html;`. Có sẵn `dist/404.html` cho máy chủ tĩnh.
- Đặt `VITE_SITE_URL` trước khi build: ảnh chia sẻ và canonical cần địa chỉ tuyệt đối, để trống sẽ là `https://vankhe.example`.
- Bản đồ tải từ openstreetmap.org; không có mạng thì hiện dòng hướng dẫn và liên kết "Mở bản đồ lớn".
- Chưa có trang quản trị: sửa dự án bằng tệp JSON.
- Chưa có mặt bằng căn / mặt bằng tầng, ảnh tiến độ thi công theo tháng và chính sách thanh toán: cần tài liệu thật của chủ đầu tư, không tự dựng.
