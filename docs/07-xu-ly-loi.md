# 07. HƯỚNG DẪN XỬ LÝ LỖI & SỰ CỐ THƯỜNG GẶP

---

## 1. Lỗi: "MISA hiện không kết nối được. Dữ liệu chưa được cập nhật."

### Nguyên nhân 1: Dịch vụ SQL Server chưa khởi động hoặc bị tắt
* **Cách xử lý:**
  1. Nhấn `Windows + R`, gõ `services.msc` và nhấn Enter.
  2. Tìm dịch vụ có tên `SQL Server (MISASME2022)` (hoặc tên năm tương ứng).
  3. Kiểm tra trạng thái: nếu chưa chạy, nhấn chuột phải chọn **Start**.

### Nguyên nhân 2: Giao thức TCP/IP chưa được bật trong SQL Server Configuration Manager
* **Cách xử lý:**
  1. Mở `SQL Server Configuration Manager`.
  2. Vào `SQL Server Network Configuration` → `Protocols for MISASME2022`.
  3. Đảm bảo **TCP/IP** đang ở trạng thái **Enabled**.
  4. Kiểm tra cổng trong IPAll xem đã đặt `1433` chưa.

### Nguyên nhân 3: Tường lửa Windows chặn cổng 1433
* **Cách xử lý:** Chạy lệnh PowerShell (Admin):
  ```powershell
  New-NetFirewallRule -DisplayName "MISA SQL Server 1433" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
  ```

### Nguyên nhân 4: Sai mật khẩu hoặc quyền truy cập
* **Cách xử lý:**
  1. Đăng nhập vào website bằng tài khoản admin.
  2. Vào **Hệ thống** → **Kết nối MISA** → Nhấn nút **[Kiểm tra kết nối]**.
  3. Hệ thống sẽ hiển thị chi tiết nguyên nhân lỗi do sai mật khẩu (`Login failed`) hay do không tìm thấy database (`Cannot open database`).

---

## 2. Lỗi: Điện thoại không mở được trang web từ mạng 4G/5G

### Đối với mô hình Cloudflare Tunnel:
* Kiểm tra dịch vụ `cloudflared` trên máy chủ Windows có đang chạy không (`Get-Service cloudflared`).
* Đăng nhập Cloudflare Zero Trust Dashboard, xem Tunnel có báo trạng thái xanh lá **HEALTHY** không.
* Đảm bảo phần Public Hostname đã trỏ về đúng `localhost:3000`.

### Đối với mô hình VPN:
* Đảm bảo app Tailscale/WireGuard trên điện thoại đã bật ở chế độ **Connected**.
* Kiểm tra máy chủ có đang bật VPN và ping được IP VPN của máy chủ không.

---

## 3. Quên mật khẩu Admin

Nếu quên mật khẩu quản trị viên `admin`:
1. Mở file `.env` hoặc khởi động lại với script reset user mặc định:
   Mật khẩu mặc định là: `Admin@123456`.
2. Hoặc tạo tài khoản admin mới thông qua database script.
