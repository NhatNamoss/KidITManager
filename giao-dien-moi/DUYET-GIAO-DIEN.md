# Bản duyệt giao diện KidIT 01

Cập nhật theo phản hồi: bỏ tên chương trình tự đặt, chỉ dùng tên lớp trong hồ sơ; điểm danh/chấm công chọn buổi có sẵn theo lịch; thời khóa biểu giữ hệ thứ × suất và hai ảnh xuất của web cũ.

## Cách xem

Mở **http://127.0.0.1:5180**. Thanh trên cùng cho phép chọn vai trò Giáo viên / Admin và thử trạng thái tải, trống, lỗi. Nút mặt trăng/mặt trời chuyển sáng/tối. Mục Tài khoản xuất hiện khi chọn Admin.

Đây là bản mẫu tương tác độc lập. Tất cả dữ liệu đều minh họa; tải lại trang khôi phục dữ liệu mẫu. Mật khẩu không được lưu. Các thao tác không gọi API và không ghi database. Lần thiết kế này chỉ thêm tệp bên trong `giao-dien-moi/`, chưa tích hợp hoặc triển khai lên web hiện tại.

## Những thay đổi để duyệt

- **Tổng quan:** một mốc ngày rõ ràng, lịch dạy làm nội dung chính; mở lớp hoặc ghi công từ thao tác ngắn. Công cá nhân và nhắc kiểm tra nằm cạnh lịch trên màn hình rộng, chuyển xuống dưới trên điện thoại.
- **Lịch:** bảng thứ × suất cố định như web cũ, có vùng cuộn riêng trên màn hình hẹp và chế độ danh sách. Giữ năm suất chuẩn và hỗ trợ nhiều suất/giờ khác nhau theo từng ngày. Hai ảnh PNG dùng chính mẫu `ScheduleExportTemplate` và logo hiện tại; bản phụ huynh chỉ có tên lớp, bản giáo viên có GV/TG và tách lớp trùng ca. Bộ lọc người dạy chỉ ảnh hưởng màn hình, không làm mất lớp trong hai ảnh xuất toàn trung tâm.
- **Lớp:** tên như KID 1, KID 2, không có trường chương trình. Cùng một nơi cho thông tin, lịch mặc định, sĩ số, điểm danh và công giảng dạy. Bộ chọn Ngày có học/Tháng/Năm dùng cùng quy tắc lịch của web cũ, chỉ có các buổi đã lên lịch; thêm/bỏ suất làm danh sách buổi tự cập nhật. Không dùng ô datetime cho điểm danh/chấm công.
- **Chấm công:** Công của tôi và Tổng công là hai phần riêng; bộ lọc tháng/người/trạng thái đặt cạnh nội dung. Biểu mẫu cố định tên người chấm, chọn lớp, buổi có sẵn và suất trong ngày, nhập bài học; kiểm tra trùng giờ và ngày tương lai ở mức minh họa. Tên bài học là nội dung giáo viên ghi cho suất đó, không phải tên chương trình gắn vào lớp.
- **Danh sách:** tìm, lọc và chỉnh sửa tại chỗ. Bảng chuyển thành từng hồ sơ trên điện thoại, giữ đầy đủ nhãn thay vì bắt người dùng kéo ngang.
- **Học phí:** trạng thái đã thu/chờ thu/quá hạn là bộ lọc tương tác; chi tiết phiếu được mở tại chỗ. Chỉ có giao dịch minh họa.
- **Tài khoản:** admin tạo nhân sự kèm tên đăng nhập, mở biểu mẫu đổi tên/mật khẩu. Mọi mật khẩu trong giao diện này đều là mô phỏng, không có xác thực thật.
- **Công cụ:** đếm ngược, bốc thăm, chia nhóm và bảng điểm có thao tác thật với dữ liệu mẫu.
- **Đăng nhập:** bố cục riêng, có nhãn bản mẫu; giá trị bất kỳ chỉ dùng để vào chế độ xem giáo viên.

Hướng thị giác, lý do chọn màu/chữ/bố cục và giới hạn bản mẫu nằm trong [DESIGN.md](DESIGN.md).

## Ảnh xem nhanh

- [Tổng quan trên máy tính](screenshots/tong-quan-may-tinh.png)
- [Tổng quan trên điện thoại](screenshots/tong-quan-dien-thoai.png)
- [Lịch tuần](screenshots/lich-day-may-tinh.png)
- [Danh sách lớp](screenshots/lop-hoc-may-tinh.png)
- [Chi tiết lớp](screenshots/chi-tiet-lop-may-tinh.png)
- [Sổ công](screenshots/cham-cong-may-tinh.png)
- [Biểu mẫu chấm công](screenshots/bieu-mau-cham-cong-may-tinh.png)
- [Học sinh](screenshots/hoc-sinh-may-tinh.png)
- [Giáo viên](screenshots/giao-vien-may-tinh.png)
- [Học phí](screenshots/hoc-phi-may-tinh.png)
- [Tài khoản](screenshots/tai-khoan-may-tinh.png)
- [Công cụ](screenshots/cong-cu-may-tinh.png)
- [Đăng nhập](screenshots/dang-nhap-may-tinh.png)
- [Chế độ tối](screenshots/tong-quan-toi.png)
- [Ảnh lịch phụ huynh theo mẫu cũ](exports/lich-phu-huynh.png)
- [Ảnh TKB giáo viên theo mẫu cũ](exports/tkb-giao-vien.png)
- [Biểu mẫu lớp với danh sách suất](screenshots/bieu-mau-lop-hoc.png)

## Kiểm tra trước bàn giao

Build riêng và kiểm tra mã đều qua. Năm kiểm thử bổ sung về tên lớp, lịch khác giờ theo ngày, ngày có học, suất trùng và dữ liệu mẫu xuất đều qua. Đã dựng hai PNG thực tế và kiểm tra nội dung: phụ huynh 2400×1500, giáo viên 3200×2814, không trắng ảnh hay cắt mất tên GV/TG. Bằng chứng bản cập nhật và phép đo nằm trong [qa-results.json](qa-results.json); nhật ký thiết kế đầu tiên được giữ ở `qa-results-v1.json`.

Đã kiểm tra lại 11 màn hình tại 320, 390, 768, 1100 và 1440px: **55 lượt, trang không tràn ngang**. Riêng bảng lịch rộng có vùng cuộn nội bộ đúng chủ đích. Đo màu chữ và nền giao diện theo công thức WCAG trên nội dung DOM thực tế: **66 lượt rà trang/chế độ/độ rộng, không có cặp chữ không đạt ngưỡng tương ứng**. Chữ nhỏ dùng ngưỡng 4,5:1; chữ lớn dùng 3:1. Các điều khiển điện thoại được đặt vùng bấm tối thiểu 44px. Hai ảnh xuất giữ nguyên mẫu/nhận diện cũ theo yêu cầu, tách khỏi phạm vi đổi phong cách giao diện. Kiểm tra dùng trình duyệt mô phỏng kích thước, chưa thay thế thử trên điện thoại vật lý.

### Anti Slop: Hard Gate

- R-02 PASS: không dùng dấu gạch dài trong nội dung giao diện do bản mẫu tạo.
- R-03 PASS: 55 lượt kiểm tra độ rộng không có cuộn ngang; bảng chuyển thành hồ sơ ở màn hình hẹp.
- R-17 PASS: số lượng và số tiền đều từ dữ liệu minh họa được gắn nhãn; không có số liệu quảng bá.
- R-18 PASS: không có lời chứng thực hoặc ảnh người giả.
- R-23 PASS: hướng thiết kế theo toàn quyền được giao; dùng tên KidIT, khối KI hiện có và avatar chữ cái đầu; ghi rõ dữ liệu mẫu.
- R-24 PASS: các mục điều hướng mở đủ 11 màn hình; liên kết lớp mở đúng chi tiết; skip link đưa focus vào nội dung chính.
- R-25 PASS: kết quả đo tương phản 66 lượt được lưu, không còn lỗi sau hiệu chỉnh chữ phụ.
- R-26 PASS: các nhóm điều khiển đã được bấm thử và ghi trong `clickThrough`; biểu mẫu lưu và trả thông báo trong phiên mẫu.
- R-27 PASS: có mô phỏng tải/trống/lỗi; tìm kiếm không khớp, lớp đầy, tháng không có buổi và công trùng đều có thông báo riêng; xuất ảnh có trạng thái chờ/lỗi và ảnh kết quả.
- R-28 PASS: không thêm phần hỏi đáp mẫu.
- R-32 PASS: điều khiển HTML có nhãn; đã thử Tab và Escape; dialog bản địa giữ focus và đóng bằng Escape; có focus indicator ở cả hai chế độ.
- R-33 PASS: tính năng và CSS được viết trực tiếp trong mã nguồn, không dùng chương trình ngoài thay chuỗi để vá giao diện.
- R-34 PASS: cả sáng và tối đã mở đủ 11 màn hình, đo tương phản và lưu ảnh.
- R-35 PASS: build và kiểm tra mã qua; nhật ký bấm thử và log trình duyệt được kiểm tra.
- R-36 PASS: không thêm tuyên bố bảo mật, hiệu suất hoặc thành tích không có nguồn.
- R-37 PASS: hướng đề xuất được ghi trước khi dựng trong `DESIGN.md`, theo phạm vi thiết kế chủ sản phẩm giao.
- R-38 PASS: tên, chương trình, phiếu và số công được đánh dấu minh họa; trang đăng nhập nêu rõ không xác thực thật.

### Anti Slop: Purpose Gate

- R-01 PASS: giao diện mới dùng nền giấy và mực xanh đậm để đọc lịch, xanh ngọc cho thao tác chính; hai ảnh xuất giữ màu và hiệu ứng từ mẫu cũ theo yêu cầu chủ sản phẩm.
- R-04 PASS: biểu tượng lịch/lớp/người/công/học phí có nghĩa cụ thể, tái dùng bộ biểu tượng sẵn có theo lý do trong `DESIGN.md`.
- R-06 PASS: phông hệ thống hỗ trợ tiếng Việt, tiêu đề phân cấp bằng cỡ và trọng lượng; số giờ/công thẳng hàng.
- R-07 PASS: không dùng nền lưới hoặc họa tiết trang trí không mang thông tin.
- R-08 PASS: mũi tên chỉ cho mở lớp và chuyển trang; thao tác lưu không dùng mũi tên trang trí.
- R-09 PASS: nhãn trạng thái dùng để phân biệt công/phiếu đã xác nhận, đang chờ, hủy hoặc quá hạn; luôn có chữ.
- R-10 PASS: không dùng kính mờ.
- R-12 PASS: bóng đổ chỉ cho dialog/thông báo nổi, thể hiện lớp nằm trên nội dung.
- R-13 PASS: không dùng ánh sáng trang trí.
- R-14 PASS: lớp học cùng cấu trúc để so sánh sĩ số/lịch; nhân sự dùng danh sách, công dùng mốc ngày và học phí dùng bảng.
- R-19 PASS: chuyển động ngắn phản hồi thao tác, trạng thái tải có nhãn; có `prefers-reduced-motion`.
- R-22 PASS: không thêm minh họa hoặc ảnh không phục vụ việc quản lý.

### Anti Slop: Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 1 ghi trong hướng thiết kế.
- Nhất quán PASS: mốc ngày làm điểm nhấn, các trang có bố cục theo nội dung, chuyển động nhẹ.
- Trọng tâm PASS: lịch ngày ở tổng quan; suất/bài học ở chấm công; hồ sơ ở danh sách.
- Khoảng trống PASS: đường kẻ và nhịp cách phân chia lịch, nhóm thao tác và phần đối chiếu; điện thoại dùng khoảng cách nhỏ hơn.
- Màu nhấn PASS: xanh ngọc cho thao tác chính, màu hổ phách cho việc chưa hoàn tất.
- Nhận diện PASS: khối KI, màu mực, mốc ngày và cấu trúc sổ điều phối lặp lại có mục đích.
- Design Read PASS: hướng sổ điều phối cho giáo viên/người quản lý được công bố trước khi dựng.

### Anti Slop: Craftsmanship và Quality Locks

- C-1 PASS: màu, chữ, khoảng cách, biểu tượng và phân bố nội dung có lý do ghi lại.
- C-2 PASS: điều hướng, biểu mẫu, bộ lọc, xuất file, đổi chế độ và công cụ đều có hành vi trong bản mẫu.
- C-3 PASS: chỉ có màn hình phục vụ các chức năng KidIT hiện có và bước duyệt giao diện.
- C-4 PASS: bố cục kiểm tra ở năm độ rộng, có trạng thái tải/trống/lỗi, thao tác bàn phím và hai chế độ.
- C-5 PASS: dữ liệu minh họa được ghi rõ; không có lời chứng thực hoặc tuyên bố giả.
- R-05 PASS: tổng quan theo lịch, lịch theo tuần, lớp theo hồ sơ, công theo ngày, học phí theo bảng; không ghép trang quảng bá mẫu.
- R-11 PASS: nút/ô nhập bo 6px, khối 12px, nhãn trạng thái 4px; không dùng hình viên thuốc cho mọi thành phần.
- R-15 PASS: nút ghi việc cụ thể như Tạo lớp học, Chấm công của tôi, Cả lớp có mặt, Xuất bảng công.
- R-16 PASS: không dùng câu quảng bá công nghệ hoặc từ ngữ cường điệu.
- R-20 PASS: cấu trúc dựa trên lịch, suất, công cá nhân và sổ lớp KidIT.
- R-21 PASS: mặc định sáng để đọc danh sách; có lựa chọn tối hoạt động đầy đủ.
- R-29 PASS: màu mực xanh, xanh ngọc, hổ phách theo chức năng; màu đỏ chỉ thông báo lỗi/quá hạn, nền và chữ là trung tính.
- R-30 PASS: không mô phỏng một sản phẩm thương mại cụ thể.
- R-31 PASS: các quyết định chính được giải thích trong `DESIGN.md` và đối chiếu ở báo cáo này.

## Điểm cần chủ sản phẩm duyệt

Hướng màu và chữ; cách nhóm menu; thứ tự thông tin trên tổng quan; hai phần công cá nhân/tổng công; bố cục điện thoại. Sau khi được duyệt mới tích hợp vào ứng dụng và kiểm tra lại cùng API, quyền truy cập và dữ liệu thực tế.
