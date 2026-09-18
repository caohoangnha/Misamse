# 01. KIẾN TRÚC HỆ THỐNG MISA SME PORTAL

## 1. Tổng quan mô hình kiến trúc

Hệ thống được thiết kế theo mô hình **Zero Direct Database Exposure (Tuyệt đối không mở trực tiếp SQL Server ra ngoài Internet)**. Mọi truy vấn từ thiết bị người dùng (điện thoại iPhone/Android, laptop, máy tính từ xa) đều đi qua tầng xác thực, mã hóa và adapter kiểm soát quyền hạn.

```
[Thiết bị di động / Laptop từ xa]
               │
               ▼ (HTTPS / TLS 1.3)
      [Cloudflare Tunnel / VPN WireGuard / Tailscale]
               │
               ▼ (Mạng nội bộ Localhost / LAN)
       [Reverse Proxy / Web & Backend API Node.js]
               │
      ┌────────┴────────┐
      ▼                 ▼
[JWT & RBAC Guard]  [In-Memory Cache (TTL: 30-300s)]
      │                 │
      └────────┬────────┘
               ▼
       [MISA Data Adapter] (Enforce Strict READ ONLY)
               │
               ▼ (SQL TCP/IP Localhost: 1433 - Không mở Internet)
     [Cơ sở dữ liệu MISA SME - SQL Server]
```

---

## 2. Các tầng bảo vệ (Defense in Depth)

### Tầng 1: Tầng mạng & Truy cập từ xa (Perimeter)
* **Phương án A (Khuyến nghị): Cloudflare Tunnel (Zero Trust)**
  * Chạy `cloudflared` agent trên máy chủ Windows.
  * Tự động tạo kết nối outbound an toàn về Cloudflare Edge qua TLS.
  * **Không cần mở bất kỳ cổng inbound nào trên Router/Modem mạng công ty**.
  * Chống tấn công DDoS, quét cổng mạng nội bộ.
* **Phương án B: VPN Nội Bộ (Tailscale / WireGuard / OpenVPN)**
  * Chỉ các thiết bị được cài VPN và chứng chỉ mới truy cập được IP nội bộ máy chủ.

### Tầng 2: Web Server & Backend API (Node.js + Express)
* Chạy trực tiếp trên máy chủ Windows (quản lý qua Windows Service hoặc PM2/NSSM).
* Chỉ mở cổng HTTP nội bộ (Port 3000) lắng nghe trên localhost hoặc tunnel.
* Tích hợp cơ chế:
  * **Brute-force lockout:** Tự động khóa IP/tài khoản khi đăng nhập sai quá 5 lần trong 15 phút.
  * **Rate Limiting:** Chống spam request.
  * **Security Headers:** Hạn chế Clickjacking, XSS, MIME sniffing.

### Tầng 3: Tầng Kiểm soát Phân quyền (RBAC & Masking)
* Kiểm tra quyền hạn trực tiếp tại Backend API (không chỉ ẩn giao diện).
* Lọc bỏ dữ liệu nhạy cảm theo vai trò:
  * Tài khoản **KHO**: chỉ thấy số lượng tồn, mã hàng, tên hàng, ĐVT. Bị xóa trường `costPrice` (giá vốn), không truy cập doanh thu, công nợ.
  * Tài khoản **KINH DOANH**: xem tồn kho, khách hàng, đơn hàng; không xem giá vốn và chi tiết công nợ nhà cung cấp.
  * Tài khoản **KẾ TOÁN / GIÁM ĐỐC**: toàn quyền xem báo cáo tài chính, công nợ.
  * Tài khoản **ADMIN**: toàn quyền quản trị và cấu hình.

### Tầng 4: MISA Data Adapter (Tuyệt đối READ ONLY)
* Áp dụng Transaction Isolation Level `READ UNCOMMITTED` để việc tra cứu tồn kho **không bao giờ gây khóa bảng (locking) hay cản trở kế toán đang làm việc trên MISA SME**.
* Bộ lọc kiểm tra Regex ngăn chặn 100% các câu lệnh `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `EXEC`.
* Truy vấn Parameterized Query phòng chống hoàn toàn SQL Injection.
* Bộ nhớ đệm (Cache) giúp giảm tải tới 90% số lượng truy vấn lặp lại vào SQL Server MISA.
