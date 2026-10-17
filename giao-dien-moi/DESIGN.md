# Hướng thiết kế đề xuất: Sổ điều phối KidIT

Bản đề xuất do trợ lý xây dựng theo quyền thiết kế được chủ sản phẩm giao. Chỉ áp dụng trong thư mục này, chờ chủ sản phẩm duyệt trước khi tích hợp.

## Người sử dụng và việc cần làm

Giáo viên và người quản lý trung tâm cần biết hôm nay dạy gì, mở đúng lớp, điểm danh và tự ghi công; đồng thời quản lý danh sách và đối chiếu học phí. Thông tin giờ dạy, lớp và người dạy quan trọng hơn các biểu đồ trang trí.

## Ngôn ngữ thị giác

- Nền giấy ấm, mặt phẳng trắng, mực xanh đậm: gợi sổ lớp học, giảm cảm giác bảng điều khiển công nghệ xa lạ.
- Xanh ngọc làm màu thao tác chính và trạng thái đã hoàn thành; màu hổ phách chỉ dùng cho nhắc việc chưa hoàn tất. Trạng thái luôn có chữ.
- Chữ Segoe UI và hệ chữ hệ thống: hỗ trợ dấu tiếng Việt, đọc rõ ở cỡ nhỏ, không tải phông ngoài.
- Tiêu đề có độ tương phản về cỡ và trọng lượng; bảng dùng số thẳng cột. Nhãn không viết hoa giãn chữ.
- Nhận diện dùng chữ KidIT và khối KI đã có của dự án, không tạo logo hay hình người mới. Avatar là chữ cái đầu.
- Biểu tượng tái dùng bộ Lucide hiện có cho ý nghĩa cụ thể: lịch, lớp, người, công, học phí và công cụ; nét 1,8px cân bằng với chữ giao diện, không dùng biểu tượng để lấp chỗ trống.
- Điều hướng giữ đủ chức năng hiện có, nhóm theo việc giảng dạy và quản lý trung tâm. Điện thoại có lối vào trực tiếp cho tổng quan, lịch và chấm công.
- Các đường kẻ bảng và mốc ngày tạo nhịp sổ điều phối; không dùng nền lưới, kính mờ, ánh sáng trang trí hoặc biểu đồ không phục vụ quyết định.
- Bo góc 6px cho nút/ô nhập, 12px cho khối nội dung. Bóng đổ chỉ dành cho lớp nổi và hộp thoại, để thể hiện độ cao.

ENERGY 2 / RHYTHM 2 / MOTION 1. Điểm nhấn là mốc ngày và việc sắp tới; cấu trúc thay đổi theo nội dung: lịch tuần, sổ công, danh sách nhân sự và biểu mẫu. Chuyển động ngắn chỉ phản hồi thao tác; tôn trọng reduced-motion.

## Tiện lợi

- Tổng quan tập trung lịch ngày và việc cần làm, có nút mở lớp và chấm công trực tiếp theo ca.
- Theo phản hồi chủ sản phẩm: lịch giữ bảng thứ × suất cố định như web cũ. Trên điện thoại bảng có vùng cuộn riêng và lựa chọn danh sách. Hai mẫu ảnh xuất cho phụ huynh và giáo viên giữ nguyên từ ứng dụng hiện tại theo yêu cầu, gồm cả nhận diện/màu sắc của mẫu cũ.
- Chấm công chia rõ Công của tôi / Tổng công; chọn lớp, ngày có học/tháng/năm từ lịch có sẵn, suất và bài học; tên người chấm cố định theo vai trò đang xem. Không dùng ô datetime cho điểm danh/chấm công.
- Tên lớp chỉ là tên hồ sơ như KID 1, KID 2; không gắn chương trình hoặc tên môn tự đặt. Biểu mẫu lớp không có trường chương trình; ngày và giờ từng suất dùng danh sách cố định như cũ.
- Dữ liệu dạng danh sách có tìm kiếm, bộ lọc, trạng thái trống và mở chi tiết/sửa tại chỗ.
- Hộp thoại có nhãn, báo lỗi bằng chữ, giữ focus, đóng bằng Escape và trở lại nút mở.
- Chế độ sáng/tối dùng đầy đủ biến màu. Vùng bấm tối thiểu 44px; bố cục có các mức điện thoại, máy tính bảng và màn hình rộng.

## Phạm vi bản duyệt

Mọi số liệu, tên, giao dịch và nội dung lớp trong bản duyệt là dữ liệu minh họa. Không gọi API, không đọc/ghi database thật. Các thao tác chỉ thay đổi dữ liệu trong phiên xem; tải lại khôi phục mẫu. Vai trò admin/giáo viên chỉ mô phỏng cách hiển thị, không phải xác thực thật. Trang đăng nhập có ghi rõ cơ chế này.
