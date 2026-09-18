# 02. HƯỚNG DẪN CÀI ĐẶT TRÊN WINDOWS SERVER / WINDOWS PC

Tài liệu này hướng dẫn chi tiết từng bước triển khai hệ thống **MISA SME Portal** chạy song song với MISA SME trên máy chủ Windows.

---

## 1. Yêu cầu hệ thống

* **Hệ điều hành:** Windows Server 2012 R2, 2016, 2019, 2022 hoặc Windows 10/11 Pro (64-bit).
* **Môi trường chạy:** Node.js v18.x hoặc v20.x LTS.
* **Bộ nhớ RAM:** Tối thiểu 4GB RAM trống (MISA Portal chỉ chiếm ~150MB RAM).
* **Ổ cứng:** Trống tối thiểu 1GB.
* **MISA SME:** Đã cài đặt SQL Server (SQL Server 2014, 2016, 2017, 2019 đi kèm MISA).

---

## 2. Các bước cài đặt bằng PowerShell (Khuyến nghị)

Chúng tôi đã chuẩn bị sẵn script tự động:

1. Mở PowerShell với quyền Administrator (`Run as Administrator`).
2. Di chuyển đến thư mục mã nguồn:
   ```powershell
   cd C:\MisaPortal
   ```
3. Chạy script cài đặt:
   ```powershell
   .\scripts\install.ps1
   ```

Script sẽ tự động:
* Kiểm tra Node.js & npm.
* Cài đặt toàn bộ thư viện dependencies (`npm install`).
* Tạo file cấu hình `.env` nếu chưa có.
* Biên dịch ứng dụng (Build Frontend Vite & Backend Server).
* Kiểm tra trạng thái tường lửa cho cổng 3000.

---

## 3. Các bước cài đặt thủ công (Nếu không dùng script)

### Bước 1: Cài đặt Node.js
1. Tải bản Node.js LTS từ [https://nodejs.org](https://nodejs.org) (chọn bản Windows Installer .msi 64-bit).
2. Chạy cài đặt và chọn mặc định.
3. Kiểm tra cài đặt trong Command Prompt (cmd) hoặc PowerShell:
   ```cmd
   node -v
   npm -v
   ```

### Bước 2: Cài đặt thư viện và cấu hình
1. Đặt thư mục code tại `C:\MisaPortal`.
2. Tạo file `.env` từ `.env.example`:
   ```cmd
   copy .env.example .env
   ```
3. Mở file `.env` bằng Notepad để đặt `JWT_SECRET` ngẫu nhiên bảo mật.
4. Cài đặt các gói:
   ```cmd
   npm install
   ```

### Bước 3: Biên dịch sản phẩm (Production Build)
```cmd
npm run build
```
Lệnh này sẽ tạo thư mục `dist/` chứa giao diện web tối ưu và file chạy `dist/server.cjs`.

### Bước 4: Chạy thử nghiệm
```cmd
npm run start
```
Mở trình duyệt trên máy chủ truy cập: `http://localhost:3000`

---

## 4. Chạy hệ thống tự động dưới dạng Windows Service (Tự khởi động cùng Windows)

Để website tự động chạy mỗi khi máy chủ Windows khởi động lại mà không cần người dùng đăng nhập Windows:

### Phương án A: Dùng NSSM (Non-Sucking Service Manager - Đơn giản nhất)
1. Tải `nssm.exe` từ [https://nssm.cc/download](https://nssm.cc/download) và giải nén vào `C:\nssm\`.
2. Mở Command Prompt (Admin) và chạy:
   ```cmd
   C:\nssm\win64\nssm.exe install MisaPortalService "C:\Program Files\nodejs\node.exe" "C:\MisaPortal\dist\server.cjs"
   C:\nssm\win64\nssm.exe set MisaPortalService AppDirectory "C:\MisaPortal"
   C:\nssm\win64\nssm.exe set MisaPortalService Description "Cong Thong Tin Noi Bo MISA SME Portal"
   C:\nssm\win64\nssm.exe set MisaPortalService Start SERVICE_AUTO_START
   C:\nssm\win64\nssm.exe start MisaPortalService
   ```

### Phương án B: Dùng PM2 Windows Service
```cmd
npm install -g pm2 pm2-windows-service
pm2 start dist/server.cjs --name "misa-portal"
pm2 save
pm2-service-install
```

Kiểm tra trạng thái dịch vụ trong Windows Services (`services.msc`) mang tên `MisaPortalService`.
