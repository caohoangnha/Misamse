# 04. HƯỚNG DẪN CẤU HÌNH CLOUDFLARE TUNNEL (KHÔNG CẦN MỞ PORT ROUTER)

Phương án **Cloudflare Tunnel (Zero Trust)** là giải pháp an toàn và bảo mật nhất để đưa website nội bộ ra Internet với tên miền riêng (ví dụ: `https://misa.tencongty.vn`) mà **KHÔNG CẦN mở port inbound** (Port Forwarding / NAT) trên Router mạng công ty và **KHÔNG CẦN địa chỉ IP tĩnh**.

---

## 1. Ưu điểm vượt trội

* **Không mở Port:** Tránh 100% các cuộc tấn công rà quét port (port scanning) từ hacker vào IP công ty.
* **Chứng chỉ HTTPS tự động:** Được Cloudflare cấp chứng chỉ SSL/TLS miễn phí, bảo mật kết nối từ điện thoại 4G/5G.
* **Ẩn IP thật của công ty:** Người dùng truy cập qua CDN Cloudflare.
* **Tích hợp Cloudflare Access (Tùy chọn):** Có thể bật thêm tầng xác thực thứ 2 (OTP qua Email/Google Workspace) trước khi vào trang đăng nhập MISA Portal.

---

## 2. Các bước cài đặt Cloudflare Tunnel trên Windows Server

### Bước 1: Chuẩn bị tài khoản Cloudflare
1. Đăng ký tài khoản miễn phí tại [https://cloudflare.com](https://cloudflare.com).
2. Trỏ NameServer tên miền công ty của bạn (ví dụ: `tencongty.vn`) về Cloudflare.

### Bước 2: Tạo Cloudflare Tunnel
1. Đăng nhập vào trang quản trị **Cloudflare Zero Trust** ([https://one.dash.cloudflare.com](https://one.dash.cloudflare.com)).
2. Vào mục **Networks** → chọn **Tunnels** → nhấn **Add a tunnel**.
3. Chọn loại tunnel: **Cloudflared**.
4. Đặt tên Tunnel (Ví dụ: `misa-sme-tunnel`) → nhấn **Save tunnel**.

### Bước 3: Cài đặt phần mềm cloudflared trên Windows Server
Trong màn hình Cloudflare sẽ cung cấp lệnh cài đặt cho Windows (64-bit).
1. Mở PowerShell với quyền **Administrator** trên Windows Server.
2. Chạy lệnh tải và cài đặt service cloudflared (ví dụ do Cloudflare cấp):
   ```powershell
   # Tải bản cloudflared mới nhất
   Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi" -OutFile "cloudflared.msi"
   
   # Cài đặt
   Start-Process msiexec.exe -Wait -ArgumentList '/i cloudflared.msi /quiet'
   
   # Chạy lệnh kết nối token (lấy mã Token chính xác từ giao diện Cloudflare của bạn)
   cloudflared.exe service install <TOKEN_DO_CLOUDFLARE_CẤP>
   ```

### Bước 4: Cấu hình Route Public Hostname trên Cloudflare Dashboard
1. Sau khi service kết nối, Cloudflare sẽ báo trạng thái **HEALTHY** (Xanh lá).
2. Chuyển sang tab **Public Hostname** → chọn **Add a public hostname**:
   * **Subdomain:** `misa`
   * **Domain:** `tencongty.vn` (Tạo thành `misa.tencongty.vn`)
   * **Type:** `HTTP`
   * **URL:** `localhost:3000` (hoặc `127.0.0.1:3000`)
3. Nhấn **Save Hostname**.

---

## 3. Kiểm tra kết nối từ điện thoại

1. Tắt Wifi trên điện thoại, bật mạng 4G/5G.
2. Mở trình duyệt web Safari (iPhone) hoặc Chrome (Android).
3. Truy cập địa chỉ: `https://misa.tencongty.vn`.
4. Trang đăng nhập bảo mật của MISA Portal sẽ xuất hiện ngay lập tức với biểu tượng ổ khóa HTTPS xanh.
