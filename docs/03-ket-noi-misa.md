# 03. HƯỚNG DẪN KẾT NỐI CƠ SỞ DỮ LIỆU MISA SME (READ ONLY)

Tài liệu này hướng dẫn cách kết nối MISA SME Portal với SQL Server chứa dữ liệu của MISA SME một cách an toàn và không gây ảnh hưởng đến phần mềm MISA đang vận hành.

---

## 1. Nguyên tắc cốt lõi: Bảo vệ dữ liệu MISA

* **Chỉ đọc (READ ONLY):** Tuyệt đối không cấp quyền ghi (INSERT, UPDATE, DELETE) cho user kết nối của website.
* **Không làm gián đoạn kế toán:** Truy vấn đọc với cơ chế `NOLOCK` / `READ UNCOMMITTED` để tránh giữ lock bản ghi khi kế toán đang lập chứng từ trên MISA SME.
* **Không mở cổng SQL ra Internet:** Cổng SQL Server (1433) chỉ lắng nghe trên giao diện mạng nội bộ hoặc localhost (127.0.0.1).

---

## 2. Các bước cấu hình SQL Server cho MISA SME

MISA SME thường đi kèm phiên bản SQL Server mang instance name mặc định là:
* `.\MISASME2022` hoặc `localhost\MISASME2022`
* `.\MISASME2021` hoặc `localhost\MISASME2021`
* Hoặc instance mặc định `MSSQLSERVER` / `(local)`

### Bước 1: Bật giao thức TCP/IP trong SQL Server Configuration Manager
1. Mở `SQL Server Configuration Manager` trên Windows Server.
2. Điều hướng đến `SQL Server Network Configuration` → `Protocols for MISASME2022` (hoặc tên instance MISA của bạn).
3. Chuột phải vào mục **TCP/IP** → chọn **Enable**.
4. Chuột phải vào **TCP/IP** → chọn **Properties** → chuyển sang tab **IP Addresses**:
   * Cuộn xuống mục **IPAll**:
   * Đặt **TCP Port** là `1433` (hoặc cổng riêng nếu công ty bạn đổi cổng).
   * Xóa giá trị ở ô **TCP Dynamic Ports** (để trống).
5. Nhấn **Apply** và **OK**.
6. Chọn mục **SQL Server Services** ở thanh bên trái, chuột phải vào **SQL Server (MISASME2022)** chọn **Restart** (Nên thực hiện ngoài giờ làm việc hoặc lúc không có kế toán nhập liệu).

### Bước 2: Tạo User SQL Server chỉ có quyền ĐỌC (Khuyến nghị cao)
Thay vì dùng user `sa` có toàn quyền nguy hiểm, hãy mở **SQL Server Management Studio (SSMS)** và chạy đoạn mã T-SQL sau để tạo user chuyên dụng:

```sql
USE [master];
GO

-- 1. Tạo Login xác thực SQL Server
CREATE LOGIN [misa_portal_reader] 
WITH PASSWORD = N'MatKhauManh@987654#', 
     CHECK_EXPIRATION = OFF, 
     CHECK_POLICY = ON;
GO

-- 2. Chuyển vào Database MISA SME của công ty (Ví dụ: MISA_SME_2022)
USE [Ten_Database_MISA_Cua_Ban];
GO

-- 3. Tạo User trong Database
CREATE USER [misa_portal_reader] FOR LOGIN [misa_portal_reader];
GO

-- 4. CHỈ CẤP QUYỀN ĐỌC (db_datareader) - TUYỆT ĐỐI KHÔNG CẤP QUYỀN GHI
ALTER ROLE [db_datareader] ADD MEMBER [misa_portal_reader];
GO
```

Với cấu hình này: User `misa_portal_reader` **chỉ có thể SELECT**, hoàn toàn không thể xóa, sửa, hoặc tạo bảng dữ liệu!

---

## 3. Cấu hình trên giao diện Web Admin của MISA Portal

1. Đăng nhập vào website bằng tài khoản Quản trị viên (`admin` / `Admin@123456`).
2. Vào mục **Hệ thống** → chọn tab **Kết nối MISA**.
3. Điền các thông số:
   * **MISA Server:** `localhost` hoặc `127.0.0.1` (nếu web chạy cùng máy chủ) hoặc IP mạng LAN nội bộ (ví dụ `192.168.1.50`).
   * **Port:** `1433`
   * **Tên Database MISA:** Nhập đúng tên Database kế toán của công ty (Ví dụ: `MISA_SME_2022`).
   * **Tên đăng nhập:** `misa_portal_reader` (hoặc `sa`).
   * **Mật khẩu:** Nhập mật khẩu SQL.
4. Nhấn nút **[Kiểm tra kết nối]**:
   * Hệ thống sẽ tự động đo độ trễ (latency), đọc phiên bản SQL Server và kiểm tra quyền truy cập.
   * Nếu thành công: hiển thị thông báo `✓ Kết nối MISA thành công`.
   * Nhấn **[Lưu cấu hình]** để lưu vào file `/config/misa.config.json`.

---

## 4. Công cụ Tra cứu Cấu trúc Bảng (Schema Inspector)

Nếu phiên bản MISA của công ty bạn là phiên bản đặc thù hoặc có thêm trường mở rộng:
1. Trong màn hình Quản trị MISA, chọn công cụ **Khảo sát cấu trúc bảng (Schema Inspector)**.
2. Chọn bảng (Ví dụ: `InventoryItem`, `AccountObject`, `InventorySummary`).
3. Hệ thống sẽ liệt kê tên cột, kiểu dữ liệu thực tế từ MISA SME của bạn để bạn dễ dàng đối chiếu vào file mapping `/config/misa.config.json` mà không cần đoán mò.
