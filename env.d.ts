/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ web chính thức, dùng cho canonical và ảnh chia sẻ (vd https://vankhe.vn) */
  readonly VITE_SITE_URL?: string
  /** API nhận form đăng ký tư vấn (POST JSON). Bỏ trống: lưu tạm trong trình duyệt */
  readonly VITE_LEAD_ENDPOINT?: string
}
