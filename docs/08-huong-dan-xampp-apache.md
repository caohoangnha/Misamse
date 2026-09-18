# Hướng Dẫn Tải Mã Nguồn Về Máy Và Cấu Hình Chạy Thử (Bao Gồm Môi Trường XAMPP / Apache)

---

## 1. Lưu ý quan trọng về bản chất kiến trúc

- **XAMPP** là bộ công cụ tích hợp sẵn: **Apache (Web Server) + PHP + MySQL/MariaDB**.
- **MISA SME Portal** được phát triển trên công nghệ: **Node.js (Express) + React (TypeScript)** và kết nối tới **Microsoft SQL Server** (hệ quản trị cơ sở dữ liệu của phần mềm MISA SME).
- ⚠️ **Lưu ý:** Bạn **không thể** chỉ copy mã nguồn vào thư mục `C:\xampp\htdocs` rồi chạy như một website PHP thông thường, vì MISA Portal chạy bằng **Node.js runtime** và kết nối tới **MS SQL Server** (không dùng PHP hay MySQL của XAMPP).

Tuy nhiên, bạn hoàn toàn có thể chạy thử trên máy đã cài XAMPP theo 2 cách dưới đây.

---

## 2. Bước 1: Tải mã nguồn về máy tính

Bạn có thể tải toàn bộ mã nguồn về máy theo một trong hai cách:

1. **Cách 1: Tải file ZIP (Khuyên dùng)**
   - Trên giao diện **Google AI Studio**, bấm vào biểu tượng **Settings** (bánh răng) ở góc trên bên phải hoặc menu dự án.
   - Chọn **Export to ZIP** (hoặc **Download ZIP**).
   - Giải nén file ZIP vào một thư mục trên máy tính (ví dụ: `D:\misa-sme-portal` hoặc `C:\xampp\htdocs\misa-portal`).

2. **Cách 2: Đẩy lên GitHub rồi Clone về máy**
   - Chọn **Export to GitHub** trong menu cài đặt.
   - Mở Terminal/CMD trên máy tính và chạy:
     ```bash
     git clone <link-repo-github-cua-ban>
     cd misa-sme-portal
     ```

---

## 3. Bước 2: Cài đặt Node.js trên máy tính (Bắt buộc)

Máy tính chạy ứng dụng cần có Node.js (dù đã có XAMPP hay chưa):
1. Truy cập trang chủ [https://nodejs.org](https://nodejs.org).
2. Tải bản **Node.js LTS** (ví dụ phiên bản 20.x hoặc 22.x LTS cho Windows).
3. Cài đặt bình thường (Next -> Next -> Finish).
4. Mở cửa sổ dòng lệnh (cmd hoặc PowerShell), kiểm tra:
   ```cmd
   node -v
   npm -v
   ```

---

## 4. Bước 3: Chạy thử ứng dụng (Cách đơn giản & chuẩn nhất)

Mở **PowerShell** hoặc **Command Prompt (CMD)**, điều hướng vào thư mục dự án vừa giải nén:

```cmd
cd D:\misa-sme-portal
```

### 1. Cài đặt các gói thư viện phụ thuộc:
```cmd
npm install
```

### 2. Tạo file cấu hình môi trường `.env`:
Sao chép file `.env.example` thành `.env`:
```cmd
copy .env.example .env
```
Mở file `.env` bằng Notepad hoặc VS Code để cấu hình thông tin SQL Server MISA (hoặc để mặc định hệ thống sẽ dùng chế độ Demo Mock Data an toàn để bạn thử nghiệm giao diện ngay lập tức).

### 3. Khởi động máy chủ:
```cmd
npm run dev
```
- Truy cập trình duyệt: `http://localhost:3000`
- Đăng nhập thử với tài khoản quản trị:
  - **Tên đăng nhập:** `admin`
  - **Mật khẩu:** `Admin@123456`

---

## 5. Bước 4: Tích hợp với Apache trong XAMPP (Nếu muốn chạy qua Cổng 80)

Nếu bạn muốn tận dụng **Apache của XAMPP** làm cổng vào chính (Reverse Proxy) để:
- Truy cập qua cổng 80 thông thường: `http://localhost` (không cần gõ `:3000`)
- Hoặc gán tên miền nội bộ như `http://misa.local`

Hãy thực hiện cấu hình **Apache Reverse Proxy** như sau:

### 1. Bật các module Proxy trong Apache của XAMPP:
Mở file: `C:\xampp\apache\conf\httpd.conf`
Tìm và bỏ dấu `#` ở đầu các dòng sau (nếu đang bị comment):
```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

### 2. Cấu hình VirtualHost trong XAMPP:
Mở file: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
Thêm đoạn cấu hình sau vào cuối file:

```apache
<VirtualHost *:80>
    ServerName localhost
    # Nếu muốn dùng domain nội bộ, đổi thành: ServerName misa.local

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog "logs/misa-portal-error.log"
    CustomLog "logs/misa-portal-access.log" common
</VirtualHost>
```

### 3. Khởi động lại Apache trong XAMPP Control Panel:
- Mở **XAMPP Control Panel**.
- Nhấn **Stop** Apache rồi nhấn **Start** lại.
- Giờ đây, khi ứng dụng Node.js đang chạy ở cổng 3000, bạn chỉ cần mở trình duyệt và gõ:
  👉 `http://localhost` là Apache sẽ tự chuyển tiếp mượt mà tới MISA Portal!

---

## 6. Tổng kết bảng so sánh

| Mục | MISA SME Portal | XAMPP Mặc định |
| :--- | :--- | :--- |
| **Môi trường chạy** | Node.js (Vite + Express) | PHP Runtime |
| **Cơ sở dữ liệu** | **Microsoft SQL Server (MISA SME)** | MySQL / MariaDB |
| **Vai trò của XAMPP** | Dùng làm Web Server Reverse Proxy (Apache port 80/443) nếu muốn | Chạy ứng dụng PHP truyền thống |
| **Cách chạy** | `npm run dev` hoặc Windows Service | Start button trong XAMPP Control Panel |
