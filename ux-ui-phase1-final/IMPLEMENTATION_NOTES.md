# Implementation Notes

Các ghi chú dưới đây có ưu tiên cao hơn dữ liệu minh họa trong file Stitch.

## Quy tắc chung

- Tên sản phẩm hiển thị là **SMART EVENT**; `Kinetic Pulse` chỉ là tên design system nội bộ.
- UI tiếng Việt; không hiển thị raw enum, UUID, stack trace hoặc tên icon.
- Desktop/mobile là cùng một component responsive, không tạo hai codebase riêng.
- Các ảnh toàn trang có thể dài vì Stitch chụp full-page; không coi chiều cao ảnh là viewport cố định.
- Các trạng thái loading, validation, API error, empty và success phải hiển thị có điều kiện.

## Customer

- Public event detail chỉ nhận sự kiện `PUBLISHED`.
- Backend chưa có API follow/favorite; bỏ các nút **Theo dõi** và **Yêu thích** hoặc chỉ giữ Share bằng Web Share API.
- Reservation tồn tại tối đa 10 phút.
- Payment provider Phase 1 chỉ có VNPay.
- Late payment là đối soát hoàn tiền thủ công; không hứa thời gian hoặc kết quả hoàn tiền.
- Chỉ cho hủy order `PENDING_PAYMENT`; không tạo luồng hủy/refund cho order `PAID`.
- Ticket list không hiển thị empty state đồng thời với danh sách có dữ liệu.
- Đổi CTA `Xem chi tiết giao dịch` thành `Xem chi tiết vé` nếu không có `orderId` để điều hướng.
- QR phải lấy từ `qrCodeBase64`; không dùng ảnh QR bên ngoài.

## Invoice email

- `recipientEmail` là tùy chọn. Khi trống, backend dùng `billingEmail`.
- API send-email chỉ xác nhận đã tạo delivery `PENDING`.
- Không hiển thị `Đã gửi thành công` ngay sau request.
- Không có customer endpoint polling delivery status trong Phase 1.

## Organizer

- Chuẩn hóa sidebar về tiếng Việt; bỏ các nhãn `Dashboard`, `Event Management`, `Reports`, `Active`, `Upcoming` còn sót lại.
- Event status hợp lệ: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `CANCELLED`, `COMPLETED`.
- Admin reject đưa sự kiện về `DRAFT`; không tạo status `REJECTED`.
- Backend không trả rejection reason trong `EventResponse`; không hiển thị lý do như dữ liệu tồn tại lâu dài.
- Area type chỉ có `STANDING` và `SEATED`, hiển thị là **Khu đứng** và **Khu có ghế**.
- Bỏ cảnh báo `Thiếu chính sách hoàn vé` trong bước review vì backend chưa có trường/API này.
- Danh sách ticket của Organizer không được bịa buyer name, email hoặc phone.
- Thống nhất dữ liệu mẫu khi triển khai; không trộn nhiều tên sự kiện giữa các tab của cùng một event.

## Admin

- Category request chỉ gồm `name` và `description`; bỏ slug/SEO URL.
- Venue request chỉ gồm `name`, `address`, `city`, `latitude`, `longitude`, `capacity`.
- Không lưu country, district, area size hoặc venue gallery nếu backend chưa được mở rộng.
- Outbox chỉ có stats, pending, failed và retry.
- Retry accepted không đồng nghĩa email/tác vụ downstream đã hoàn thành.
- Sidebar Outbox phải active ở **Hộp thư đi**, không phải **Phê duyệt sự kiện**.
- Không hiển thị `Hệ thống đang hoạt động ổn định` nếu không có dữ liệu health endpoint.
- Không triển khai quản lý nhân sự, gán role, activity log, system-health metrics, SMS Outbox hay refund tự động trong Phase 1.

## Check-in

- Check-in result chỉ có `SUCCESS`, `INVALID`, `DUPLICATE` và phải dịch sang tiếng Việt.
- Khi network timeout, không kết luận vé hợp lệ hoặc không hợp lệ.
- Organizer chỉ được check-in sự kiện thuộc quyền truy cập của mình.
- Hai máy quét đồng thời: máy thắng hiển thị thành công; máy còn lại nhận duplicate.
