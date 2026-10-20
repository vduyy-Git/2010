# Prompt thiết kế dự án “Gốc anh đào và những món quà”

Hãy đóng vai một **Senior Frontend Engineer, Creative Developer và chuyên gia thiết kế trải nghiệm tương tác 3D**. Hãy xây dựng một món quà kỹ thuật số lãng mạn, tinh tế và chạy được thực tế, với chủ đề:

> Một chú thỏ nhỏ đứng dưới gốc cây hoa anh đào cổ thụ. Xung quanh gốc cây là những túi quà. Người xem có thể xoay quanh khung cảnh, ngắm hoa anh đào rơi, và nhấn vào từng túi quà để khám phá những bức ảnh kỷ niệm của hai người.

## Mục tiêu cảm xúc và thẩm mỹ

Tạo cảm giác như một khu vườn bí mật trong truyện cổ tích: ấm áp, bình yên, lãng mạn và có chiều sâu. Cây anh đào phải là tâm điểm với thân cây già lớn, cành vươn rộng, nhiều cụm hoa hồng phấn. Chú thỏ đáng yêu nhưng có dáng tự nhiên, đứng gần gốc cây. Những túi quà có hình dáng, màu sắc và nơ riêng, đặt quanh cây để người xem muốn khám phá.

Ưu tiên ánh sáng chiều dịu hoặc ánh trăng hồng tím, nền có chiều sâu, cánh hoa rơi chậm ở nhiều khoảng cách. Dùng bảng màu hồng đào, kem, xanh lá trầm, tím hoàng hôn và vàng ấm. Tránh giao diện giống cửa hàng; các nút và chỉ dẫn cần nhỏ nhẹ, hòa vào khung cảnh.

## Công nghệ và cấu trúc

- Dựng cảnh 3D tương tác bằng **Three.js**; dùng JavaScript module và HTML/CSS cho giao diện.
- Tổ chức mã dễ đọc, chia phần quản lý cảnh, cây, thỏ, quà, ảnh và hiệu ứng cánh hoa.
- Không cần backend, tài khoản, API key hoặc tải ảnh của người dùng lên mạng.
- Đặt ảnh riêng tư trong `assets/photos/`; đọc ảnh trực tiếp từ các file trong dự án.
- Dùng placeholder hình ảnh có sẵn trong giao diện nếu ảnh cá nhân chưa được thêm, tránh lỗi tải ảnh hoặc khung trống.
- Cung cấp hướng dẫn chạy dự án và cách thay ảnh. Nếu trình duyệt không cho mở module bằng cách nhấn đúp `index.html`, giải thích ngắn cách chạy bằng Live Server hoặc một máy chủ tĩnh cục bộ.

## Cảnh 3D và điều khiển

- Mở trang là thấy ngay khung cảnh hoàn chỉnh; không yêu cầu bấm nút mở thiệp trước.
- Cho phép kéo chuột hoặc vuốt để xoay camera quanh cây, có giới hạn góc nhìn để không lộn ngược hoặc xuyên qua địa hình.
- Cho phép phóng to/thu nhỏ vừa phải, có giới hạn khoảng cách và nút đưa camera về góc nhìn ban đầu.
- Trên điện thoại, hỗ trợ cảm ứng mượt, không làm trang cuộn ngang và không chiếm thao tác cuộn ngoài khu vực cảnh nếu không cần thiết.
- Bố trí chú thỏ ở gần thân cây và các túi quà quanh gốc sao cho vẫn nhìn thấy rõ từ nhiều góc xoay.
- Dùng ánh sáng, bóng, lớp nền và các cụm cây/hoa ở hậu cảnh để tạo cảm giác cảnh rộng. Giữ tốc độ khung hình ổn định trên laptop và điện thoại phổ thông.

## Cây anh đào, thỏ và hiệu ứng hoa rơi

- Tạo cây anh đào cổ thụ có thân uốn lượn, rễ nổi nhẹ, nhiều nhánh lớn nhỏ và tán hoa dày, có hình dáng hoa anh đào nhận diện được.
- Tạo chú thỏ đứng dưới tán cây, có tai, mặt, thân và chân dễ nhận ra; thêm chuyển động thở hoặc cử động tai rất nhẹ để cảnh không tĩnh.
- Cánh hoa rơi liên tục nhưng thưa và tự nhiên: khác nhau về kích thước, độ xoay, tốc độ, độ sâu và đường bay; có thể lượn nhẹ theo gió.
- Không tạo quá nhiều particle. Tái sử dụng đối tượng hoặc dùng shader/instancing khi phù hợp; tạm giảm hiệu ứng khi tab bị ẩn.
- Hỗ trợ `prefers-reduced-motion`: giảm số cánh hoa và chuyển động camera, nhưng vẫn giữ nội dung đầy đủ.

## Túi quà và ảnh kỷ niệm

- Mỗi túi quà là một đối tượng có vùng nhấn dễ thao tác. Khi rê chuột, túi quà sáng nhẹ hoặc có nhãn nhỏ; khi nhấn, mở một khung ảnh thanh lịch nằm trên cảnh.
- Khung quà có thể hiện một hoặc vài ảnh của hai người, kèm chú thích ngắn. Có nút đóng rõ ràng; nhấn Escape hoặc chạm ra ngoài cũng đóng được.
- Tạo nhiều túi quà mẫu có nội dung và ảnh khác nhau để người làm có thể thêm/bớt bằng một cấu hình duy nhất trong JavaScript.
- Đọc ảnh từ `assets/photos/` với tên file dễ hiểu, ví dụ `ky-niem-01.jpg`, `ky-niem-02.jpg`. Nếu file chưa tồn tại, hiển thị một hình minh họa/placeholder đẹp và hướng dẫn tên ảnh cần thêm; tuyệt đối không để biểu tượng ảnh hỏng.
- Dùng `object-fit: contain` hoặc cách trình bày phù hợp để không cắt mất khuôn mặt. Khung ảnh phải đọc tốt trên màn hình nhỏ.
- Ảnh chỉ được đọc cục bộ trong website; không gửi ảnh tới dịch vụ ngoài.

## Giao diện và khả năng tiếp cận

- Có một lời dẫn ngắn, dịu dàng và tùy chọn chỉnh trong cấu hình; không che cây hoặc các túi quà.
- Các nút có nhãn dễ hiểu, vùng chạm đủ lớn, trạng thái focus rõ, màu chữ đủ tương phản.
- Cảnh 3D co giãn đúng trên điện thoại, máy tính bảng và desktop; không tràn ngang.
- Khi WebGL không khả dụng, hiện thông báo thân thiện và một nền thay thế có thể xem được.
- Không tự phát nhạc. Nếu thêm âm thanh, mặc định tắt và chỉ phát sau khi người dùng chủ động bật.

## Cách triển khai và bàn giao

1. Kiểm tra cấu trúc thư mục hiện có và giữ ảnh người dùng đã đặt trong `assets/photos/`.
2. Tạo đầy đủ source code, không để pseudocode, hàm bỏ trống hoặc dấu `...` thay cho phần triển khai.
3. Tạo cảnh cây anh đào, chú thỏ, các túi quà có thể nhấn, khung xem ảnh, điều khiển xoay và hiệu ứng cánh hoa rơi.
4. Tạo một file cấu hình tập trung để chỉnh lời nhắn, danh sách túi quà, tên ảnh và chú thích ảnh.
5. Kiểm tra tương tác cơ bản: xoay cảnh bằng chuột/cảm ứng, camera reset, mở/đóng từng quà, xử lý thiếu ảnh, responsive và giảm chuyển động. Chỉ báo đã kiểm tra những gì thực sự chạy thử.
6. Bàn giao cấu trúc thư mục, hướng dẫn thay ảnh trong `assets/photos/`, hướng dẫn chạy trên máy tính và cách xuất bản website tĩnh.

Hãy bắt đầu bằng việc dựng khung cảnh tương tác hoàn chỉnh. Ưu tiên cảm giác ấm áp, cây anh đào già có dáng đẹp, chú thỏ dễ thương và khoảnh khắc khám phá ảnh khi mở quà.
