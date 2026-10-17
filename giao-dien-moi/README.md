# KidIT: bản duyệt giao diện 01

Thư mục độc lập để duyệt thiết kế. Không sửa giao diện trong `src/`, không gọi API và không ghi dữ liệu thật. Toàn bộ dữ liệu là minh họa, thay đổi chỉ giữ trong phiên xem. Tải lại trang để khôi phục.

Từ thư mục dự án:

```powershell
npx vite --config giao-dien-moi/vite.config.js
```

Mở http://127.0.0.1:5180. Chọn vai trò Giáo viên hoặc Admin trên thanh bản duyệt. Có thể chuyển sáng/tối và xem trạng thái tải, trống, lỗi bằng bộ chọn trên cùng.

Build riêng:

```powershell
npx vite build --config giao-dien-moi/vite.config.js
```

Kết quả nằm trong `giao-dien-moi/build/`, không thay đổi `dist/` của web hiện tại.

## Màn hình

- Tổng quan: lịch trong ngày, công cá nhân, nhắc kiểm tra và lối vào công cụ.
- Lịch dạy: bảng thứ × suất cố định như web cũ, chế độ danh sách, lọc nhân sự. Xuất PNG cho phụ huynh và TKB có GV/TG bằng chính `ScheduleExportTemplate` hiện có; không đổi lịch sang CSV.
- Lớp học: tìm/lọc, tạo/sửa lớp, sĩ số và lịch mặc định.
- Chi tiết lớp: chọn ngày có học/tháng/năm từ các buổi theo lịch như web cũ, có mặt/vắng, đánh dấu cả lớp, xem công theo lớp. Không dùng ô lịch datetime.
- Học sinh: tìm, lọc lớp, thêm/sửa hồ sơ.
- Giáo viên: hồ sơ, vai trò, lớp phụ trách, tài khoản.
- Chấm công: công của tôi/tổng công, lọc tháng/người/trạng thái; chọn buổi có sẵn rồi chọn suất theo ngày, nhập tên bài đã dạy; xuất CSV bảng công.
- Học phí: theo dõi trạng thái, tạo phiếu minh họa, xem chi tiết.
- Tài khoản: màn hình admin, tạo giáo viên kèm tên đăng nhập, biểu mẫu đổi tên/mật khẩu. Không lưu mật khẩu trong bản mẫu.
- Công cụ: đếm ngược, bốc thăm, chia nhóm, bảng điểm tương tác.
- Đăng nhập: chỉ thử bố cục, không xác thực tài khoản thật.

## Trước khi áp dụng

Lớp chỉ có tên hồ sơ KID, không có trường tên chương trình. Lịch lưu dạng chuỗi như web hiện tại; mỗi ngày có thể có nhiều suất và giờ khác nhau. Bộ chọn buổi dùng chung các hàm lịch hiện có trong `shared/class-schedule.js`. Hai ảnh xuất mẫu để đối chiếu nằm trong `exports/`.

Chờ chủ sản phẩm duyệt hướng màu, bố cục, điều hướng và các luồng. Sau khi được duyệt mới chuyển các thành phần phù hợp sang ứng dụng đang dùng và nối API hiện có; giữ đầy đủ kiểm tra quyền ở máy chủ.
