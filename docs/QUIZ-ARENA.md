# Đấu trường trắc nghiệm theo đội

## Sử dụng

1. Khởi tạo bảng mới trên database của môi trường cần dùng: `npm run db:migrate:quiz`. Lệnh này chỉ chạy migration `003-quiz-rooms.sql`, không tạo/đổi tài khoản hoặc sửa dữ liệu lớp. Migration chung `npm run db:migrate` cũng đã bao gồm bảng này.
2. Chạy API và frontend như README. Giáo viên đăng nhập, vào **Công cụ trên lớp → Đấu trường trắc nghiệm**.
3. Nhập tên trận, chọn 2–6 đội, 10–120 giây/câu, soạn tối đa 30 câu (4 đáp án/câu), hoặc chủ động nạp 4 câu mẫu Tin học.
4. Tạo phòng, gửi link `/play/123456` hoặc cho học sinh mở `/play` và nhập mã 6 số. Mỗi học sinh dùng máy riêng, nhập tên phân biệt và được xếp vào đội ít người nhất. Không dùng tài khoản giáo viên để tham gia.
5. Giáo viên có thể đổi đội thủ công hoặc chia lại ngẫu nhiên trước khi bắt đầu. Mỗi đội phải có ít nhất một bạn. Người đầu danh sách đội là đội trưởng.
6. Bắt đầu, theo dõi số người trả lời. Câu đóng khi tất cả đã trả lời, hết thời gian, hoặc giáo viên nhấn đóng câu. Giáo viên chủ động mở câu tiếp theo. Sau câu cuối, nhấn **Xem kết quả chung cuộc**.

Để chơi từ nhiều máy, dùng cùng địa chỉ hosting đã triển khai. `127.0.0.1` chỉ mở được trên chính máy chạy thử. Phòng ở bản fixture chỉ để kiểm thử, không chia sẻ với lớp thật.

## Điểm và kỹ năng

- Mỗi học sinh có một lượt trả lời/câu, đúng được 100 điểm. Điểm câu đang mở và đáp án đúng được giữ kín cho cả giáo viên và học sinh cho đến khi đóng câu.
- Tổng điểm quyết định thứ hạng cuối trận. Tỉ lệ thành viên trả lời đúng quyết định quyền kỹ năng mỗi vòng. Các đội cùng tỉ lệ cao nhất đều được 1 lượt; vòng không có ai đúng không thưởng. Tối đa tích trữ 3 lượt.
- Đội trưởng chọn kỹ năng trong câu đang mở; thưởng của một vòng dùng được từ vòng sau. Đóng băng khóa trả lời cả đội đối thủ 3 giây, được kiểm tra ở máy chủ. Cầu lửa che một phần đáp án 4 giây. Lá chắn chặn một đòn, hết hiệu lực khi đóng câu.
- Sau một đòn tấn công, đội mục tiêu được bảo vệ 8 giây. Không thể tự tấn công, gửi trùng đáp án, dùng kỹ năng khi không phải đội trưởng, hoặc gửi thao tác cho câu cũ.

## Âm thanh vòng chơi

Mỗi máy có nút **Bật âm thanh** trong đầu phòng. Cần bấm trên từng máy/tab sau khi mở hoặc tải lại để trình duyệt cho phép phát. Có nhạc nền nhẹ trong câu hỏi, âm mở câu, tiếng đếm 5 giây cuối, báo đã gửi đáp án, báo đúng/sai khi công bố kết quả, hiệu ứng kỹ năng và âm kết thúc trận.

Mở **Tùy chỉnh âm thanh** để chỉnh âm lượng 0–100%, bật/tắt riêng nhạc nền hoặc **Nghe thử**. Âm lượng được nhớ trên trình duyệt; mặc định 35%. Nút tắt dừng cả các nốt đã lên lịch. Nhạc dừng khi đóng câu, mất đồng bộ, ẩn tab hoặc rời phòng; không phát lại toàn bộ âm sự kiện khi kết nối lại.

Âm thanh được tạo tại máy người dùng bằng Web Audio, không tải tệp âm thanh bên ngoài, không cần bảng database mới hoặc dịch vụ âm thanh riêng trên Vercel.

## Đồng bộ và lưu trữ

Trạng thái phòng nằm trong bảng MySQL `quiz_rooms`, tương thích mô hình Express/Vercel hiện tại. Mỗi thay đổi cập nhật theo phiên bản và thử lại có khoảng chờ khi xung đột; không dùng bộ nhớ của một tiến trình làm nguồn dữ liệu trận. Các máy lấy trạng thái khoảng mỗi 900ms. Đồng hồ dựa trên mốc thời gian máy chủ.

Phòng hết hạn sau 24 giờ và nhận tối đa 80 học sinh. Hết hạn ngăn truy cập nhưng không tự xóa hàng database. Giáo viên chỉ điều khiển phòng do mình tạo. Mã phòng dùng để tham gia; mỗi học sinh nhận token ngẫu nhiên riêng, database chỉ lưu hash. Token lưu trong sessionStorage của tab để tải lại tiếp tục. Đóng tab hoặc xóa dữ liệu trình duyệt có thể mất phiên; người chơi mới không vào được sau khi bắt đầu trận.

Mất mạng có thông báo và tự kết nối lại. Khi quá 5 giây không đồng bộ, máy học sinh khóa nút gửi để tránh thao tác với câu cũ. Đáp án đã được máy chủ nhận vẫn được giữ dù phản hồi về máy học sinh bị mất.

## Kiểm thử tại máy

`node scripts/test-server.js` chạy database SQLite trong bộ nhớ. Có tài khoản `gv1` / `kidit`. Chạy Vite với proxy trỏ vào fixture. Database thật không được gọi trong kiểm thử.

`tests/quiz.test.js` kiểm tra truy cập học sinh không cần tài khoản, quyền sở hữu phòng, giữ kín đáp án/điểm, token hash, cập nhật đồng thời, chống trả lời lặp, ba kỹ năng, đội trưởng, hết giờ, đồng bộ lại, câu cũ, hết hạn, cân bằng chia đội và một đợt 80 người chơi gửi đáp án đồng thời. Kiểm thử SQLite xác minh logic; chưa thay thế đo tải hoặc kiểm tra tranh chấp thực tế trên MySQL/TiDB và Vercel.

## Hướng giao diện

Giữ nhận diện đang dùng của KidIT: nền giấy ấm, xanh ngọc cho thao tác chính, Segoe UI cho dấu tiếng Việt, khối nội dung và đường kẻ rõ. Câu hỏi là điểm tập trung; đáp án có chữ A/B/C/D, chọn/đúng có nhãn chữ. Phòng chờ ưu tiên danh sách đội, khi chơi ưu tiên câu hỏi và bảng điểm, điện thoại dùng một cột đáp án.

ENERGY 2 / RHYTHM 2 / MOTION 2. Chuyển động ngắn chỉ khi kỹ năng trúng mục tiêu; màu băng và lửa diễn tả hiệu ứng được người dùng yêu cầu, không dùng để trang trí các phần khác. Tôn trọng reduced-motion. Không thêm logo, hình nhân vật, số liệu hoặc lời chứng thực giả.
