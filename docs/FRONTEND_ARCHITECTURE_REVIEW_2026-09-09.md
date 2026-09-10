# Đánh giá kiến trúc frontend — 09/09/2026

**Kết luận:** build production đạt, nhưng frontend chưa đủ vững để coi là sẵn sàng vận hành doanh nghiệp. Đây là đánh giá theo khả năng bảo trì, tính đúng của nghiệp vụ, kiểm thử và quy trình phát hành; không có một chứng nhận chung tên là “chuẩn doanh nghiệp” cho cấu trúc thư mục.

Trong React, các khối đang được nói tới là function component. Vấn đề là một component sở hữu quá nhiều trách nhiệm. Không cần chuyển chúng thành JavaScript class.

Lượt refactor trước đã tách admin/customer/organizer và xử lý lỗi HTTP của các thao tác ghi. Booking, storefront, check-in và thanh toán vẫn còn nhiều logic trong view. Lượt này rà soát mã, chạy lại build và kiểm chứng các biểu thức nghiệp vụ cục bộ; chưa sửa mã ứng dụng.

## Những component còn cần tách

Số dòng dưới đây là xấp xỉ, tính trên working tree hiện tại. Số dòng giúp tìm điểm cần đọc sâu, không phải tiêu chuẩn chất lượng độc lập.

| Component | Số dòng | Trách nhiệm đang gộp | Cách tách phù hợp |
|---|---:|---|---|
| SeatSelectionView | 760 | Đọc URL, tải event/area/phase/seat, chọn vé, xác định giá, giữ/hủy chỗ, giao diện sơ đồ | View điều phối, hook chọn vé, API giữ chỗ, quy tắc chọn phase, SeatMap, AreaSelector, BookingSummary |
| CheckinAppView | 673 | Tải sự kiện, chuẩn hóa mã, gửi scan, lịch sử, ánh xạ response, nhiều trạng thái giao diện | Hook scan, hook lịch sử, hàm ánh xạ, EventGateSelector, ScanInput, ScanResult, CheckinHistory |
| EventDetailView | 603 | Tải nhiều API, ghép tier/phase/inventory, chọn số vé, banner, thông tin sự kiện | API catalog, quy tắc tier dùng chung với booking, phần thông tin event và TicketPicker |
| HomeView | 480 | Tải dữ liệu, tìm kiếm/lọc, banner, danh sách và thẻ sự kiện | Hook/query trang chủ, phần tìm kiếm, danh sách và EventCard |
| CheckoutView | 464 | Tải reservation, đồng hồ, thông tin liên hệ, tạo order và toàn bộ UI | Hook checkout, đồng hồ deadline dùng chung, ContactForm, OrderSummary |
| VNPayReturnView | 447 | Polling, suy luận trạng thái thanh toán, định dạng dữ liệu và nhiều màn hình kết quả | Hook xác nhận kết quả, hàm ánh xạ trạng thái có test, PaymentResult |
| PaymentView | 382 | Tải đơn, tạo payment URL, đếm ngược, tự chuyển trang và UI | Hook khởi tạo thanh toán, đồng hồ deadline, PaymentSummary |

## Lỗi hành vi xác định được

### P1 — Đầu vào QR bị thay đổi trước khi gửi backend

[checkin-app-view.tsx:232](D:/SmartEventRepos/smartevent-web/src/components/checkin/checkin-app-view.tsx:232) gọi `trim().toUpperCase()` cho cả mã vé và token QR. Backend tra token bằng `findByTokenHash(input)`; token QR có UUID, salt và chữ ký chứa ký tự phân biệt hoa thường.

Khi token có chữ thường, frontend gửi một chuỗi khác token đã phát hành. Token hợp lệ có thể bị từ chối. Cần giữ nguyên token QR, chỉ chuẩn hóa mã vé thông thường theo đúng contract; tách quy tắc này khỏi view và kiểm thử cả hai loại đầu vào.

Đã kiểm chứng bằng cách chạy chính biểu thức trong source với token mẫu có chữ thường; chuỗi sau xử lý không còn giống đầu vào. Đối chiếu thêm [CheckinServiceImpl.java:59](D:/SmartEventRepos/smartevent-backend/src/main/java/com/smartevent/modules/ticket/service/impl/CheckinServiceImpl.java:59). Chưa gọi scan với dữ liệu thật.

### P1 — Mở lại đơn PAID sau deadline có thể bị báo thanh toán muộn

[vnpay-return-view.tsx:101](D:/SmartEventRepos/smartevent-web/src/components/booking/vnpay-return-view.tsx:101) kiểm tra đồng hồ hiện tại so với `paymentDeadline + 3 phút`, trước nhánh xử lý PAID. Một đơn đã thanh toán đúng hạn khi được xem lại sau đó sẽ bị đưa vào `late_payment`.

Đã chạy biểu thức gốc với đơn PAID có deadline cách hiện tại 10 phút: kết quả là `late_payment`. Thời điểm người dùng xem trang không thể xác định thời điểm giao dịch. Cần ánh xạ trạng thái từ kết quả đã được backend xác nhận, tách hàm ánh xạ để test được các trường hợp xem lại, callback chậm và thanh toán muộn thực sự.

### P2 — Hai màn hình chọn sale phase theo quy tắc khác nhau, có thể ghép sai loại vé

[event-detail-view.tsx:196](D:/SmartEventRepos/smartevent-web/src/components/storefront/event-detail-view.tsx:196) dùng phase ACTIVE đầu tiên nếu loại vé không có phase phù hợp. Đã chạy biểu thức gốc với loại vé VIP và chỉ có phase của GA: VIP nhận phase GA.

[seat-selection-view.tsx:206](D:/SmartEventRepos/smartevent-web/src/components/booking/seat-selection-view.tsx:206) lại lấy phase đầu tiên cùng ticketType mà không kiểm tra ACTIVE/thời gian bán; phase truyền từ URL chỉ là lựa chọn thứ hai. Người dùng có thể thấy giá sai hoặc bị backend từ chối ở bước giữ chỗ, dù trang chi tiết hiển thị đang bán.

Cần một quy tắc chọn phase dùng chung: đúng ticketType, đúng thời gian và trạng thái, ưu tiên phase hợp lệ được chọn; không mượn phase của loại vé khác. Inventory cần khớp đúng phase, không dùng tổng số vé cấu hình làm số vé còn lại khi tải inventory thất bại.

## Các điểm còn thiếu để quản lý và phát hành ổn định

1. **Phân tầng chưa nhất quán.** Admin/customer đã có hook, nhưng nhiều view vẫn gọi transport API trực tiếp. Một số hook đã tách vẫn trộn dữ liệu thật và giả định hiển thị: [use-organizer-events.ts:60](D:/SmartEventRepos/smartevent-web/src/components/organizer/use-organizer-events.ts:60) đặt số vé bán bằng 0, tổng vé 1.000 và doanh thu 0. Số liệu chưa có phải được biểu diễn là chưa có dữ liệu; cần API báo cáo thật trước khi dùng để vận hành.
2. **Quản lý dữ liệu bất đồng bộ chưa thống nhất.** Check-in ánh xạ lịch sử hai lần tại dòng 126 và 170. `refreshHistory` không chống response cũ ghi vào sự kiện mới khi đổi sự kiện giữa lúc tải. Nhiều GET bỏ qua `response.ok/error`, khiến lỗi tải dữ liệu bị biểu diễn thành danh sách trống. Cần API có kiểu, xử lý lỗi nhất quán, hủy/bỏ qua request cũ và cập nhật dữ liệu đúng chức năng.
3. **Kiểm thử còn hẹp.** Hai file test hiện có bao phủ helper lỗi API và đầu vào/kết quả tạo event, tổng 9 test. Chưa thấy component test hoặc E2E cho đăng nhập → chọn vé → giữ chỗ → thanh toán; chưa có test cho QR scan hoặc các lỗi trên. Build/TypeScript không kiểm tra được các quy tắc này.
4. **Chưa thấy pipeline CI trong repo này.** `package.json` có các lệnh lint/typecheck/test/build riêng, README mới yêu cầu chạy thủ công. Chưa thấy cấu hình tự động chặn thay đổi lỗi, chốt phiên bản Node cho test TypeScript trực tiếp, hoặc ghi lại quy trình staging/rollback. Có package-lock, là nền tảng để dùng cài đặt tái lập. Không kết luận tổ chức không có CI bên ngoài repo.
5. **Thông tin lỗi vận hành còn hạn chế.** Đã có error/loading/not-found/global-error, nhưng error boundary hiện chỉ ghi `console.error`. Chưa thấy tích hợp thu thập lỗi tập trung trong frontend. Chưa đo hiệu năng hay accessibility nên không kết luận những phần đó đạt hoặc không đạt.

Những nền tảng tốt đang có: TypeScript strict, API types sinh từ schema, route/layout của App Router, UI primitives dùng chung, refresh cookie HttpOnly qua BFF, và các feature admin/customer/organizer đã bắt đầu tách. Không cần đổi framework để cải thiện các điểm còn lại.

## Cấu trúc đích đề xuất

```text
src/
  app/                         # Route, layout, ghép màn hình
  features/
    ticket-catalog/
      api/                     # Event, tier, phase, inventory
      model/                   # Quy tắc chọn phase, ánh xạ dữ liệu
    booking/
      api/                     # Reservation, checkout
      model/                   # Kiểu dữ liệu và kiểm tra lựa chọn
      hooks/                   # Điều phối dữ liệu và thao tác
      components/              # SeatMap, AreaSelector, BookingSummary
      seat-selection-view.tsx  # Ghép các phần của màn hình
    payments/
    checkin/
    account/
    admin/
    organizer/
  components/ui/               # UI primitives hiện có
  components/shared/           # Thành phần dùng chung thực sự
  lib/api/                     # Transport, auth middleware, lỗi, schema
  lib/auth/                    # Cơ chế phiên dùng chung
```

Chỉ tạo các thư mục thực sự cần cho từng feature. Không tạo thêm interface/class cho mọi hàm hoặc chuyển cả khối lớn vào một hook duy nhất. `app` chọn màn hình; view ghép UI; hook điều phối; API thực hiện request; model giữ quy tắc có thể test mà không mount React. Catalog cung cấp quy tắc phase dùng chung cho trang chi tiết và booking, tránh hai bản sao.

## Thứ tự thực hiện và tiêu chí hoàn tất

1. Sửa và thêm regression test cho QR, trạng thái thanh toán và sale phase trước khi di chuyển nhiều file.
2. Tách booking/check-in/payments theo trách nhiệm; gom quy tắc catalog dùng chung. Giữ URL và contract đang dùng.
3. Tách storefront; chuẩn hóa trạng thái loading/empty/error, xử lý request cũ và dữ liệu báo cáo chưa có.
4. Thêm kiểm thử tương tác các luồng chính; tự động chạy lint, typecheck, test, build trong CI với phiên bản Node thống nhất. Xác minh staging trước khi phát hành.

Hoàn tất refactor khi các view chỉ ghép màn hình, API và quy tắc nghiệp vụ có nơi sở hữu rõ ràng, không còn logic sale phase/polling/scan bị sao chép, và các luồng quan trọng được bảo vệ bằng test. Không dùng số lượng thư mục hoặc một giới hạn số dòng cứng làm tiêu chí duy nhất.

## Kiểm chứng trong lượt này

- `npm run build`: chạy lại thành công; TypeScript và tạo trang hoàn tất, 27/27 trang ở bước generate.
- Chạy cục bộ các biểu thức nghiệp vụ trích từ source để kiểm chứng ba tình huống QR, phase và đơn PAID; không gọi API hoặc sửa dữ liệu thật.
- Kết quả lint/typecheck/9 test ở lượt refactor trước vẫn là kết quả gần nhất của những kiểm tra đó; không gọi chúng là một bộ E2E.
- Chưa chạy trình duyệt trong lượt này. Công cụ trình duyệt ở lượt trước bị hệ thống duyệt tự động chặn do giới hạn sử dụng.
