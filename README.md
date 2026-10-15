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
2. Nhập ngày, tháng, năm vào ba ô riêng, rồi chọn giờ bắt đầu và kết thúc. Phần điểm danh học sinh có ô chọn ngày có học, tháng và năm; ngày không nằm trong lịch lớp không xuất hiện. Lịch mặc định chỉ gợi ý giờ và nhân sự, có thể thay đổi cho từng buổi.
3. Chọn người thực tế dạy. Mọi nhân sự đều có thể được chọn làm người dạy chính hoặc trợ giảng trong buổi đó, không bị khóa theo chức danh mặc định.
4. Chọn từng người thực tế dạy hoặc dạy thay. **Mỗi người được 1 công cho một buổi đã xác nhận**, tách theo vai trò dạy chính/trợ giảng. Một người chỉ có một dòng trong cùng buổi; không nhập phút hoặc giờ công.
5. Chọn **Chưa xác nhận**, **Đã dạy, tính công**, hoặc **Đã hủy, không tính công**. Chỉ xác nhận sau giờ kết thúc theo giờ Việt Nam. Không hỗ trợ ca qua nửa đêm.
6. Vào **Chấm công** để lọc tháng/nhân sự, đối chiếu từng buổi và xuất CSV mở bằng Excel.

Số công được tính hoàn toàn theo buổi, không phụ thuộc thời lượng: dạy hai buổi được hai công. Giờ bắt đầu/kết thúc chỉ để phân biệt ca, kiểm tra trùng lịch và xác nhận buổi đã kết thúc. Bảng công và CSV đều dùng cột **Số công (buổi)**, không có cột phút/giờ công. Chưa tự quy đổi thành tiền lương vì chưa có đơn giá theo buổi/vai trò.

Database cũ được giữ tương thích, không cần migration: trường phút cũ không còn dùng để tính công. Mỗi dòng nhân sự trong buổi đã xác nhận được tính một công, kể cả dữ liệu đã lưu từ trước.

Một lớp không được có hai buổi đang hiệu lực trùng giờ. Có thể sửa buổi đã lưu hoặc đổi trạng thái thành đã hủy; không xóa cứng công. Hai người cùng sửa một buổi sẽ nhận cảnh báo xung đột thay vì âm thầm ghi đè. Mỗi lần lưu có bản ghi trong `session_revisions`.

Điểm danh giáo viên kiểu cũ vẫn được giữ và hiển thị riêng trong bảng công để đối chiếu. Các dòng này chưa đủ giờ ca nên không tự cộng vào công mới. Điểm danh học sinh hiện vẫn theo ngày và độc lập với công giảng dạy.

## Ngày điểm danh học sinh theo lịch lớp

- Bắt đầu từ **01/10/2026 (thứ Năm)**, không có ngày trước mốc này trong phần chọn điểm danh.
- Chỉ chọn được đúng thứ có lịch học của lớp. Ví dụ, lớp học thứ Năm có các ngày 01, 08, 15, 22, 29 trong tháng 10/2026. Một lớp có hai ca cùng ngày vẫn có một ngày điểm danh học sinh.
- Đổi tháng/năm sẽ tự tính theo lịch thực tế, gồm cả năm nhuận. Lớp chưa có lịch thì không có ngày để điểm danh.
- Sửa lịch ở mục Lớp học sẽ tự tính lại chuỗi ngày cho tất cả tháng. Tab điểm danh đang mở được cập nhật khi nhận thông báo đổi lịch từ tab khác hoặc khi quay lại tab. API cũng kiểm tra lịch mới trước khi lưu, tránh ghi bằng ngày đã hết hiệu lực.
- Dữ liệu điểm danh đã lưu không bị xóa hoặc chuyển sang ngày khác khi sửa lịch. Các ngày không còn thuộc lịch mới sẽ không xuất hiện trong bộ chọn.
- Không cần cron, automation bên ngoài hay migration database cho thay đổi này.

## Xuất thời khóa biểu

- **Xuất ảnh**: giữ bản lịch học chỉ có tên lớp như trước.
- **Xuất TKB cho GV**: xuất thêm giáo viên (GV) và trợ giảng (TG) theo phân công mặc định của từng lớp. Các lớp trùng ca được tách rõ, người chưa được phân công có thông báo tương ứng. Tên file có thêm `GV_` để phân biệt.

## Công cụ hỗ trợ giảng dạy

Vào **Công cụ hỗ trợ** (`/tools`) từ menu. Các công cụ không cần thêm bảng database:

- **Đếm ngược giờ:** nhập phút/giây hoặc dùng mốc nhanh, bắt đầu/tạm dừng/tiếp tục, đặt lại, cộng thêm một phút, chuông và thông báo hết giờ. Có chế độ phóng to trong trang và popup riêng (`/tools/timer`). Popup đồng bộ cùng bộ đếm với trang chính trên cùng trình duyệt; trình duyệt cần cho phép cửa sổ bật lên. Đồng hồ vẫn giữ mốc kết thúc khi chuyển trang hoặc tải lại, kèm chỉ báo ở đầu trang. Có nút thử chuông; tại popup có thể nhấn thử chuông để bật âm thanh cho cửa sổ đó.
- **Bốc thăm học sinh:** nhập mỗi tên một dòng hoặc lấy từ danh sách lớp. Có chế độ không gọi lặp lại và bắt đầu lượt mới. Tên từ lớp kèm mã học sinh để phân biệt người trùng tên.
- **Chia nhóm:** chia ngẫu nhiên thành tối đa 20 nhóm, giữ đủ học sinh và cân bằng số lượng, sao chép kết quả hoặc chuyển nhóm thành bảng điểm mới (tối đa 10 đội).
- **Bảng điểm thi đua:** đổi tên, thêm/bỏ đội, cộng/trừ điểm, đưa điểm về 0; có thể xem thành viên nếu tạo từ nhóm.

Danh sách nhập và bảng điểm được lưu trên trình duyệt, không lưu vào database trung tâm. Lịch sử bốc thăm và kết quả chia nhóm giữ trong trang đang mở. Mỗi trình duyệt có dữ liệu công cụ riêng.

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

- `npm test`: kiểm tra validation, dạy thay, nhiều ca trong ngày, trùng giờ, trạng thái hủy, tính công theo buổi không phụ thuộc thời lượng, bản sửa xung đột, hoàn tác giao dịch và truy cập đọc/ghi không cần đăng nhập.
- Các test API dùng SQLite trong bộ nhớ với adapter giao diện MySQL. Chúng kiểm tra hành vi và giao dịch của route, chưa thay thế chạy migration và kiểm tra khóa đồng thời trên MySQL/TiDB thật.
- `node scripts/test-server.js` + `npm run dev`: chạy giao diện dùng trực tiếp với dữ liệu giả trong bộ nhớ, không kết nối database thật. Dừng server fixture trước khi chạy API thật vì cùng dùng port 5000.
- Báo cáo rà soát và các giới hạn còn lại: [docs/APP-REVIEW-2026-10-15.md](docs/APP-REVIEW-2026-10-15.md).
