# Kịch bản quay demo SmartEvent Bot (2–3 phút)

## Chuẩn bị

- Mở `http://localhost:3000`, tải lại trang và làm mới hội thoại.
- Có ít nhất hai sự kiện `PUBLISHED` tại Hồ Chí Minh; một sự kiện có từ “lễ hội” trong tên/mô tả. Bộ 50 sự kiện ban đầu là `DRAFT`, chỉ những sự kiện đã được tổ chức/admin công bố mới xuất hiện.
- Thử trước nút **Xem sự kiện** để bảo đảm trang chi tiết mở được.
- Nội dung hiện tại là bản thử nghiệm nhận diện ý định theo luật, đọc dữ liệu backend và corpus hướng dẫn đã được chủ dự án duyệt. Chưa có model QLoRA được huấn luyện trong luồng chat này.

## Trình tự quay

| Thời lượng | Câu hỏi/thao tác | Điểm cần giới thiệu |
|---|---|---|
| 0:00–0:15 | Mở hộp chat, gửi “Xin chào” | Giới thiệu trợ lý tra cứu sự kiện trên SmartEvent. |
| 0:15–0:45 | “Tìm sự kiện ở Hồ Chí Minh” | Bot đọc sự kiện công khai từ backend, trả tên và thời gian; các nút bên dưới mở đúng sự kiện. |
| 0:45–1:10 | Hỏi tiếp “Tìm lễ hội”, không nhắc lại thành phố | Ngữ cảnh thành phố được giữ; từ khóa mới thu hẹp kết quả. |
| 1:10–1:35 | Bấm **Xem sự kiện** ở kết quả | Chuyển sang trang chi tiết của sự kiện; người dùng tiếp tục thao tác bằng giao diện. |
| 1:35–1:55 | Mở lại chat/làm mới nếu cần, hỏi “Tìm abcxyzkhongtontai ở Hồ Chí Minh” | Bot báo không tìm thấy, không tự tạo một sự kiện để trả lời. |
| 1:55–2:15 | “Giữ vé giúp tôi” | Bot giải thích giới hạn và hướng người dùng thao tác trên giao diện; không thực hiện giao dịch thay. |
| 2:15–2:35 | Chốt phần giới thiệu | Chatbot hỗ trợ tìm kiếm và điều hướng; dữ liệu sự kiện lấy từ hệ thống nghiệp vụ. |

Các câu hỏi này đã được thử qua API chatbot. Tại thời điểm kiểm tra, tìm Hồ Chí Minh có 2 kết quả và hỏi tiếp “Tìm lễ hội” còn 1. Số lượng có thể thay đổi khi duyệt thêm sự kiện hoặc sự kiện kết thúc.

Sau khi bật corpus đã duyệt, thêm đoạn 30–45 giây: hỏi “Có những cách thanh toán nào?” để thấy câu trả lời về VNPay kèm nguồn; hỏi tiếp “Còn MoMo thì sao?” để thấy bot trả lời đúng phạm vi triển khai. Có thể hỏi “Ảnh bìa kích thước bao nhiêu?” để minh họa truy xuất một mục tài liệu khác. Đây là câu trả lời từ nguồn đã duyệt, không phải trạng thái một giao dịch cá nhân.

Với câu hỏi ngân sách như “3 vé dưới 800 nghìn”, bot nói rõ chưa lọc theo giá và chuyển sang điều kiện đang hỗ trợ như thành phố/từ khóa. Không giới thiệu luồng này như đề xuất vé theo tồn kho hoặc kết quả đã lọc theo ngân sách. Bot không còn hỏi “mỗi vé hay tổng” để dẫn vào một bước chưa thực hiện được.

## Đường dẫn có cần sửa mô hình không?

Không cần huấn luyện lại model cho chức năng này. Backend trả `id`, `name`, `slug` của sự kiện công khai; AI service chuyển thành dữ liệu `event_links` và frontend tạo đường dẫn nội bộ `/events/{slug}`. Tên sự kiện không được dùng để đoán URL. Các đường dẫn ngoài ứng dụng hoặc slug không hợp lệ bị loại ở giao diện.

Nút chỉ mở trang chi tiết, không giữ chỗ hay đặt vé. Khả năng hiểu câu hỏi phức tạp thuộc phần xử lý ngôn ngữ; khả năng sinh nút và điều hướng thuộc phần ứng dụng.

## Phạm vi cần nói đúng trong video

- Tìm kiếm theo thành phố/từ khóa và giữ tiêu chí thành phố giữa các lượt đã được nối với backend.
- API hiện chưa lọc theo ngày: câu như “cuối tháng này” được báo rõ là chưa áp dụng bộ lọc thời gian.
- Giá/tồn kho và đơn hàng cá nhân chưa được bật. RAG hiện phục vụ bộ hướng dẫn kỹ thuật đã duyệt; bộ này không quy định điều kiện, phí hay hạn hoàn tiền cho mọi vé.
- Việc có giao diện chat và câu trả lời chưa chứng minh mô hình đã được huấn luyện; giới thiệu đây là baseline để tích hợp và kiểm thử luồng tra cứu.

## Kiểm tra bản sửa nút sự kiện

Đã kiểm tra phản hồi AI giữ đúng `event_id/title/slug` từ dữ liệu backend; frontend chỉ tạo route sự kiện nội bộ và escape tên sự kiện. Bộ test AI và test frontend được chạy cùng kiểm tra kiểu/build. Lệnh `npm run check` tổng dừng ở 8 file có lỗi định dạng từ trước ngoài phạm vi bản sửa; các file chat đã chỉnh được định dạng riêng, kiểm tra kiểu, 111 test frontend và build đều đạt.
