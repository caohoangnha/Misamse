# MISA SME Portal - Website Quản Lý & Tra Cứu Dữ Liệu Nội Bộ MISA SME

Hệ thống cổng thông tin nội bộ bảo mật cao, cài đặt trực tiếp trên máy chủ Windows của công ty (chạy song song với phần mềm MISA SME và SQL Server). Cho phép người dùng được cấp quyền (Ban Giám Đốc, Kế toán, Quản lý kho, Nhân viên kinh doanh) tra cứu dữ liệu tồn kho, công nợ, khách hàng từ điện thoại thông minh (iPhone/Android) hoặc laptop từ xa qua Internet một cách an toàn tuyệt đối.

---

## 🌟 Điểm nổi bật & Cam kết an toàn

1. **Bảo vệ toàn vẹn MISA SME:**
   * Hoạt động ở chế độ **READ ONLY 100%**. Tuyệt đối không can thiệp, sửa đổi hay làm gián đoạn kế toán đang nhập liệu trên MISA SME.
   * Truy vấn với cơ chế `READ UNCOMMITTED` (không lock bảng, không gây treo phần mềm MISA).
2. **Không mở cổng SQL Server ra ngoài:**
   * Cơ sở dữ liệu SQL Server của MISA vẫn nằm an toàn trong mạng nội bộ công ty.
   * Kết nối ra ngoài Internet thông qua **Cloudflare Tunnel (Zero Trust)** hoặc **VPN**, không cần mở port trên Modem Router.
3. **Phân quyền người dùng nghiêm ngặt (RBAC):**
   * Kho chỉ xem số lượng tồn kho (tự động ẩn giá vốn).
   * Kinh doanh chỉ xem khách hàng, đơn hàng, tồn kho (không xem báo cáo tài chính nội bộ).
   * Kế toán & Giám đốc xem toàn diện công nợ, doanh thu, lợi nhuận.
4. **Bộ nhớ đệm (Cache) tốc độ cao:**
   * Giảm thiểu 90% số truy vấn vào SQL Server, giúp tra cứu trên điện thoại chỉ mất 0.1 giây.
5. **Nhật ký kiểm toán (Audit Logs):**
   * Ghi nhận đầy đủ IP, thời gian, thiết bị và lịch sử tra cứu của từng nhân viên.

---

## 📁 Cấu trúc dự án

```
├── config/
│   └── misa.config.json       # File cấu hình kết nối MISA, cổng, bảng & cột mapping
├── docs/                      # Bộ tài liệu hướng dẫn triển khai
│   ├── 01-kien-truc.md        # Sơ đồ kiến trúc & luồng dữ liệu an toàn
│   ├── 02-cai-dat-windows.md  # Hướng dẫn chi tiết cài đặt trên Windows Server
│   ├── 03-ket-noi-misa.md     # Hướng dẫn tạo User SQL Server Read-Only & kết nối MISA
│   ├── 04-cau-hinh-cloudflare.md # Hướng dẫn đưa website ra ngoài qua Cloudflare Tunnel
│   ├── 05-cau-hinh-vpn.md     # Hướng dẫn kết nối an toàn qua mạng riêng ảo VPN (Tailscale)
│   ├── 06-bao-mat.md          # Chính sách bảo mật, chống brute-force và mã hóa
│   └── 07-xu-ly-loi.md        # Bảng tra cứu mã lỗi và cách khắc phục
├── scripts/                   # Các script tự động cho Windows PowerShell
│   ├── install.ps1            # Cài đặt tự động hệ thống
│   ├── start.ps1              # Khởi động portal
│   ├── stop.ps1               # Dừng portal
│   └── backup.ps1             # Sao lưu cấu hình & nhật ký
├── backend/                   # Mã nguồn Backend API & MISA Adapter
├── src/                       # Mã nguồn Giao diện Web React + Tailwind CSS
├── server.ts                  # Máy chủ Express & Vite tích hợp
├── .env.example               # Mẫu biến môi trường
└── README.md                  # Tài liệu tổng quan này
```

---

## 🚀 Hướng dẫn khởi động nhanh cho người không chuyên lập trình

### 1. Chuẩn bị trên máy chủ Windows
1. Tải và cài đặt **Node.js LTS** (bản 64-bit) từ trang chủ: [https://nodejs.org](https://nodejs.org).
2. Tải mã nguồn thư mục này về máy chủ (ví dụ đặt tại `C:\MisaPortal`).

### 2. Cài đặt tự động bằng 1 dòng lệnh
Mở **PowerShell (Run as Administrator)** và gõ:
```powershell
cd C:\MisaPortal
.\scripts\install.ps1
```

### 3. Khởi động hệ thống
```powershell
.\scripts\start.ps1
```
Mở trình duyệt trên máy chủ truy cập: `http://localhost:3000`

---

## 🔑 Tài khoản mặc định để kiểm tra

Hệ thống đã cấu hình sẵn 5 tài khoản mẫu để bạn kiểm tra các phân quyền khác nhau ngay lập tức:

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn hiển thị trên giao diện |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` | `Admin@123456` | Toàn quyền, cấu hình kết nối MISA, quản lý người dùng, audit log |
| **Ban Giám Đốc** | `giamdoc` | `Giamdoc@123456` | Xem toàn bộ báo cáo doanh thu, công nợ, giá vốn, tồn kho |
| **Kế toán trưởng** | `ketoan` | `Ketoan@123456` | Quản lý công nợ phải thu/trả, báo cáo bán hàng, giá vốn |
| **Thủ kho** | `kho` | `Kho@123456` | Tra cứu tồn kho, tìm hàng hóa (Tự động ẩn giá vốn & doanh thu) |
| **Kinh doanh** | `kinhdoanh` | `Sale@123456` | Tra cứu khách hàng, đơn hàng, tồn kho (Tự động ẩn giá vốn & công nợ) |

*(Lưu ý: Quản trị viên có thể đổi mật khẩu và thêm bớt tài khoản bất cứ lúc nào trong mục Quản trị người dùng).*
