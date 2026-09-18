# 06. CHÍNH SÁCH BẢO MẬT & TIÊU CHUẨN AN TOÀN THÔNG TIN

Tài liệu này tổng hợp toàn bộ các cơ chế bảo mật được tích hợp sẵn trong hệ thống **MISA SME Portal**.

---

## 1. Bảo vệ cơ sở dữ liệu MISA (Data Integrity & Isolation)

* **Tuyệt đối READ ONLY:** Không hỗ trợ và chặn hoàn toàn các lệnh thay đổi dữ liệu (`INSERT`, `UPDATE`, `DELETE`, `ALTER`, `DROP`, `TRUNCATE`).
* **Không làm gián đoạn kế toán:** Mọi truy vấn đều sử dụng `READ UNCOMMITTED` (tương đương `WITH (NOLOCK)`), không gây nghẽn bảng hay xung đột khóa bản ghi khi kế toán đang phát hành hóa đơn, lập phiếu chi.
* **Không lưu trữ dữ liệu MISA ra bên ngoài:** Website chỉ hoạt động như một tầng giao diện hiển thị (Proxy/Adapter), không xuất bản sao dữ liệu sang máy chủ lạ.

---

## 2. Xác thực & Quản lý phiên làm việc

* **Mã hóa mật khẩu:** Mật khẩu người dùng được băm (hash) bằng giải thuật **Bcrypt với Salt rounds = 10**. Không bao giờ lưu mật khẩu dạng Plaintext.
* **Token JWT ngắn hạn:** Access Token có thời hạn (mặc định 8 giờ), tự động hết hạn khi rời ca làm việc.
* **Chống Brute-Force đăng nhập:** Nếu nhập sai mật khẩu quá 5 lần liên tiếp, hệ thống tự động khóa IP và tài khoản trong 15 phút và ghi nhận vào Audit Log.
* **Session Invalidation:** Khi đổi quyền hoặc khóa tài khoản, người dùng sẽ bị từ chối truy cập ngay trong request kế tiếp.

---

## 3. Kiểm soát phân quyền (RBAC - Role-Based Access Control)

Hệ thống xác thực quyền tại **Backend API**, không phụ thuộc vào việc ẩn nút bấm ở Frontend:

| Chức năng | ADMIN | GIÁM ĐỐC | KẾ TOÁN | KHO | KINH DOANH | KỸ THUẬT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Tra cứu Tồn kho | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Tra cứu Danh mục hàng | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Xem Giá vốn / Lợi nhuận | ✓ | ✓ | ✓ | ✗ (Bị lọc) | ✗ (Bị lọc) | ✗ |
| Xem Khách hàng | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Xem Nhà cung cấp | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Xem Công nợ phải thu | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Xem Công nợ phải trả | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Xem Báo cáo Doanh thu | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Quản trị Người dùng | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Xem Nhật ký Audit Log | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Cấu hình kết nối MISA | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 4. Nhật ký kiểm toán (Audit Logs)

Hệ thống tự động ghi nhật ký mọi hành động:
* Tên người dùng truy cập
* Địa chỉ IP nguồn (Client IP)
* Thiết bị / Trình duyệt (User Agent)
* API endpoint & module tương ứng
* Kết quả (Thành công / Thất bại / Bị chặn quyền)
* Thời gian phản hồi tính theo millisecond

Mật khẩu và chuỗi Token không bao giờ được ghi vào log.
