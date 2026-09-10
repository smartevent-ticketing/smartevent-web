# SMART EVENT — Lộ trình tự code frontend cho người làm Spring Boot

Cập nhật theo source đọc ngày **08/09/2026**. Frontend: Next.js 16.3.2, React 19, TypeScript, Tailwind CSS 4.

Mục tiêu là tự xây được frontend SMART EVENT và giải thích được code mình viết. Lộ trình đi từ phần gần với backend nhất — HTTP, cookie, xác thực — rồi đến form React, giao diện responsive và luồng mua vé.

## 1. Bắt đầu từ đâu?

**Việc tiếp theo: Bài 3 — hoàn thiện helper refresh cookie.** Đọc phần kiến thức tối thiểu ở mục 3 trước khi viết. Các chặng sau là định hướng, chưa cần làm cùng lúc.

Trạng thái quan sát được trong source:

| Hạng mục | Trạng thái | Bằng chứng / ý nghĩa |
| --- | --- | --- |
| Bài 1: đặt đúng login route | Đã làm | [Login handler](D:/SmartEventRepos/smartevent-web/src/app/api/auth/login/route.ts) đã nằm trong `app/api/auth/login` |
| Bài 2: tách URL server và browser | Đã đổi source | Handler đọc `API_BASE_URL`; [.env.example](D:/SmartEventRepos/smartevent-web/.env.example) có cả hai biến |
| Request JSON không hợp lệ | Đã kiểm tra trong buổi trước | Bạn đã nhận HTTP 400 và thông báo tiếng Việt |
| Bài 3: helper cookie | Đang làm | [refresh-cookie.ts](D:/SmartEventRepos/smartevent-web/src/lib/auth/refresh-cookie.ts) đã có tên hàm, tham số và constant; thân hàm còn trống |
| Gọi helper từ login | Chưa làm | Login handler vẫn tự gọi `response.cookies.set(...)` |
| Refresh và logout BFF | Chưa có | Chưa có hai Route Handler tương ứng |
| Form đăng nhập | Chưa có | [Trang login](<D:/SmartEventRepos/smartevent-web/src/app/(auth)/login/page.tsx>) vẫn hiển thị placeholder |
| API client và access token | Đã có khung | [API client](D:/SmartEventRepos/smartevent-web/src/lib/api/client.ts) gắn Bearer token lấy từ [bộ nhớ token](D:/SmartEventRepos/smartevent-web/src/lib/auth/access-token.ts) |

Đây là đối chiếu source, không phải xác nhận các bài chưa hoàn thành đã chạy thành công. Lần lập tài liệu này không chạy lại build/test và không đọc giá trị bí mật trong `.env.local`.

## 2. Cách dùng lộ trình

Mỗi buổi chỉ làm một bài, hoặc một phần của bài lớn:

1. Đọc đúng mục tài liệu được chỉ định trong khoảng 10–15 phút.
2. Viết lại bằng lời: dữ liệu vào là gì, dữ liệu ra là gì, code chạy ở đâu.
3. Tự viết một phần nhỏ; dùng gợi ý và autocomplete khi chưa nhớ API.
4. Kiểm tra trường hợp thành công và một trường hợp lỗi.
5. Đọc diff, ghi lại điều vừa hiểu và nhờ review.

Đọc tài liệu khi code là bình thường. Không cần học thuộc tên tất cả thuộc tính, cũng không cần chờ học hết React mới tiếp tục dự án.

## 3. Kiến thức tối thiểu, đối chiếu với backend

Các phép so sánh dưới đây giúp định hướng; chúng không có nghĩa hai framework hoạt động hoàn toàn giống nhau.

| Khái niệm | Hiểu theo nền tảng Java/Spring Boot |
| --- | --- |
| `route.ts` | Điểm nhận HTTP request, gần với `@RestController`; Next.js lấy URL từ thư mục và HTTP method từ tên hàm export |
| `page.tsx` | Component tạo giao diện cho một URL; không phải REST endpoint JSON |
| `layout.tsx` | Khung giao diện bao quanh nhiều trang, chẳng hạn header, footer và vùng nội dung |
| Component | Hàm tạo một phần giao diện có thể tái sử dụng |
| Props | Dữ liệu đầu vào truyền từ component cha xuống con, gần với tham số hàm |
| State | Dữ liệu giao diện đang thay đổi; cập nhật state khiến React render lại, ví dụ trạng thái đang gửi form |
| `src/lib` | Nơi đặt helper và code dùng chung; không tự đăng ký HTTP endpoint |
| `export` / `import` | Cho module khác sử dụng hàm/biến; không cần tạo Spring bean cho mọi helper |
| `import type` | Chỉ nhập thông tin kiểu cho TypeScript; phần import này không trở thành giá trị JavaScript lúc chạy |
| `async` / `await` | Làm việc với `Promise`, có thể liên hệ với kết quả bất đồng bộ; `await` chờ trong hàm, không chặn toàn bộ server |
| `as LoginRequest` | Khẳng định kiểu với TypeScript; **không** tương đương parse và validate DTO bằng `@Valid` |
| `@/lib/...` | Alias trỏ vào `src/lib/...`, được khai báo trong `tsconfig.json`; không phải annotation |
| `.ts` / `.tsx` | `.tsx` cho phép viết JSX, tức cú pháp mô tả giao diện trong TypeScript |

Đọc chữ ký hàm đang làm:

```ts
export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
): void {
  // Bạn tự viết phần đặt cookie ở đây.
}
```

- `export`: file login có thể import hàm này.
- `response: NextResponse`: tham số tên `response`, kiểu `NextResponse`; TypeScript viết kiểu sau dấu `:`.
- `refreshToken: string`: gần với `String refreshToken` trong Java.
- `: void`: hàm sửa response được truyền vào và không trả một giá trị để sử dụng.
- `response.cookies.set({ ... })`: truyền một object cấu hình. Các cặp `name: value` bên trong gần với các thuộc tính bạn cấu hình qua builder trong Java.

Bài đọc ngắn: [TypeScript — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), chỉ đọc phần Functions, Object Types, Optional Properties, Union Types và Type Assertions trước. Khi gặp `string | null`, hiểu là giá trị có thể là chuỗi hoặc `null`.

## 4. Hiểu luồng xác thực của dự án

Next.js vừa tạo giao diện vừa có phần code server. Phần server đứng giữa browser và Spring Boot ở luồng xác thực được gọi là **BFF — Backend for Frontend**.

```mermaid
sequenceDiagram
    participant U as Form React trong browser
    participant N as Next.js BFF
    participant S as Spring Boot
    U->>N: POST /api/auth/login với email, password
    N->>S: POST /api/v1/auth/login
    S-->>N: accessToken, refreshToken, user
    N-->>U: JSON đã bỏ refreshToken + header Set-Cookie
    Note over U: Browser lưu HttpOnly cookie; app giữ accessToken trong memory
    U->>S: GET /api/v1/auth/me với Bearer accessToken
    S-->>U: Hồ sơ người dùng
```

Hai nơi lưu token có mục đích khác nhau:

- **Access token trong memory:** JavaScript dùng để gắn header `Authorization`. Reload trang làm mất biến này. Không dùng biến token chung ở Next.js server để đại diện cho nhiều người dùng.
- **Refresh token trong HttpOnly cookie:** browser lưu cookie và tự gửi đến các request phù hợp. JavaScript không đọc được cookie qua `document.cookie`; BFF đọc được cookie từ HTTP request. HttpOnly không loại bỏ mọi rủi ro XSS.

Phân biệt URL frontend và backend:

| Chức năng | Request từ browser | BFF gọi Spring Boot |
| --- | --- | --- |
| Login | `POST /api/auth/login` | `POST /api/v1/auth/login` |
| Refresh, dự kiến | `POST /api/auth/refresh` | `POST /api/v1/auth/refresh-token` |
| Logout, dự kiến | `POST /api/auth/logout` | `POST /api/v1/auth/logout` |
| Hồ sơ | API client gọi backend bằng Bearer | `GET /api/v1/auth/me` |

Browser gọi backend trực tiếp phải có CORS cho origin frontend. BFF gọi backend là server-to-server. Cookie có `path: /api/auth` dành cho BFF; backend nhận refresh token qua JSON do BFF tạo.

Hai chi tiết phải nhớ từ [AuthServiceImpl.java](D:/SmartEventRepos/smartevent-backend/src/main/java/com/smartevent/modules/identity/service/impl/AuthServiceImpl.java):

1. Backend **xoay vòng refresh token**: refresh thành công sẽ thu hồi token cũ và trả token mới. BFF phải cập nhật cookie; không gửi lại token cũ.
2. `expiresIn` hiện lấy từ thời hạn access token tính bằng **milliseconds**. Cookie `maxAge` tính bằng **seconds**. Không gán hai giá trị cho nhau. Thời hạn access token cũng không phải thời hạn refresh token.

## 5. Chặng A — Hoàn thiện phần xác thực phía server

### Bài 3 — Hoàn thiện helper đặt cookie

**Mục tiêu:** hiểu hàm, object cấu hình và cách response yêu cầu browser lưu cookie.

**File làm việc:** [refresh-cookie.ts](D:/SmartEventRepos/smartevent-web/src/lib/auth/refresh-cookie.ts), [login handler](D:/SmartEventRepos/smartevent-web/src/app/api/auth/login/route.ts).

**Đọc trước:** [NextResponse — cookies](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-response.md), phần `cookies`; [Cookie options](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md), phần `Options`.

Việc tự làm:

1. Giữ nguyên chữ ký `setRefreshTokenCookie` đã có.
2. Trong hàm, gọi `response.cookies.set` với cấu hình bên dưới.
3. Import helper vào login, thay đoạn cấu hình cookie trực tiếp bằng một lời gọi helper.
4. Xóa các constant cookie bị lặp trong login; để tên cookie được quản lý ở một nơi.

| Thuộc tính | Giá trị cần dùng | Ý nghĩa |
| --- | --- | --- |
| `name` | `REFRESH_COOKIE_NAME` | Tên cookie thống nhất giữa login, refresh và logout |
| `value` | Tham số `refreshToken` | Giá trị nhận từ backend |
| `httpOnly` | `true` | Không cho JavaScript đọc cookie |
| `secure` | `process.env.NODE_ENV === "production"` | Cấu hình ứng dụng dùng HTTPS ở production; dev local đang dùng HTTP |
| `sameSite` | `"strict"` | Giới hạn gửi cookie trong ngữ cảnh same-site của luồng hiện tại |
| `path` | `"/api/auth"` | Giới hạn đường dẫn gửi cookie; đây không phải cơ chế phân quyền |
| `maxAge` | `REFRESH_COOKIE_MAX_AGE` | Constant hiện tại là `7 * 24 * 60 * 60` giây |

Giữ `import "server-only"` để Next.js phát hiện việc import nhầm module này vào code client. Có thể đọc thêm mục `Preventing environment poisoning` trong [Server and Client Components](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md).

**Tự kiểm tra:** chạy lint, typecheck, build. Kiểm tra JSON sai vẫn trả 400. Khi backend local và tài khoản thử có sẵn, login đúng phải có header `Set-Cookie`, còn JSON gửi về browser không chứa refresh token.

**Tự giải thích:** vì sao hàm trả `void` vẫn làm response có cookie? Vì sao kiểm tra JSON sai chưa chứng minh được cookie hoạt động?

- [ ] Helper có nội dung, được login gọi và kiểm tra cookie thành công.

### Bài 4 — Xử lý lỗi login có chủ đích

**Mục tiêu:** áp dụng thói quen validate DTO của backend vào ranh giới HTTP của BFF.

**Đọc trước:** phần Type Assertions của tài liệu TypeScript ở mục 3; đọc lại toàn bộ login handler.

Việc tự làm:

1. Phân biệt JSON sai cú pháp với JSON đúng cú pháp nhưng sai cấu trúc: `not-json`, `null`, `{}`, hoặc `email` là số.
2. Kiểm tra body là object và email/password là chuỗi hợp lệ trước khi gọi backend. Backend vẫn là nơi quyết định thông tin đăng nhập đúng hay sai.
3. Bắt lỗi backend trả dữ liệu không phải JSON. Không để `backendResponse.json()` lỗi ngoài luồng xử lý.
4. Chỉ coi login thành công khi status, `success` và dữ liệu token cần thiết phù hợp. Backend trả 200 nhưng thiếu token phải được coi là lỗi response upstream, không tạo phiên thành công.
5. Không chuyển nguyên payload bất thường từ upstream về browser; trả thông báo phù hợp, không lộ token hoặc chi tiết nội bộ.

**Tự kiểm tra:** JSON lỗi/sai cấu trúc trả 400; sai thông tin đăng nhập hiển thị lỗi từ luồng backend phù hợp; backend không kết nối được trả lỗi gateway có kiểm soát. Trường hợp response upstream sai cấu trúc có thể kiểm tra bằng mock khi học test, không sửa dữ liệu backend thật để tạo lỗi.

Giữ nguyên ý nghĩa HTTP 429 khi backend giới hạn số lần thử và hiển thị thông báo chờ. Login hiện chỉ yêu cầu password không trống; quy tắc tối thiểu 8 ký tự của đăng ký không tự áp vào login.

- [ ] Handler phân biệt được lỗi đầu vào, lỗi xác thực và lỗi upstream.

### Bài 5 — Thêm helper xóa cookie và logout

**Mục tiêu:** hiểu logout gồm cả thu hồi phiên ở backend và xóa trạng thái browser.

**File dự kiến:** mở rộng helper hiện tại; tạo `D:/SmartEventRepos/smartevent-web/src/app/api/auth/logout/route.ts`.

**Đọc trước:** [Cookie API](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md), phần đọc và xóa cookie; [AuthController.java](D:/SmartEventRepos/smartevent-backend/src/main/java/com/smartevent/modules/identity/controller/AuthController.java).

Việc tự làm:

1. Viết `clearRefreshTokenCookie(response: NextResponse): void` trong helper.
2. Cho cookie hết hạn bằng giá trị rỗng và `maxAge: 0`; giữ cùng tên và path `/api/auth` như lúc đặt. Không mặc định xóa ở path `/` rồi cho rằng cookie cũ đã mất.
3. Tạo handler `POST`; đọc cookie qua `NextRequest.cookies` hoặc `await cookies()` từ `next/headers`.
4. Nếu có cookie, BFF gửi `{ refreshToken }` đến `/api/v1/auth/logout`. Nếu không có, cho phép thao tác logout hoàn tất tại local.
5. Xóa cookie local cả khi backend không kết nối được; phân biệt thông báo xóa phiên local với xác nhận thu hồi thành công ở backend.

Backend hiện thu hồi refresh token; không nên kết luận access token đã phát hành lập tức mất hiệu lực chỉ vì logout. Phía React sẽ xóa token memory ở bài sau.

**Tự kiểm tra:** logout làm cookie hết hạn; logout lần nữa vẫn xử lý ổn; refresh bằng phiên đã logout bị từ chối. Chỉ dùng tài khoản thử local, không chia sẻ token khi gửi kết quả review.

- [ ] Logout BFF và helper xóa cookie hoạt động.

### Bài 6 — Viết refresh handler

**Mục tiêu:** browser khôi phục access token mà không phải đọc refresh token.

**File dự kiến:** `D:/SmartEventRepos/smartevent-web/src/app/api/auth/refresh/route.ts`.

**Đọc trước:** [schema.d.ts](D:/SmartEventRepos/smartevent-web/src/lib/api/schema.d.ts), tìm `RefreshTokenRequest`, `TokenRefreshResponse`; đối chiếu method `refreshToken` trong `AuthServiceImpl.java`.

Luồng cần tự viết:

```text
Đọc refresh cookie
→ Thiếu cookie: trả 401
→ Có cookie: POST JSON đến /api/v1/auth/refresh-token
→ Thành công: cập nhật cookie bằng refresh token MỚI; trả access token và metadata an toàn
→ Phiên không hợp lệ/hết hạn/bị thu hồi: xóa cookie và yêu cầu đăng nhập lại
→ Lỗi mạng hoặc backend 5xx: trả lỗi tạm thời; không tự kết luận người dùng đã hết phiên
```

Giữ cách kiểm tra response đã học ở Bài 4. Thời hạn refresh cookie phải thống nhất với cấu hình thời hạn refresh token của backend; giá trị 7 ngày đang là mặc định, không phải cam kết cho mọi môi trường.

**Tự kiểm tra:** login → refresh → refresh tiếp bằng cookie mới đều được. Response JSON không chứa refresh token. Token cũ sau refresh không được dùng lại. Không tự retry vô hạn khi request refresh timeout: backend có thể đã xoay token dù response chưa đến browser.

- [ ] Refresh nhận token từ cookie, xoay cookie đúng và xử lý lỗi rõ ràng.

## 6. Chặng B — Học React qua một màn đăng nhập

### Bài 7 — Dựng form tĩnh và học JSX

**Mục tiêu:** chuyển từ mô tả màn hình sang component, props và HTML form.

**Đọc trước:** [React Quick Start](https://react.dev/learn), các mục Creating and nesting components, Writing markup with JSX, Displaying data và Conditional rendering.

Tham chiếu: [Login desktop](D:/SmartEventRepos/smartevent-web/ux-ui-phase1-final/customer/auth/login-desktop/screen.png) và [Login mobile](D:/SmartEventRepos/smartevent-web/ux-ui-phase1-final/customer/auth/login-mobile/screen.png).

Việc tự làm:

1. Tạo component `LoginForm` tại `D:/SmartEventRepos/smartevent-web/src/components/auth/login-form.tsx`; gọi nó từ trang login.
2. Dựng tiêu đề, label, input email, input password, nút đăng nhập và link đăng ký bằng JSX.
3. Học `className`, `htmlFor`, dấu `{}` chèn giá trị và cách truyền props. Gắn label với input thật.
4. Bắt đầu bằng form tĩnh để kiểm tra bố cục; ở bài kế tiếp mới nối sự kiện và API.

Giữ UI tiếng Việt. Backend chưa có luồng quên mật khẩu/social login; bỏ CTA tương ứng nếu còn trong bản mẫu. Không đổi nhãn đăng nhập thành số điện thoại vì `LoginRequest` đang yêu cầu email.

**Tự kiểm tra:** form xuất hiện ở `/login`; tab bằng bàn phím đến được các control; input mật khẩu che nội dung; không có lỗi JSX.

- [ ] Form tĩnh được tách thành component và có HTML phù hợp.

### Bài 8 — State, submit và gọi login BFF

**Mục tiêu:** hiểu UI thay đổi theo dữ liệu, không thao tác DOM thủ công như script trong HTML mẫu.

**Đọc trước:** React Quick Start, các mục Responding to events, Updating the screen và Sharing data between components; [Server and Client Components](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md), phần When to use Server and Client Components.

Việc tự làm:

1. Đặt `"use client"` ở component cần state/event handler. Trang bao ngoài vẫn có thể là Server Component.
2. Dùng state quản lý `isSubmitting`, lỗi và trạng thái hiện/ẩn mật khẩu. Chọn một cách đọc email/password: controlled inputs hoặc `FormData`.
3. Trong submit handler, ngăn hành vi tải lại trang mặc định và gọi `POST /api/auth/login` bằng JSON.
4. Khi chờ: khóa submit, hiển thị “Đang đăng nhập…”. Khi lỗi: giữ form và thông báo tiếng Việt. Dùng `finally` để đưa trạng thái chờ về đúng giá trị.
5. Khi thành công: lưu access token vào store hiện có, cập nhật thông tin người dùng cần thiết và điều hướng nội bộ đến `/account`.

`"use client"` cho phép phần giao diện dùng state, event và browser APIs; không có nghĩa mọi câu lệnh trong file chỉ chạy sau khi browser mở trang. Tránh truy cập `window` ngay lúc import/render nếu chưa hiểu quá trình render phía server.

**Tự kiểm tra:** bấm liên tục không gửi nhiều login; lỗi mạng không làm nút kẹt; bật/tắt mật khẩu không submit form; login đúng vào được account. Không lưu refresh token vào localStorage hoặc React state.

- [ ] Form gọi BFF, hiển thị trạng thái đúng và lưu access token.

### Bài 9 — Khôi phục phiên và gọi hồ sơ

**Mục tiêu:** refresh trang vẫn xác định được phiên; phân biệt đang kiểm tra với chưa đăng nhập.

**File dự kiến:** `D:/SmartEventRepos/smartevent-web/src/components/auth/auth-provider.tsx`, helper browser trong `src/lib/auth`, trang account.

Việc tự làm:

1. Xây `AuthProvider` quản lý tối thiểu trạng thái `checking`, `authenticated`, `unauthenticated` và thông tin user; có trạng thái lỗi tạm thời khi kiểm tra phiên thất bại do mạng.
2. Khi mở lại app, gọi BFF refresh để lấy access token, sau đó gọi `/api/v1/auth/me` bằng Bearer token.
3. Dùng kiểu hồ sơ trả về của `/me`; response refresh không có `user` như response login.
4. Để UI account chờ kiểm tra phiên, tránh vừa tải trang đã nhảy về login.
5. Nút logout gọi BFF và xóa token memory, user state, dữ liệu cá nhân đang hiển thị. Không để response refresh đang chạy phục hồi phiên sau thao tác logout.

**Tự kiểm tra:** reload sau login vẫn lấy được hồ sơ; phiên hết hạn hiển thị đăng nhập lại; lỗi mạng cho phép thử lại. Ẩn menu theo role chỉ hỗ trợ UX — backend vẫn phải kiểm tra quyền từng request.

- [ ] Khôi phục phiên, lấy hồ sơ và logout từ giao diện hoạt động.

### Bài 10 — Xử lý 401 mà không tạo vòng lặp

**Mục tiêu:** các request trong cùng một tab cùng gặp 401 chỉ khởi động một lần refresh.

Việc tự làm:

1. Viết helper giữ một `Promise` refresh đang chạy; các request khác chờ cùng kết quả. Đây là ý nghĩa của “single-flight” trong bài này.
2. Khi GET hồ sơ gặp 401 do access token: refresh, cập nhật token và thử lại request gốc tối đa một lần.
3. Không refresh vì lỗi 403; không cho endpoint login/refresh tự đi vào vòng refresh.
4. Chống tác động trùng khi effect chạy lại trong dev. Không tự retry mọi POST tạo đơn/thanh toán; đánh giá khả năng request trước đã được xử lý trước khi mở rộng cơ chế retry.

**Tự kiểm tra:** hai GET cần đăng nhập cùng gặp 401 dẫn đến một refresh trong tab; refresh thất bại thì cả hai dừng; không có vòng lặp request.

Một biến Promise chỉ đồng bộ được trong cùng môi trường JavaScript của tab. Kiểm tra nhiều tab và phối hợp refresh giữa các tab là bài nâng cao riêng, cần giải pháp phối hợp cùng đánh giá race condition của backend; chưa được coi là đã giải quyết bởi helper này.

- [ ] Refresh trong một tab không trùng và retry có giới hạn.

## 7. Chặng C — Áp dụng thiết kế và mở rộng tính năng

### Bài 11 — Hoàn thiện giao diện login responsive

**Mục tiêu:** áp dụng một thiết kế dùng chung ở nhiều kích thước màn hình.

Đọc [DESIGN.md](D:/SmartEventRepos/smartevent-web/ux-ui-phase1-final/design-system/DESIGN.md), [CSS](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/11-css.md), [Fonts](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md).

1. Học box model, flex/grid và breakpoint vừa đủ để bố trí form.
2. Dựng token màu, spacing, border radius và Be Vietnam Pro; áp dụng vào input/button có thật trước khi trích thêm component chung.
3. Dùng cùng component cho desktop/mobile, chỉ thay layout bằng CSS. Tham chiếu HTML Stitch để hiểu bố cục; chuyển tương tác sang React.
4. Dùng icon Lucide và ảnh local phù hợp; nếu chưa có asset, dùng nền đơn giản trong lúc luyện form.
5. Kiểm tra ở chiều rộng khoảng 390px, 768px và 1440px: không cuộn ngang ngoài ý muốn, label dễ đọc, focus rõ, nút submit và thông báo lỗi sử dụng được.

Bản design có vài giá trị khác nhau giữa bảng token và mô tả, ví dụ nền và radius. Ghi lại giá trị chọn khi làm component đầu tiên rồi dùng nhất quán, không tự kết luận mọi giá trị minh họa đều là yêu cầu đồng thời.

- [ ] Login hoàn chỉnh cả hành vi và bố cục desktop/mobile.

### Bài 12 — Đăng ký và tài khoản cơ bản

Tái sử dụng kiến thức form để làm `/register`, gọi `POST /api/v1/auth/register` với các trường theo schema. Đăng ký thành công không đồng nghĩa đã nhận token; chuyển sang login nếu backend không cấp token ở response register.

Theo DTO hiện tại: email, password và fullName là bắt buộc; password tối thiểu 8 ký tự; phone là tùy chọn. Trường nhập lại mật khẩu nếu có chỉ dùng kiểm tra tại form, không gửi thêm vào request. Không tuyên bố đã lưu sự đồng ý điều khoản nếu backend chưa có trường lưu dữ liệu đó.

Ở `/account`, hiển thị dữ liệu thật từ `/me`. Tính năng cập nhật hồ sơ chỉ làm khi có contract phù hợp; không tạo nút lưu giả. Kiểm tra email trùng, validation, API error và điều hướng sau đăng ký.

- [ ] Người mới đăng ký, đăng nhập và xem hồ sơ được bằng luồng thật.

### Các chặng sau xác thực

Route bên dưới là **đề xuất để triển khai**, không phải tất cả đã tồn tại. 138 ảnh UX/UI bao gồm desktop/mobile, modal và trạng thái; không tạo 138 route.

| Thứ tự | Chặng và route đề xuất | Phần học thêm | Tiêu chí hoàn thành |
| --- | --- | --- | --- |
| 1 | Storefront: `/`, `/events`, `/events/[slug]` | Layout chung, Link, danh sách, loading/empty/error, phân trang | Xem được sự kiện thật và chi tiết công khai của sự kiện `PUBLISHED` |
| 2 | Reservation và checkout: `/events/[slug]/booking`, `/checkout` | State lựa chọn vé/ghế, countdown dựa trên hạn backend | Giữ chỗ, xử lý hết hạn và tạo đơn đúng dữ liệu backend |
| 3 | Orders và VNPay: `/account/orders`, `/account/orders/[id]`, `/payment/result` | Điều hướng thanh toán, đối chiếu trạng thái async | Không suy ra trả tiền thành công chỉ từ query trên URL; chỉ hủy đơn `PENDING_PAYMENT` |
| 4 | Tickets và invoices: `/account/tickets`, `/account/invoices`, trang chi tiết | QR, tải file, form chuyển vé/gửi email | QR lấy từ `qrCodeBase64`; email invoice báo “đã tiếp nhận”, không báo đã gửi ngay |
| 5 | Organizer: `/organizer/events`, `/organizer/events/new`, `/organizer/events/[id]` | Wizard, form phức tạp, tab, quyền tài nguyên | Tạo sự kiện, cấu hình khu/vé/đợt bán và gửi duyệt; phản ánh đúng trạng thái backend |
| 6 | Admin: `/admin/events`, `/admin/categories`, `/admin/venues`, `/admin/outbox` | Table, filter có API hỗ trợ, modal xác nhận | CRUD/duyệt/retry có dữ liệu thật; kiểm tra contract cho danh sách chờ duyệt trước khi dựng màn |
| 7 | Check-in: `/checkin`, event/scanner/history bên trong | Camera permission, xử lý request trùng và mất mạng | Phân biệt thành công, không hợp lệ, trùng; timeout không kết luận vé hợp lệ hay không |

Trước chặng storefront, cần chốt các khoảng trống contract hiện thấy trong [schema.d.ts](D:/SmartEventRepos/smartevent-web/src/lib/api/schema.d.ts):

- Danh sách sự kiện chỉ có `pageable`; chưa thấy tham số keyword/category/city/date. Không tạo bộ lọc trông như tìm toàn bộ dữ liệu nếu thực tế chỉ lọc trang hiện tại.
- Kiểu query mô tả `pageable` dạng object: kiểm tra URL gửi thật và cách Spring bind `page`, `size`, `sort` trước khi chọn cách serialize cho API client.
- `EventResponse` chưa có giá thấp nhất, tên organizer hoặc URL ảnh trực tiếp. Cần xác định cách ghép dữ liệu từ API liên quan và quyền đọc file công khai; đánh giá số request trước khi làm đầy màn hình thẻ sự kiện.
- Nếu cần bổ sung backend, tách thành hạng mục riêng có request/response và tiêu chí kiểm thử rõ ràng. Không sửa tay file type được sinh từ OpenAPI.

Mỗi chặng bắt đầu bằng bảng nhỏ: **màn hình → dữ liệu cần → endpoint có sẵn → dữ liệu còn thiếu → trạng thái lỗi**. Sau đó mới viết component. Luôn đối chiếu [IMPLEMENTATION_NOTES.md](D:/SmartEventRepos/smartevent-web/ux-ui-phase1-final/IMPLEMENTATION_NOTES.md), đặc biệt giới hạn Phase 1: VNPay, giữ chỗ tối đa 10 phút, không favorite/follow, không refund tự động, không bịa báo cáo hoặc dữ liệu ngoài API.

## 8. Tài liệu tra cứu theo nhu cầu

Tài liệu Next.js local khớp package đang cài. Mở file để đọc, không chỉnh sửa tài liệu trong `node_modules`. Khi package thay đổi, kiểm tra lại hướng dẫn tương ứng.

| Khi đang vướng | Đọc phần nào |
| --- | --- |
| Không hiểu kiểu hàm/object/optional | [TypeScript Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| Không hiểu JSX/props/state/event | [React Quick Start](https://react.dev/learn) |
| Không biết file nào tạo URL | [Project structure](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md), [Layouts and pages](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md) |
| Không biết viết API trong Next.js | [Route Handlers](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md) |
| Không biết response đặt cookie thế nào | [NextResponse chính thức](https://nextjs.org/docs/app/api-reference/functions/next-response), mục `cookies` |
| Không hiểu thuộc tính cookie ở mức HTTP | [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) |
| Không biết code chạy ở server hay browser | [Server and Client Components](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md) |
| Muốn tham khảo quản lý phiên | [Authentication](D:/SmartEventRepos/smartevent-web/node_modules/next/dist/docs/01-app/02-guides/authentication.md), mục Setting cookies và Creating a Data Access Layer |
| Không biết UI cần trông thế nào | [UX/UI README](D:/SmartEventRepos/smartevent-web/ux-ui-phase1-final/README.md), ảnh màn tương ứng và Implementation Notes |

Ví dụ authentication trong tài liệu có thể tự quản lý session khác với hệ thống này. Học API và nguyên lý từ ví dụ; giữ Spring Boot là nơi xác thực, phát token và kiểm tra quyền cho SMART EVENT.

## 9. Cách kiểm tra và nhờ review

Chạy các lệnh từ `D:/SmartEventRepos/smartevent-web`. Các lệnh một dòng dưới đây dùng được trong Command Prompt hoặc PowerShell.

```text
npm run lint
npm run typecheck
npm run build
```

- `lint`: tìm vấn đề quy tắc code và một số lỗi dễ nhận ra; không tự chứng minh nghiệp vụ đúng.
- `typecheck`: kiểm tra kiểu; không validate dữ liệu mạng lúc chạy.
- `build`: kiểm tra việc đóng gói ứng dụng và đăng ký route; không đồng nghĩa đã login backend thành công.

Trong lúc viết, có thể dùng `npm run dev` để xem ngay thay đổi; cuối mỗi bài chạy bộ kiểm tra trên. Nếu dev đang chạy khi build gặp xung đột output, dừng dev rồi chạy build.

Kiểm tra lỗi JSON mà không cần backend:

```text
curl.exe -i -X POST "http://localhost:3000/api/auth/login" -H "Content-Type: application/json" --data-binary "not-json"
```

Lệnh trên chạy trong terminal thứ hai khi dev server đang mở. Chỉ đặt URL thô trong dấu nháy, không đưa cú pháp Markdown `[label](url)` vào câu lệnh.

Khi có form, mở DevTools của browser:

1. **Network:** xem request URL, HTTP status, body an toàn và response headers.
2. **Application/Storage → Cookies:** xem tên cookie, path, HttpOnly và thời hạn. Cookie HttpOnly vẫn hiển thị trong DevTools của chính người dùng.
3. **Console:** đọc lỗi giao diện; không log mật khẩu hoặc token để debug.
4. Reload trang, thử mất mạng và thao tác lại để kiểm tra state có trở về đúng hay không.

Trước khi lưu một mốc tiến độ:

```text
git status --short
git diff --check
git diff
```

`git diff` mặc định không hiển thị nội dung file mới chưa được theo dõi; nhớ mở file mới để tự đọc. Không đưa `.env.local` hoặc kết quả có token vào commit. Sau mỗi bài hoàn chỉnh, có thể tự tạo một commit nhỏ để dễ quay lại xem điều đã học.

Mẫu yêu cầu review có thể dùng:

> Tôi đang làm Bài … trong lộ trình. Mục tiêu của tôi là … Tôi đã sửa các file … Kết quả kiểm tra là … Tôi chưa hiểu đoạn … Hãy review và giải thích theo tư duy Spring Boot, gợi ý để tôi tự sửa.

**Buổi tiếp theo chỉ cần đạt:** hoàn thiện thân hàm `setRefreshTokenCookie`, gọi helper từ login, kiểm tra lại và giải thích được từng thuộc tính cookie. Sau đó đánh dấu xong Bài 3 và chuyển sang Bài 4.
