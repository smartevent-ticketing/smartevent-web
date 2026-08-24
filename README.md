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

Yêu cầu: Node.js phiên bản LTS tương thích với Next.js 16 và npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Trên Windows PowerShell dùng `Copy-Item .env.example .env.local`. Mở `http://localhost:3000` sau khi development server khởi động.

Hạ tầng và backend nên được chạy trước theo hướng dẫn trong `smartevent-infra`. URL API local mặc định là `http://localhost:8080`.

## Kiểm tra trước khi push

```bash
npm run lint
npm run typecheck
npm run build
```

Ba lệnh trên phải cùng pass. Không commit `.env.local`, token hoặc secret; biến có tiền tố `NEXT_PUBLIC_` luôn có thể xuất hiện trong bundle trình duyệt.

## Cấu trúc chính

```text
src/
├── app/          # route, layout và special files của App Router
├── components/   # UI dùng lại và component theo feature
└── lib/          # client, helper và cấu hình dùng chung
```

Các màn hiện tại mới là khung Phase 1 cho luồng đăng nhập, sự kiện, tài khoản và check-in. Nghiệp vụ frontend sẽ được triển khai theo API contract do backend công bố.
