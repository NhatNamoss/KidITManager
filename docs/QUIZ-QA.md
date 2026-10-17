# Kiểm tra Đấu trường trắc nghiệm

Ngày kiểm tra: 17/10/2026. Phạm vi: mã nguồn trong workspace, API fixture SQLite trong bộ nhớ và trình duyệt cục bộ. Không thay đổi database thật, không triển khai hosting.

## Kết quả kỹ thuật

- PASS: `npm test`, 32/32 kiểm thử, gồm 7 kiểm thử mới về quiz và kiểm tra API thực tế chặn người chưa đăng nhập/cross-origin.
- PASS: `npm run build`, Vite hoàn tất. Cảnh báo chunk lớn nằm ở `classroom-scene`, không có lỗi build.
- PASS: `git diff --check`; `node --check` cho service, domain và script migration quiz.
- PASS: một đợt 80 học sinh đồng thời vào phòng và trả lời trong fixture; đủ 80 đáp án, mỗi đội 4000 điểm, không mất cập nhật. Đây là kiểm tra logic đồng thời trên adapter SQLite, không phải kết quả đo tải MySQL/Vercel.
- PASS: bộ tối đa 30 câu tiếng Việt, mỗi câu và đáp án đạt giới hạn độ dài, tạo phòng thành công dưới giới hạn JSON 192kb dành riêng cho route phòng.

## Thao tác trình duyệt đã kiểm tra

- PASS: giáo viên đăng nhập fixture, vào tab quiz, dùng bộ câu mẫu, thay thời gian, tạo phòng, sao chép link.
- PASS: hai tab học sinh nhập tên, vào cùng mã, được chia hai đội, gửi đáp án riêng; mỗi học sinh ghi 100 điểm và nhận kỹ năng khi vòng đóng.
- PASS: chia lại ngẫu nhiên, đổi đội thủ công, chặn bắt đầu khi còn đội trống; đủ đội thì bắt đầu được.
- PASS: đội trưởng dùng đóng băng và cầu lửa lên đối thủ; đã quan sát hiệu ứng cầu lửa. Lá chắn chặn đòn đóng băng và ghi rõ trong diễn biến. Chặn gửi khi đóng băng được xác minh bằng kiểm thử API.
- PASS: giáo viên chủ động đóng câu, mở câu tiếp theo, hoàn thành câu cuối, xem bảng chung cuộc; hai đội bằng điểm cùng được công nhận dẫn đầu.
- PASS: về soạn trận mới, nhập câu và bốn đáp án thủ công, đổi radio đúng, thêm/xóa câu, chọn ba đội, tạo phòng bằng nội dung tự soạn.
- PASS: xác nhận kết thúc sớm, hủy xác nhận, xác nhận lại; phòng đóng đúng trạng thái. Mở lại phòng cũ từ danh sách 24 giờ.
- PASS: tải lại máy học sinh vẫn giữ người chơi/đáp án; đổi phòng rồi nhập lại mã cũ khôi phục phiên đã lưu, không tạo người trùng.
- PASS: nhập mã không tồn tại có thông báo cụ thể. Mô phỏng mất mạng: có thông báo, nút đáp án khóa khi quá 5 giây; khôi phục mạng/tải lại giữ đúng phiên.
- PASS: sau một lần tải lại đầy đủ, không có lỗi JavaScript mới khi chơi tiếp và hoàn thành trận. Lỗi Fast Refresh khi đổi số hook trong lúc phát triển đã được loại khỏi phiên kiểm tra bằng tải lại, không xuất hiện ở phiên mới.

## Anti Slop Delivery Gate

Hướng thiết kế và lý do đã ghi ở `QUIZ-ARENA.md`: giữ nhận diện hiện có của KidIT. ENERGY 2 / RHYTHM 2 / MOTION 2. Người dùng chọn áp dụng trong lúc xây dựng.

### Hard Gate

- R-02 PASS: phần chữ mới không dùng em dash.
- R-03 PASS: máy học sinh ở 320px có scrollWidth 305px, ở 390px có scrollWidth 375px; 768px có scrollWidth 753px và hai cột đáp án. Máy giáo viên ở 390px có scrollWidth 375px; danh sách đội chuyển về một cột. Desktop đã xem ảnh chụp.
- R-17 PASS: số người, tiến độ và điểm đều lấy từ trạng thái phòng; giới hạn 80 người/30 câu/24 giờ được kiểm tra ở server.
- R-18 PASS: không có lời chứng thực, hình người hoặc khách hàng giả.
- R-23 PASS: không tạo logo, avatar hoặc ảnh mới; hiệu ứng băng/lửa bằng CSS phục vụ kỹ năng người dùng yêu cầu.
- R-24 PASS: `/play`, `/play/:code` và tab quiz được nối vào router thật; các link chia sẻ trỏ đến phòng tương ứng.
- R-25 PASS: chạy contrast-check.py: chữ chính trên trắng 12.06:1; chữ phụ trên giấy 5.46:1; trắng trên nút xanh 7.04:1. Biên điều khiển trên trắng 3.83:1 đáp ứng chuẩn phi văn bản. Giao diện tối: nhấn chính trên mặt khối 8.74:1, chữ phụ 8.28:1, biên 4.91:1.
- R-26 PASS: các loại nút/ô chọn mới đều có handler; các thao tác thực tế được ghi ở trên, không có nút trang trí hoặc tính năng hẹn sau.
- R-27 PASS: phòng trống có lời chờ, đang tải có văn bản, lỗi mã phòng và mất kết nối có thông báo; thiếu bảng có lỗi 503 hướng dẫn migration.
- R-28 PASS: không thêm FAQ.
- R-32 PASS: nút/biểu mẫu native, nhãn từng trường; Tab đến nút Đổi phòng có outline solid 3px; radio/select dùng được bằng bàn phím.
- R-33 PASS: các thay đổi nguồn được viết trực tiếp qua patch, không dùng script vá CSS/source.
- R-34 PASS: đã chuyển sáng/tối trên màn hình giáo viên, biến màu và điều khiển hiển thị đúng. Trang học sinh dùng giao diện sáng mặc định.
- R-35 PASS: app đã chạy qua luồng chơi trên ba tab, có kiểm thử kỹ năng, vòng cuối, soạn câu, lỗi và tải lại; build thành công.
- R-36 PASS: không đưa ra cam kết bảo mật/chứng nhận hoặc hiệu năng chưa kiểm chứng.
- R-37 PASS: hướng dựa trên nhận diện KidIT đang dùng, các dials và lý do hiệu ứng được ghi trước khi hoàn tất giao diện.
- R-38 PASS: bộ câu mẫu được đánh dấu rõ và chỉ nạp khi giáo viên bấm; số liệu trên ảnh là phiên fixture với tên học sinh kiểm thử.

### Purpose Gate

- R-01 PASS: không thêm gradient hoặc glow trang trí.
- R-04 PASS: không thêm bộ icon mặc định hay emoji trang trí; ký tự A/B/C/D nhận diện lựa chọn đáp án.
- R-06 PASS: Segoe UI theo nhận diện sẵn có, hỗ trợ tiếng Việt; mã phòng dùng số thẳng cột để đọc/nhập chính xác.
- R-07 PASS: không thêm nền lưới/hoa văn chấm.
- R-08 PASS: không thêm mũi tên trang trí.
- R-09 PASS: không có capsule badge hoặc nhãn lặp trên tiêu đề.
- R-10 PASS: không dùng kính mờ.
- R-12 PASS: không thêm bóng đổ cho các khối quiz.
- R-13 PASS: không có glow trang trí.
- R-14 PASS: đội dùng khối đồng nhất để dễ so sánh; câu hỏi, soạn câu và bảng điểm có cấu trúc theo nhiệm vụ.
- R-19 PASS: chuyển động ngắn chỉ khi kỹ năng trúng, không animation lặp; có reduced-motion.
- R-22 PASS: không thêm minh họa chung chung.

### Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 2, phản hồi kỹ năng theo thao tác.
- Focal point PASS: màn hình chơi tập trung câu hỏi và bốn đáp án; phòng chờ tập trung danh sách đội.
- Whitespace PASS: tách rõ mã phòng, điều khiển và nội dung; bỏ cột trống trong phòng chờ khi kiểm tra ảnh.
- Accent PASS: xanh ngọc cho thao tác/kết quả chính; băng/lửa chỉ hiện theo trạng thái kỹ năng.
- Identity PASS: nền giấy và chữ KidIT hiện có, khối đáp án với ký tự lựa chọn và bảng đội theo lớp.
- Design Read PASS: nhận diện, bố cục, dials và lý do hiệu ứng được ghi trong tài liệu hướng dẫn.

### Craftsmanship và Quality Locks

- C-1 PASS: quyết định màu/chữ/bố cục nối với nhận diện và nhiệm vụ giảng dạy.
- C-2 PASS: hành vi của các loại điều khiển đã được thử, không có placeholder chức năng.
- C-3 PASS: chỉ có soạn câu, phòng chờ, trận đấu, kỹ năng và kết quả; không có phần marketing lấp chỗ.
- C-4 PASS: các trạng thái tải/trống/lỗi, sáng/tối giáo viên, bàn phím và các độ rộng nêu trên đã kiểm tra.
- C-5 PASS: điểm và thành viên đều từ phiên hiện tại; không có chứng thực/số liệu kinh doanh giả.
- R-05 PASS: bố cục thay đổi theo soạn câu, chờ đội và chơi; không dùng template landing page.
- R-11 PASS: nút/ô nhập 6px, khối 12px, không bo viên thuốc mọi thành phần.
- R-15 PASS: CTA nêu thao tác: Tạo phòng đấu, Bắt đầu trận đấu, Đóng câu và công bố đáp án.
- R-16 PASS: không có thuật ngữ quảng cáo AI.
- R-20 PASS: chia đội, mã phòng, tỉ lệ đúng và kỹ năng nằm ngay trong trải nghiệm lớp học.
- R-21 PASS: giữ tùy chọn sáng/tối giáo viên hiện có; học sinh mặc định sáng.
- R-29 PASS: màu nền giấy, mực và xanh ngọc kế thừa; hai màu hiệu ứng có ý nghĩa trạng thái cụ thể.
- R-30 PASS: không sao chép giao diện Quizizz; chỉ dùng cơ chế trắc nghiệm theo đề bài.
- R-31 PASS: mỗi quyết định chính có lý do trong phần hướng giao diện của tài liệu sử dụng.

## Giới hạn xác minh

Chưa chạy migration hoặc đo tải trên MySQL/TiDB thật; chưa triển khai Vercel. Chưa kiểm tra trên điện thoại vật lý hoặc bàn phím ảo thực tế. Viewport và mô phỏng mất mạng đã được trả về mặc định sau kiểm tra. Các server fixture và Vite riêng của phiên QA được dừng sau khi hoàn tất. Ảnh xem thử ở `outputs/quiz-student-preview.png` là ảnh local của trận kiểm thử, không phải hosting đang hoạt động.
