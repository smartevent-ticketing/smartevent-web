# Smart Event Ticketing Platform — Web

Frontend Next.js của Smart Event Ticketing Platform. Repository này chịu trách nhiệm giao diện khách hàng, tài khoản, khu vực organizer/admin và màn hình check-in; backend và hạ tầng được quản lý độc lập.

## Các repository

- Frontend (repo này): `smartevent-web`
- Backend: [smartevent-backend](https://github.com/smartevent-ticketing/smartevent-backend)
- Hạ tầng local: [smartevent-infra](https://github.com/smartevent-ticketing/smartevent-infra)

## Công nghệ

- Next.js 16 App Router
- React 19 và TypeScript
- Tailwind CSS 4
- shadcn/Base UI primitives
- ESLint và TypeScript type checking

## Chạy local

Yêu cầu: Node.js **24.13.1**, được chốt trong `.node-version` và `package.json`. Dùng cùng phiên bản ở local và CI.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Trên Windows PowerShell dùng `Copy-Item .env.example .env.local`. Mở `http://localhost:3000` sau khi development server khởi động.

Hạ tầng và backend nên được chạy trước theo hướng dẫn trong `smartevent-infra`. URL API local mặc định là `http://localhost:8080`.

## Kiểm tra trước khi push

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Có thể chạy toàn bộ bằng `npm run check`. `typecheck` tạo lại route types của Next.js trước khi kiểm tra TypeScript, kể cả ở checkout mới chưa có `.next`.

GitHub Actions chạy cùng bốn bước trên cho pull request và khi đẩy lên `main`, cài dependency bằng `npm ci`. CI dùng `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` để build; không cần backend đang chạy và không gọi đây là kiểm thử tích hợp.

Không commit `.env.local`, token hoặc secret; biến có tiền tố `NEXT_PUBLIC_` luôn có thể xuất hiện trong bundle trình duyệt. Chạy build triển khai với `NEXT_PUBLIC_API_BASE_URL` đúng môi trường đích.

## Cấu trúc chính

```text
src/
├── app/          # route, layout, metadata và BFF auth route handlers
├── features/     # account, admin, auth, booking, catalog, checkin, organizer, payments, orders
│   └── booking/  # ví dụ một nghiệp vụ
│       ├── api/          # gọi transport client, kiểm tra lỗi, contract API có kiểu
│       ├── model/        # quy tắc lựa chọn vé; không phụ thuộc React/network
│       ├── application/  # điều phối nhiều thao tác nếu nghiệp vụ cần
│       ├── hooks/        # state, lifecycle, hủy request và hành động của màn hình
│       ├── components/   # từng phần giao diện dùng props có kiểu
│       └── *-view.tsx    # ghép các phần thành màn hình
├── components/   # UI primitives và bố cục dùng chung
├── hooks/        # hooks dùng chung, không sở hữu nghiệp vụ của feature
└── lib/          # transport, auth token, thời gian và tiện ích dùng chung
```

Không cần tạo đủ mọi thư mục cho feature nhỏ. Tách theo trách nhiệm và khả năng thay đổi độc lập; không dùng một giới hạn số dòng tùy ý để chia file.

## Quy tắc thêm hoặc sửa tính năng

1. Route chọn màn hình và truyền tham số. View ghép các component, hook điều phối state và API, model xử lý quy tắc độc lập.
2. Trong `features`, chỉ thư mục `api/` được gọi `fetch` hoặc import transport client. ESLint kiểm tra quy tắc này; model cũng bị cấm phụ thuộc React, Next, API, hooks và component.
3. Đọc contract từ `src/lib/api/schema.d.ts`; cập nhật bằng `npm run api:generate` khi backend thay đổi. Contract bổ sung cho endpoint tạo sự kiện nằm trong `src/lib/api/event-setup-contract.ts` cho đến lần sinh schema tiếp theo.
4. API mutation phải kiểm tra HTTP lỗi trước khi cập nhật giao diện thành công. Tái sử dụng `requireApiSuccess` và `getApiErrorMessage`.
5. Dữ liệu có thể hết hiệu lực cần xử lý request bị hủy hoặc kết quả cũ. Trạng thái thanh toán lấy từ backend; đồng hồ và query string không xác nhận giao dịch thành công.
6. Thay đổi quy tắc chọn vé, xử lý thanh toán, QR, đăng nhập hoặc biểu mẫu cần thêm test hành vi tương ứng.

Wizard tạo sự kiện sử dụng `POST /api/v1/events/setup`; cần backend chứa endpoint giao dịch này. Không triển khai frontend mới cùng backend chỉ hỗ trợ chuỗi tạo sự kiện cũ.

## Kiểm thử

`tests/*.test.mjs` chạy bằng Node test runner. Loader `tests/register-typescript.mjs` dùng TypeScript đã cài để đọc module TS/TSX, alias `@/` và import không có phần mở rộng giống mã ứng dụng. Loader chỉ chuyển đổi cú pháp; `npm run typecheck` vẫn là bước bắt buộc để kiểm tra kiểu.

Bộ test bao phủ chọn đúng đợt bán/tồn kho, giới hạn và ghế đặt chỗ, giữ nguyên token QR, phân loại kết quả thanh toán và retry/hủy polling, deadline, lỗi API, biểu mẫu sự kiện và đăng nhập. Các component thuần có thể render qua `react-dom/server` để kiểm tra nội dung và ngữ nghĩa truy cập; không cần thêm dependency.

Các test này không thay thế kiểm thử trình duyệt hoặc tích hợp backend. Trước khi phát hành, cần chạy trên staging các luồng đăng nhập/khôi phục phiên, đặt ghế đồng thời, hết hạn giữ chỗ, thanh toán/callback, truy cập lại đơn đã trả tiền, check-in QR thật và phân quyền theo vai trò.
