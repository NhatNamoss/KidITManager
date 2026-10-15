# KidIT Manager

Ứng dụng quản lý học sinh, lớp học, lịch học, học phí và công giảng dạy. Frontend React/Vite, API Express trên Vercel, database MySQL/TiDB qua TLS.

## Chạy trên máy

Yêu cầu Node.js 24 và database hiện có của ứng dụng.

1. Chạy `npm ci`.
2. Thông tin kết nối database cũ đã nằm trong `server/database-config.js`, được API và script migration dùng chung. Không cần tạo `.env` hoặc cấu hình `DB_*` trên Vercel.
3. Sao lưu database rồi chạy `npm run db:migrate` trên database thử nghiệm trước. Script chỉ tạo ba bảng mới, có thể chạy lại; không chuyển đổi hoặc xóa điểm danh cũ. Script yêu cầu các bảng hiện có như `classes`, `teachers`, `teacher_attendance` đã tồn tại.
4. Mở hai terminal: chạy `npm run dev:api` và `npm run dev`.
5. Vào địa chỉ Vite hiển thị để sử dụng trực tiếp. Theo yêu cầu của chủ ứng dụng, web và API không yêu cầu đăng nhập; người truy cập có thể xem và sửa dữ liệu.

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

1. Thông tin kết nối nằm sẵn trong `server/database-config.js` theo yêu cầu chủ ứng dụng. Khi đổi database, sửa file này.
2. Không cần thêm biến môi trường database trên Vercel. File cấu hình chỉ được import bởi code phía máy chủ, không đưa vào frontend.
3. Sao lưu database và chạy migration trên đúng database bằng `npm run db:migrate`. Kiểm tra ba bảng `teaching_sessions`, `session_staff`, `session_revisions` được tạo thành công.
4. Chạy `npm test`, `npm run lint`, `npm run build`, `npm audit`.
5. Commit các thay đổi cần triển khai và đẩy lên repository liên kết với Vercel hoặc dùng quy trình deploy hiện có. Build command: `npm run build`; output: `dist`. Giữ `vercel.json` để `/api/*` về Express và các đường dẫn frontend về SPA.
6. Sau deploy, thử bằng cửa sổ riêng tư: mở thẳng danh sách và bảng công không cần đăng nhập; thử buổi dạy trên môi trường Preview/database thử nghiệm trước khi nhập công thật.

Không cần cấu hình mật khẩu ứng dụng hoặc khóa phiên đăng nhập.

`git rm --cached` đã bỏ theo dõi các dump SQL, file `.db` và `sqlite.zip`; bản gốc vẫn ở máy. `.gitignore` và `.vercelignore` ngăn đưa các file đó vào những bản mới. Database từ xa vẫn được giữ nguyên.

## Kiểm tra tự động và giao diện

- `npm test`: kiểm tra validation, dạy thay/chia ca, nhiều ca trong ngày, trùng giờ, trạng thái hủy, tổng hợp công, bản sửa xung đột, hoàn tác giao dịch và truy cập đọc/ghi không cần đăng nhập.
- Các test API dùng SQLite trong bộ nhớ với adapter giao diện MySQL. Chúng kiểm tra hành vi và giao dịch của route, chưa thay thế chạy migration và kiểm tra khóa đồng thời trên MySQL/TiDB thật.
- `node scripts/test-server.js` + `npm run dev`: chạy giao diện dùng trực tiếp với dữ liệu giả trong bộ nhớ, không kết nối database thật. Dừng server fixture trước khi chạy API thật vì cùng dùng port 5000.
- Báo cáo rà soát và các giới hạn còn lại: [docs/APP-REVIEW-2026-10-15.md](docs/APP-REVIEW-2026-10-15.md).
