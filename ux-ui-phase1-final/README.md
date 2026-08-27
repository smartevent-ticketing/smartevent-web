# SMART EVENT — Phase 1 UX/UI Final

Thư mục này là bộ thiết kế đã chọn cho Phase 1 Core Ticketing. Các bản cũ, bản trùng, file lỗi và màn hình ngoài phạm vi backend đã được loại bỏ.

## Thống kê

| Phân hệ | Số màn |
|---|---:|
| Customer | 91 |
| Organizer | 17 |
| Check-in | 9 |
| Admin | 21 |
| **Tổng cộng** | **138** |

Mỗi màn có:

- `screen.png`: ảnh tham chiếu UX/UI;
- `code.html`: mã HTML do Stitch xuất để tham khảo bố cục;
- tên thư mục đã được chuẩn hóa bằng tiếng Anh để dễ đối chiếu khi tạo route/component.

## Cấu trúc

- `customer/`: auth, discovery, event, reservation, checkout, order, payment, ticket, transfer, invoice và common states.
- `organizer/`: dashboard, danh sách sự kiện, wizard tạo sự kiện và cấu hình bán vé.
- `checkin/`: chọn sự kiện, quét QR, lịch sử và các trạng thái lỗi.
- `admin/`: duyệt sự kiện, category, venue, Outbox và trạng thái dùng chung.
- `design-system/DESIGN.md`: design token và quy ước Kinetic Pulse.

## Cách sử dụng

`code.html` chỉ là tài liệu tham chiếu, không chép nguyên xi vào Next.js. Khi triển khai cần:

1. Tách layout và component dùng chung.
2. Dùng API types đã sinh từ OpenAPI.
3. Dùng Lucide hoặc SVG local thay Material Symbols.
4. Thay ảnh Google bên ngoài bằng asset local hoặc dữ liệu file từ backend.
5. Hiển thị loading, empty, error và modal theo trạng thái thực tế; không xếp nhiều trạng thái loại trừ nhau trên cùng một trang.
6. Tuân thủ các giới hạn trong `IMPLEMENTATION_NOTES.md`.

## Trạng thái

Thiết kế Phase 1 đã đóng. Bước tiếp theo là lập route map, component architecture và triển khai frontend theo từng vertical slice.
