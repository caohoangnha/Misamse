# 05. HƯỚNG DẪN CẤU HÌNH VPN NỘI BỘ (PHƯƠNG ÁN B)

Nếu doanh nghiệp của bạn không muốn công khai tên miền ra ngoài Internet mà chỉ muốn nhân viên kích hoạt kết nối mạng riêng ảo (VPN) mới được truy cập dữ liệu MISA từ xa, đây là tài liệu chi tiết.

---

## 1. Các giải pháp VPN khuyến nghị

1. **Tailscale (Dựa trên giao thức WireGuard - Dễ cài nhất, Miễn phí đến 100 thiết bị):**
   * Không cần cấu hình mở cổng router.
   * Cài đặt trong 2 phút trên Windows Server và trên điện thoại iPhone/Android.
   * Mã hóa đầu cuối cực mạnh (End-to-End Encryption).
2. **WireGuard Server độc lập trên Router (MikroTik / DrayTek / pfSense):**
   * Router công ty cấp VPN client cho nhân viên kinh doanh/kho.
3. **OpenVPN Access Server:**
   * Tiêu chuẩn truyền thống cho doanh nghiệp.

---

## 2. Hướng dẫn nhanh với Tailscale VPN

### Bước 1: Cài đặt trên máy chủ MISA SME Windows
1. Đăng ký tài khoản miễn phí tại [https://tailscale.com](https://tailscale.com).
2. Tải phần mềm Tailscale cho Windows và cài đặt.
3. Đăng nhập tài khoản công ty.
4. Máy chủ sẽ được cấp một IP nội bộ an toàn (Ví dụ: `100.80.20.10`) hoặc tên máy `misa-server`.

### Bước 2: Khởi động MISA Portal
Đảm bảo file `dist/server.cjs` đang chạy lắng nghe trên cổng 3000.

### Bước 3: Cài đặt trên điện thoại di động (iPhone / Android)
1. Cài app **Tailscale** từ App Store hoặc Google Play.
2. Đăng nhập cùng tài khoản công ty.
3. Gạt công tắc sang trạng thái **Connected**.
4. Mở trình duyệt trên điện thoại truy cập:
   `http://100.80.20.10:3000` hoặc `http://misa-server:3000`

Người dùng sẽ truy cập trực tiếp vào MISA Portal an toàn như đang ngồi trong mạng LAN công ty!
