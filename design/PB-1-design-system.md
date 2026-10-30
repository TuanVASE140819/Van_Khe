# PB-1 · Thiết kế giao diện và design system

> Hạng mục: **PB-1 Thiết kế giao diện và design system cho website** (5 điểm, Designer).
> Đầu vào: user story PB-2 → PB-6 trong Product Backlog. Đầu ra: tài liệu này, bàn giao cho DevFE.
> Mọi tên dự án, giá, địa chỉ, số điện thoại trong site là **dữ liệu mẫu**.

## 1. Định hướng

**Reading this as:** website giới thiệu dự án của một chủ đầu tư bất động sản, cho người mua nhà ở Việt Nam (25-45 tuổi, xem chủ yếu trên điện thoại), ngôn ngữ thị giác "premium nhưng đáng tin": nhiều không gian, ảnh phối cảnh lớn, số liệu rõ ràng.

| Quay số | Giá trị | Lý do |
|---|---|---|
| Độ phá cách (variance) | 7 | Hero lệch trái-phải, lưới dự án nổi bật không đều; trang danh sách và chi tiết giữ trật tự để dễ so sánh |
| Chuyển động (motion) | 5 | Hero hiện dần, các khối hiện khi cuộn tới, thẻ dự án nổi nhẹ khi rê chuột; tắt hết khi người dùng chọn giảm chuyển động |
| Mật độ (density) | 4 | Trang chủ thoáng; trang danh sách dày hơn một chút để thấy 6 dự án một lúc |

Tránh: vàng đồng + xanh navy (lối mòn của ngành), nền kem ấm, chữ có chân, gradient tím, ba thẻ tính năng bằng nhau.

## 2. Sơ đồ trang

```
/                         Trang chủ
├─ /du-an                 Danh sách dự án (bộ lọc trên URL: ?khu-vuc=&loai=&gia=&trang-thai=&sap-xep=)
│  └─ /du-an/:slug        Chi tiết dự án
├─ /dang-ky-tu-van        Đăng ký tư vấn / đặt lịch xem nhà (?du-an=slug điền sẵn dự án)
└─ *                      404
```
Thanh điều hướng (một dòng, cao 68px): logo · Dự án · Vì sao chọn chúng tôi · Quy trình mua · [Đăng ký tư vấn]. Điện thoại: logo + nút menu, menu mở dạng tấm phủ toàn màn hình.

## 3. Wireframe

### Trang chủ
```
┌────────────────────────────────────────────────────────────┐
│ ◆ Vân Khê Land        Dự án  Vì sao  Quy trình  (Đăng ký tư vấn) │
├───────────────────────────┬────────────────────────────────┤
│ Nhà ven sông,             │                                │
│ sống chậm giữa phố        │   [ảnh phối cảnh 4:3, bo 14px] │
│ mô tả ≤ 20 từ             │                                │
│ (Xem dự án) [Đăng ký tư vấn] │ chú thích dưới ảnh            │
├───────────────────────────┴────────────────────────────────┤
│ Dự án nổi bật                                  Tất cả dự án →│
│ ┌───────────────┐ ┌──────┐ ┌──────┐                         │
│ │ thẻ lớn       │ │ thẻ  │ │ thẻ  │   lưới 5 ô: 1 lớn + 4 nhỏ│
│ │ (2 hàng)      │ ├──────┤ ├──────┤                         │
│ │               │ │ thẻ  │ │ thẻ  │                         │
│ └───────────────┘ └──────┘ └──────┘                         │
├────────────────────────────────────────────────────────────┤
│ [ảnh tiện ích]   │ Mua nhà an tâm hơn                       │
│                  │ ◇ Pháp lý minh bạch   ◇ Thanh toán theo tiến độ │
│                  │ ◇ Bàn giao đúng hẹn   ◇ Hỗ trợ vay ngân hàng │
├────────────────────────────────────────────────────────────┤
│ Bốn bước tới ngày nhận nhà: Tư vấn ─ Xem nhà mẫu ─ Đặt cọc ─ Ký hợp đồng │
├────────────────────────────────────────────────────────────┤
│ Để lại số điện thoại      │ [Form đăng ký tư vấn]          │
│ hotline, giờ làm việc     │                                │
├────────────────────────────────────────────────────────────┤
│ footer: logo, địa chỉ, hotline, liên kết, "Dữ liệu mẫu"     │
└────────────────────────────────────────────────────────────┘
```

### Danh sách dự án
```
Dự án (6)                                  Sắp xếp [Mới nhất ▾]
┌ Bộ lọc (cột trái, dính khi cuộn) ┐ ┌ lưới thẻ 2-3 cột ───────┐
│ Khu vực   [Tất cả ▾]             │ │ ảnh 16:10                │
│ Loại hình (Căn hộ)(Nhà phố)(Biệt thự) │ tên · khu vực          │
│ Khoảng giá [Tất cả ▾]            │ │ giá từ · trạng thái      │
│ Trạng thái [Tất cả ▾]            │ │                          │
│ [Xoá bộ lọc]                     │ │                          │
└──────────────────────────────────┘ └──────────────────────────┘
Điện thoại: nút "Bộ lọc (n)" mở tấm lọc trượt từ dưới lên.
Rỗng: biểu tượng + "Chưa có dự án phù hợp" + [Xoá bộ lọc].
```

### Chi tiết dự án
```
Dự án / Vân Khê Riverside
Vân Khê Riverside                     (Đang mở bán)
TP. Thủ Đức, TP.HCM · Giá từ 3,2 tỷ
┌ ảnh lớn 16:10 ───────────────┐ ┌ thông tin nhanh ┐
│                              │ │ Loại hình  Căn hộ │
└──────────────────────────────┘ │ Quy mô ...        │
[thumb][thumb][thumb]            │ (Đăng ký tư vấn)  │
                                 └───────────────────┘
Giới thiệu · Tiện ích (lưới biểu tượng) · Bảng giá · Vị trí (bản đồ) · Form đăng ký (điền sẵn dự án) · Dự án khác
```

## 4. Design tokens

| Token | Sáng | Tối | Ghi chú |
|---|---|---|---|
| `--bg` | `#f4f6f5` | `#0d1311` | nền trang, xám lạnh hơi xanh |
| `--surface` | `#ffffff` | `#141c19` | thẻ, form |
| `--surface-2` | `#e9eeeb` | `#1b2521` | ô nhập, nền phụ |
| `--ink` | `#14201b` | `#e6ede9` | chữ chính |
| `--ink-2` | `#4a5852` | `#a3b3ab` | chữ phụ (≥ 4.5:1 trên `--bg`) |
| `--line` | `#d6dfda` | `#26332e` | viền |
| `--accent` | `#0e6b4e` | `#45c49a` | **màu nhấn duy nhất** (xanh lục ngọc): nút chính, liên kết, trạng thái |
| `--on-accent` | `#ffffff` | `#0d1311` | chữ trên nút chính |
| `--accent-soft` | `#dcefe6` | `#173a2d` | nền chip |
| `--danger` | `#b42318` | `#ff7b6e` | lỗi form |

- **Chữ:** Be Vietnam Pro (thiết kế cho tiếng Việt, tự host qua `@fontsource`), 400/500/600/700. Tiêu đề lớn `clamp(2.25rem, 1.4rem + 3.2vw, 3.75rem)`, giãn chữ -0.02em, dòng 1.1. Thân bài 16px / 1.6, tối đa 65 ký tự mỗi dòng.
- **Bo góc (một hệ):** nút và chip bo tròn hoàn toàn; thẻ và ảnh 14px; ô nhập 10px.
- **Khoảng cách:** đệm khối `clamp(56px, 8vw, 112px)`; lề trang 16px trên điện thoại, nội dung tối đa 1240px.
- **Bóng:** chỉ trên thẻ khi rê chuột, nhuốm màu nền `0 12px 32px rgb(14 40 30 / 10%)`.
- **Biểu tượng:** Phosphor (một bộ), nét Regular.

## 5. Trạng thái giao diện

| Thành phần | Trạng thái |
|---|---|
| Ảnh | khung giữ tỉ lệ (không nhảy layout), nền `--surface-2` khi đang tải, `alt` mô tả phối cảnh |
| Danh sách | có kết quả · rỗng (nút xoá bộ lọc) |
| Bảng giá | có giá · chưa có giá → "Liên hệ để nhận báo giá" |
| Bản đồ | iframe OpenStreetMap tải lười · liên kết "Mở bản đồ lớn" luôn có |
| Form | bình thường · lỗi từng ô (ngay dưới ô, đỏ, có biểu tượng) · đang gửi (nút khoá, "Đang gửi…") · thành công ("Cảm ơn, chúng tôi sẽ gọi lại trong 24 giờ") · lỗi gửi (thử lại) |
| 404 | thông báo + về trang chủ / xem dự án |

## 6. Responsive và tiếp cận

- Tối thiểu 360px, không cuộn ngang. Mọi bố cục nhiều cột về một cột dưới 768px.
- Vùng bấm ≥ 44px. Viền focus 2px màu nhấn. Có liên kết "Bỏ qua tới nội dung".
- Nhãn đặt trên ô nhập, không dùng placeholder thay nhãn. Lỗi gắn `aria-describedby`; kết quả gửi form đọc qua `aria-live`.
- Tôn trọng `prefers-reduced-motion` và `prefers-color-scheme`.

## 7. Bàn giao cho DevFE

- Token nằm ở `src/styles/tokens.css`; không dùng mã màu trực tiếp trong component.
- Dữ liệu dự án ở `src/data/projects.json` (sửa được không cần biết code).
- Ảnh: WebP 1600×1000 (16:10), ảnh hero 1600×1200 (4:3); thay bằng phối cảnh thật của dự án trước khi chạy thật.
- Câu chữ không dùng gạch dài; số liệu giá viết "3,2 tỷ".
