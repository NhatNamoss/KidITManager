# KidIT Manager

Ứng dụng quản lý học sinh, lớp học, lịch học, học phí và công giảng dạy. Frontend React/Vite, API Express trên Vercel, database MySQL/TiDB qua TLS.

## Chạy trên máy

Yêu cầu Node.js 24 và database hiện có của ứng dụng.

1. Chạy `npm ci`.
2. Sao chép `.env.example` thành `.env`, điền thông tin database mới và cấu hình đăng nhập:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.
   - `APP_PASSWORD`: mật khẩu quản lý, ít nhất 12 ký tự.
   - `SESSION_SECRET`: chuỗi ngẫu nhiên ít nhất 32 ký tự, dùng để ký cookie phiên đăng nhập. Có thể tự tạo bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Sao lưu database rồi chạy `npm run db:migrate` trên database thử nghiệm trước. Script chỉ tạo ba bảng mới, có thể chạy lại; không chuyển đổi hoặc xóa điểm danh cũ. Script yêu cầu các bảng hiện có như `classes`, `teachers`, `teacher_attendance` đã tồn tại.
4. Mở hai terminal: chạy `npm run dev:api` và `npm run dev`.
5. Vào địa chỉ Vite hiển thị và đăng nhập bằng `APP_PASSWORD` đã cấu hình.

Không bật `INIT_DB` trên Vercel. Migration là bước riêng trước khi triển khai; không chạy DDL trong mỗi lần khởi động serverless.

## Buổi dạy và chấm công

1. Vào **Lớp học → Chi tiết → Ghi buổi dạy**.
2. Chọn ngày, giờ bắt đầu và kết thúc. Lịch mặc định chỉ gợi ý giờ và nhân sự, có thể thay đổi cho từng buổi.
3. Chọn người thực tế dạy. Mọi nhân sự đều có thể được chọn làm người dạy chính hoặc trợ giảng trong buổi đó, không bị khóa theo chức danh mặc định.
4. Nếu chia ca, thêm từng người và nhập số phút công thực tế. Một người chỉ có một dòng trong cùng buổi; số phút không vượt thời lượng buổi. Các người cùng dạy có thể cùng nhận đủ thời lượng buổi.
5. Chọn **Chưa xác nhận**, **Đã dạy, tính công**, hoặc **Đã hủy, không tính công**. Chỉ xác nhận sau giờ kết thúc theo giờ Việt Nam. Không hỗ trợ ca qua nửa đêm.
6. Vào **Chấm công** để lọc tháng/nhân sự, đối chiếu từng buổi và xuất CSV mở bằng Excel.

Số lượt dạy là số buổi người đó được ghi nhận, tách theo vai trò; người chia ca vẫn là một lượt và có số phút riêng. Chưa tự quy đổi thành tiền lương vì chưa có quy tắc đơn giá theo buổi/giờ/vai trò. CSV xuất chi tiết buổi theo bộ lọc hiện tại.

Một lớp không được có hai buổi đang hiệu lực trùng giờ. Có thể sửa buổi đã lưu hoặc đổi trạng thái thành đã hủy; không xóa cứng công. Hai người cùng sửa một buổi sẽ nhận cảnh báo xung đột thay vì âm thầm ghi đè. Mỗi lần lưu có bản ghi trong `session_revisions`.

Điểm danh giáo viên kiểu cũ vẫn được giữ và hiển thị riêng trong bảng công để đối chiếu. Các dòng này chưa đủ giờ ca nên không tự cộng vào công mới. Điểm danh học sinh hiện vẫn theo ngày và độc lập với công giảng dạy.

## Đưa bản sửa lên Vercel

1. Đổi mật khẩu database đã từng nằm trong source; cập nhật thông tin mới ở biến môi trường của Vercel và `.env` trên máy. Không dán mật khẩu vào source hoặc chat.
2. Thêm đầy đủ bảy biến môi trường trong `.env.example` vào đúng môi trường Vercel cần triển khai. `APP_PASSWORD` và `SESSION_SECRET` chỉ ở phía máy chủ, không đặt tiền tố `VITE_`.
3. Sao lưu database và chạy migration trên đúng database bằng `npm run db:migrate`. Kiểm tra ba bảng `teaching_sessions`, `session_staff`, `session_revisions` được tạo thành công.
4. Chạy `npm test`, `npm run lint`, `npm run build`, `npm audit`.
5. Commit các thay đổi cần triển khai và đẩy lên repository liên kết với Vercel hoặc dùng quy trình deploy hiện có. Build command: `npm run build`; output: `dist`. Giữ `vercel.json` để `/api/*` về Express và các đường dẫn frontend về SPA.
6. Sau deploy, thử bằng cửa sổ riêng tư: trang yêu cầu đăng nhập, API dữ liệu trả 401 nếu chưa đăng nhập; đăng nhập đúng thì tải được danh sách; thử buổi dạy trên môi trường Preview/database thử nghiệm trước khi nhập công thật.

Nếu thiếu cấu hình đăng nhập, API từ chối truy cập và giao diện báo cần cấu hình. Không có mật khẩu mặc định hoặc chế độ bỏ qua đăng nhập.

`git rm --cached` đã bỏ theo dõi các dump SQL, file `.db` và `sqlite.zip`; bản gốc vẫn ở máy. `.gitignore` và `.vercelignore` ngăn đưa các file đó vào những bản mới. Thao tác này không xóa dữ liệu hoặc mật khẩu khỏi các commit/deployment cũ; cần đổi mật khẩu, rà soát quyền truy cập repository và xử lý lịch sử riêng nếu cần.

## Kiểm tra tự động và giao diện

- `npm test`: kiểm tra validation, dạy thay/chia ca, nhiều ca trong ngày, trùng giờ, trạng thái hủy, tổng hợp công, bản sửa xung đột, hoàn tác giao dịch, cookie đăng nhập và cấu hình thiếu.
- Các test API dùng SQLite trong bộ nhớ với adapter giao diện MySQL. Chúng kiểm tra hành vi và giao dịch của route, chưa thay thế chạy migration và kiểm tra khóa đồng thời trên MySQL/TiDB thật.
- `node scripts/test-server.js` + `npm run dev`: chạy giao diện với dữ liệu giả trong bộ nhớ, không kết nối database thật. Chỉ dùng trên máy để kiểm thử; mật khẩu fixture nằm trong `tests/fixture.js` và không dùng cho production. Dừng server fixture trước khi chạy API thật vì cùng dùng port 5000.
- Báo cáo rà soát và các giới hạn còn lại: [docs/APP-REVIEW-2026-10-15.md](docs/APP-REVIEW-2026-10-15.md).
