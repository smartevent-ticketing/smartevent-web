# Đối chiếu chức năng frontend và backend

Tài liệu này ghi lại các commit của đợt hoàn thiện từ ngày 29/09/2026. Mỗi hàng chỉ ra phần giao diện tương ứng với xử lý phía máy chủ. Dấu `—` nghĩa là đợt đó chỉ thay đổi một phía; phía còn lại dùng API hoặc mã đã có trước đó. Hai repository có lịch sử Git riêng.

| Chức năng | Backend | Frontend | Điểm ghép / phạm vi |
| --- | --- | --- | --- |
| Danh sách sự kiện sắp diễn ra, tìm kiếm | `58706fe` | `7338587` | `GET /api/v1/events` với `q`, `city`, `categoryId`; loại sự kiện đã kết thúc. |
| Giới hạn vé mỗi tài khoản, chống mua đồng thời | `b127fef` | `dac400d`, `d722548` | `maxTicketsPerUser`, bộ đếm theo sự kiện/đợt bán, kiểm tra lại khi giữ chỗ. |
| Hoàn tất bản nháp và gửi duyệt | `9b07652` | `2605769`, `d722548` | `POST /api/v1/events/{eventId}/complete-setup`; cấu hình vé trong một giao dịch. |
| Sơ đồ ghế và trạng thái thực | `4c97be1` | `dac400d`, `b2f40a6` | `GET /api/v1/areas/{areaId}/seats/available`; chọn ghế và quản lý ghế. |
| Chỉ Admin được sửa địa điểm chung (hành vi cũ, đã thay thế) | `a0df958` | `3ab62df` | Không còn API ghi địa điểm cho Admin. |
| Organizer chọn hoặc tạo địa điểm | `9282ddf` | `b4d81ca` | `GET/POST /api/v1/venues` trong wizard tạo sự kiện; bỏ màn quản lý địa điểm của Admin. |
| Thêm đợt bán cho sự kiện đã xuất bản | `7689de2`, `62684b7` | `d4f90f9`, `cba6ef5` | Chỉ trước giờ bắt đầu và khi còn sức chứa; đợt đã đóng vẫn giữ số vé đã bán hoặc đang giữ chỗ; sự kiện đã hủy không được mở bán lại. |
| Thanh toán mới qua VNPay | `0c8d86b` | `cb4fa99` | Tạo đơn và thanh toán chỉ nhận `VNPAY`; trang kết quả đọc trạng thái backend. |
| Người mua gửi hồ sơ hỗ trợ hoàn tiền | `69358e8` | `79f9ca0`, `daf4bfa` | `GET/POST /api/v1/orders/{orderId}/refund-review`; Admin cập nhật thủ công. |
| Cập nhật ảnh đại diện | `3f075cf` | `9b7fe07` | `PUT /api/v1/auth/me/avatar` và URL ảnh từ Storage. |
| Admin tìm tài khoản, cấp role | `2ebf331` | `c9b6cd6` | `GET /api/v1/admin/users`, `POST /api/v1/admin/users/{userId}/roles`. |
| Kiểm thử tích hợp PostgreSQL | `f01d7f0` | — | Kiểm tra giới hạn vé, ghế và quản lý tài khoản bằng Testcontainers. |
| Quét QR tại cổng | — | `a316548` | Cải thiện trạng thái máy quét; dùng API check-in đã có. |
| Quản lý đợt bán, ảnh và dashboard BTC | — | `2ccffe8`, `1dc341d`, `d8c11ac` | Dùng các API ban tổ chức đã có; chủ yếu thay đổi giao diện và điều phối dữ liệu. |
| Giao diện nền và kiểu dữ liệu API | — | `6bf1167`, `7fce636` | Font, màu, layout và contract TypeScript dùng chung. |

Các commit frontend khác được tách theo đúng màn hình: `admin-approvals`, `admin-categories`, `admin-outbox`, `organizer-events`, `organizer-inventory`, `organizer-seats`, `organizer-workspace`, `event-setup`, `account`. Xem `git log --oneline` trong từng repository để lấy thứ tự đầy đủ.

Khi sửa một chức năng, tìm scope tương ứng trong bảng, sửa FE/BE liên quan, chạy test của cả hai phía nếu API đổi, rồi tạo commit mới cho chính chức năng đó. Không cần sửa hoặc gộp lại các commit của đợt này.
