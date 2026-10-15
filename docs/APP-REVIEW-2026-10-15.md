# Rà soát KidIT Manager, 15/10/2026

## Kết luận

Bản ban đầu đáp ứng quản lý danh sách và lịch cơ bản, nhưng chưa phù hợp để dùng như sổ công chính thức: API thiếu đăng nhập, thông tin kết nối database nằm trong source, công chỉ định danh theo lớp/ngày/vai trò và dashboard có nội dung mẫu. Các lỗi ưu tiên và chức năng công mới đã được sửa trong source cục bộ. Bản Vercel chưa được cập nhật trong phiên này.

## Phạm vi thực hiện

- Đọc source frontend, API, cấu hình Vercel, schema SQL hiện có; chạy lint/build trước khi sửa.
- Mở bản thật tại https://kid-it-manager-8k8k.vercel.app, xem tổng quan và danh sách/chi tiết lớp. Chỉ đọc dữ liệu, không tạo công/hóa đơn/học sinh thử trên bản thật.
- Kiểm tra giao diện bản sửa với API fixture và SQLite trong bộ nhớ, tách khỏi database thật.
- Không truy cập tài khoản Vercel/TiDB, không thay mật khẩu, không chạy migration hoặc kiểm thử ghi trên database production.

## Phát hiện và thay đổi

| Mức | Vấn đề ban đầu | Xử lý trong source |
| --- | --- | --- |
| Nghiêm trọng | API danh sách và API sửa dữ liệu không yêu cầu đăng nhập | Thêm màn hình đăng nhập và middleware bảo vệ API; cookie HttpOnly, SameSite Strict, Secure ở production, thời hạn 8 giờ. Thiếu cấu hình thì từ chối truy cập. |
| Nghiêm trọng | Thông tin database ghi trực tiếp trong API | Chuyển sang biến môi trường; thêm `.env.example`. Mật khẩu cũ vẫn phải đổi, lịch sử Git vẫn phải xử lý riêng. |
| Cao | Bản dump và database được Git theo dõi | Bỏ theo dõi bảy file, giữ trên ổ đĩa; thêm chặn Git và gói triển khai Vercel. Các xóa trong Git index là có chủ đích. |
| Cao | Công giáo viên chỉ có ngày và một dòng mỗi vai trò, có thể ghi đè giữa các ca | Tạo `teaching_sessions` và `session_staff`, lưu ngày/giờ, ID nhân sự, tên tại thời điểm lưu, vai trò theo buổi và số phút. Không ép người dạy theo phân công lớp. |
| Cao | Chưa có bảng tổng hợp công đối chiếu lương | Thêm bảng công tháng, bộ lọc nhân sự, lượt/phút/giờ theo vai trò, chi tiết buổi, CSV. Chỉ tổng hợp trạng thái đã dạy. |
| Cao | Hai người sửa cùng buổi có thể ghi đè | Kiểm tra `version`, trả 409 khi dữ liệu đã đổi. Lưu giao dịch và snapshot lịch sử cùng với công. |
| Cao | Không kiểm tra đủ ngày, giờ, số phút, nhân sự trùng hoặc buổi trùng giờ | Validate trên API. Không xác nhận công tương lai hoặc buổi chưa kết thúc, không cộng công nháp/hủy, không cho một nhân sự xuất hiện hai lần trong buổi. |
| Vừa | Dữ liệu điểm danh cũ thiếu giờ ca | Giữ dữ liệu, hiển thị riêng để đối chiếu. API ghi công cũ trả 410 và hướng dẫn dùng buổi dạy; không tự chuyển sang công mới. |
| Vừa | Dashboard hiển thị % tăng trưởng, 96% chuyên cần và hoạt động giả | Bỏ nội dung mẫu; giữ số học sinh, số lớp, học phí đã thu từ API. Lịch hôm nay cập nhật theo phút, giờ Việt Nam. |
| Vừa | Search lớp/học sinh/hóa đơn và bộ lọc hóa đơn chưa hoạt động | Nối với dữ liệu thực; thêm xuất danh sách học sinh ra CSV. Bỏ bộ lọc không có trường dữ liệu tương ứng. |
| Vừa | Nút khóa học, cài đặt, phiếu chi và xóa học sinh chưa có nghiệp vụ | Bỏ khỏi luồng điều hướng hoặc bỏ điều khiển chưa hoạt động. Đường dẫn khóa học cũ có thông báo rõ. Đăng xuất đã có hành vi thật. |
| Vừa | Chi tiết hóa đơn không hoạt động, tổng tiền có thể nối chuỗi | Có hộp thoại chi tiết, chuẩn hóa tiền thành số trước khi cộng, chặn tiền âm/0 khi tạo. Mã hóa đơn dùng UUID. |
| Vừa | Xuất lịch chỉ lấy lớp đầu tiên ở ô trùng ca và bỏ giờ ngoài danh sách cố định | Xuất toàn bộ tên lớp cùng ô, thêm các khung giờ có trong dữ liệu. Các ô lịch có thể mở lớp tương ứng. |
| Vừa | Lỗi tải/lưu bị bỏ qua, dễ nhìn dữ liệu rỗng như dữ liệu thật | Thêm thông báo lỗi và tải lại cho các luồng đã sửa; API không trả chi tiết SQL/credential ra trình duyệt. |
| Vừa | Điểm danh học sinh có thể gửi ID ngoài danh sách lớp | API kiểm tra học sinh đã được ghi danh trước khi lưu. |
| Vừa | Hộp thoại khó dùng bằng bàn phím, menu ẩn vẫn nhận focus | Dùng native dialog qua portal để giữ focus và hỗ trợ Escape; menu ẩn trên điện thoại có `inert`; thêm nhãn menu và focus hiển thị. |
| Thấp | Tab trình duyệt tên `frontend`, ngôn ngữ HTML là tiếng Anh | Sửa tên thành KidIT Manager và `lang="vi"`. |
| Bảo trì | Dependency React Router bị npm audit cảnh báo | Cập nhật bản trong lockfile lên 7.18.4; npm audit sau sửa báo 0. Advisory liên quan unstable RSC, app này là SPA và không dùng chế độ đó; không kết luận app đã bị khai thác. |

Nguồn của cảnh báo dependency: [React Router security advisory](https://github.com/advisories/GHSA-qwww-vcr4-c8h2). Advisory nêu bản vá từ 7.18.2 và phạm vi ảnh hưởng là unstable RSC APIs.

## Quy tắc công đã áp dụng

- Lịch lớp chỉ là gợi ý. Người dạy/trợ giảng thực tế được chọn cho mỗi buổi, có thể khác chức danh hoặc người được phân công.
- Nhiều người cùng buổi được hỗ trợ; mỗi người có số phút thực tế. Số phút không vượt thời lượng buổi; không bắt tổng phút của cả nhóm bằng thời lượng vì có thể cùng dạy.
- Số lượt dạy không tự coi là một ca đủ công; khi chia ca cần dựa vào phút/giờ và quy tắc tính lương của trung tâm.
- Có thể có nhiều ca trong cùng ngày nhưng một lớp không được trùng giờ với chính nó nếu buổi chưa hủy.
- Hủy bằng trạng thái và giữ lịch sử, không xóa cứng buổi dạy. Không có chuyển tiền hoặc tự chi lương.
- Một lần lưu cập nhật buổi, các người dạy và lịch sử trong cùng giao dịch. Nếu một bước lỗi, toàn bộ thay đổi được hoàn tác.
- Công dùng ID nhân sự, không gộp theo chuỗi tên. Không xóa nhân sự đã được ghi công qua API hiện tại.

## Kiểm tra đã thực hiện

| Kiểm tra | Kết quả |
| --- | --- |
| `npm test` | PASS: 6 test với nhiều assert, gồm ngày sai, giờ sai, phút vượt ca, trùng người, dạy thay, chia ca, ca cùng ngày, chặn giờ trùng, hủy buổi, công nháp, dữ liệu cũ, xung đột version, rollback và validation trên API production trước khi truy cập database. |
| `npm run lint` | PASS, không cảnh báo. |
| `npm run build` | PASS, tạo bundle Vite. |
| `npm audit` | PASS, 0 vulnerabilities sau cập nhật dependency. |
| Đăng nhập giao diện | PASS với tài khoản fixture; không dùng mật khẩu production. |
| Chọn người dạy thay trên giao diện | PASS: C thay A, B trợ giảng; bảng công nhận C/B, không cộng cho A. |
| Bộ lọc nhân sự | PASS: chọn C chỉ hiển thị công của C. |
| Sửa / hủy buổi trên giao diện | PASS: đổi sang đã hủy thì bảng công rỗng; xác nhận lại buổi quá khứ thì công xuất hiện trở lại. |
| Xuất CSV | Đã bấm nút xuất; dữ liệu xuất theo bộ lọc. Chưa mở file bằng Microsoft Excel để kiểm tra hiển thị. |
| Mobile 390 × 844 | PASS ở màn bảng công: chiều rộng trang và scrollWidth cùng 390px, bảng cuộn trong khung, menu mở/điều hướng được. |
| Hộp thoại mở lớp | PASS mở trên điện thoại và Escape đóng; native dialog tách phần nền khỏi luồng focus. |
| MySQL/TiDB thật | CHƯA CHẠY migration hoặc thử khóa đồng thời; cần kiểm tra trên Preview/database thử nghiệm trước khi deploy production. |

Ảnh giao diện dùng dữ liệu kiểm thử: `screenshots/payroll-desktop.jpg`, `screenshots/payroll-mobile.jpg`.

## Các phần còn cần quyết định hoặc làm tiếp

1. **Triển khai:** cấu hình biến môi trường, đổi credential cũ và chạy migration. Chưa làm các bước này trên tài khoản thật.
2. **Phân quyền:** hiện dùng một mật khẩu quản lý chung. Chưa có tài khoản từng nhân sự hoặc phân quyền người ghi/người duyệt công. Lịch sử lưu nội dung thay đổi, chưa xác định danh tính cá nhân người sửa.
3. **Chốt lương:** chưa có đơn giá, quy tắc chia ca, làm tròn, chốt tháng/khóa sổ, duyệt hoặc đánh dấu đã trả lương. Bảng hiện tại là sổ công để đối chiếu, không phải bảng thanh toán hoàn chỉnh.
4. **Trùng người giữa các lớp:** đã chặn trùng buổi trong cùng lớp, chưa kiểm tra một người có công chồng giờ ở hai lớp khác nhau. Số phút chia ca chưa lưu thời điểm bắt đầu/kết thúc riêng của từng người.
5. **Điểm danh học sinh:** vẫn theo ngày, chưa theo từng ca. Lịch sử lớp theo buổi không snapshot toàn bộ danh sách học sinh.
6. **Ngày sinh:** dữ liệu cũ đang dùng cột `students.phone` để hiển thị ngày sinh. Giữ nguyên để tránh đổi nghĩa/xáo trộn dữ liệu; cần migration có đối chiếu nếu tách thành `birth_date` và số điện thoại thật.
7. **Sĩ số:** bản thật có lớp vượt sĩ số cấu hình. Chưa tự bỏ học sinh hoặc sửa sĩ số; cần trung tâm đối chiếu danh sách.
8. **Học phí:** chưa có nghiệp vụ sửa trạng thái hóa đơn, thanh toán từng phần, hạn nợ tự động, khóa học hoặc phiếu chi hoàn chỉnh. Đã bỏ tab phiếu chi gây hiểu nhầm, chưa xây thêm kế toán ngoài phạm vi công giảng dạy.
9. **Bảo mật vận hành:** giới hạn thử mật khẩu hiện ở bộ nhớ từng instance; Vercel nhiều instance cần rate limit tập trung hoặc tại tầng nền tảng. Backup tự động, giám sát lỗi và thu hồi từng phiên vẫn cần giải pháp vận hành.
10. **Kiểm thử:** chưa tuyên bố đã thử mọi nút CRUD trên database thật hoặc mọi kích thước màn hình; đã kiểm tra source các trang và tập trung kiểm thử tự động/UI vào phần mới và lỗi ưu tiên.

## Kiểm tra giao diện trong phạm vi thay đổi

Giữ cách trình bày quản trị sẵn có: tông tím để nhận diện thao tác chính, bảng để đối chiếu công, biểu mẫu để ghi người thực tế dạy; không thiết kế lại thương hiệu. ENERGY 1 / RHYTHM 1 / MOTION 1.

- PASS, tính trung thực: đã bỏ số tăng trưởng/hoạt động giả; tổng quan lấy số liệu từ API.
- PASS, mục đích: nút ghi buổi, sửa/hủy, lọc, tải lại và xuất dữ liệu có hành vi trong source; luồng dạy thay và lọc đã bấm kiểm tra.
- PASS, trạng thái: phần buổi dạy/bảng công có tải, rỗng, lỗi, lưu và xung đột.
- PASS, khả năng dùng: kiểm tra bảng công mobile 390px không tràn toàn trang; thêm focus và menu ẩn không nhận focus; hộp thoại hỗ trợ Escape.
- Giới hạn: chưa chứng nhận tương phản từng màu hoặc click-through toàn bộ ứng dụng. Không coi các kiểm tra cục bộ này là chứng nhận chất lượng cho toàn bộ production.
