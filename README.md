# Dưới tán hoa anh đào

Món quà là một cảnh Three.js tạo hoàn toàn bằng hình học trong JavaScript: cây anh đào cổ thụ có cành thuôn nhỏ dần, chú thỏ nhỏ chạy vòng quanh gốc, sáu hộp quà lơ lửng và xoay chậm quanh cây, hiệu ứng cánh hoa rơi. Sau khoảng bảy giây không tương tác, thỏ nhảy lên chộp một cánh hoa; hành động này tạm dừng khi khung quà đang mở.

## Chạy trên máy tính

Three.js được nạp theo dạng ES module từ CDN, vì vậy hãy mở dự án bằng máy chủ tĩnh cục bộ thay vì nhấn đúp `index.html`:

1. Mở thư mục `sakura-gift` trong VS Code.
2. Cài tiện ích **Live Server** nếu máy chưa có.
3. Nhấn chuột phải vào `index.html`, chọn **Open with Live Server**.

Có thể dùng bất kỳ máy chủ tĩnh nào. Mạng cần truy cập CDN Three.js khi tải trang lần đầu. Ảnh kỷ niệm vẫn nằm cục bộ trong thư mục dự án và không được tải lên dịch vụ ngoài.

## Thêm 6 ảnh kỷ niệm bằng link

Mở `js/config.js` và dán link ảnh vào sáu dòng `imageUrl: ''` (mỗi hộp quà có một ô ảnh). Ví dụ: `imageUrl: 'https://example.com/ky-niem-1.jpg'`. Dùng link ảnh trực tiếp, thường kết thúc bằng `.jpg`, `.png` hoặc `.webp`. Khi chưa có link, hộp quà vẫn mở và hiện sẵn ô ảnh trống.

Bạn cũng có thể chép ảnh vào `assets/photos/` rồi điền tên file, ví dụ `imageUrl: 'ky-niem-1.jpg'`. Ảnh đang có trong thư mục `photos/` cũng dùng được bằng đường dẫn tương đối như `imageUrl: 'photos/a.jpg'`.

## Cá nhân hóa

Chỉnh nội dung ở đầu `js/config.js`: tiêu đề, phụ đề, tên hộp quà, lời nhắn, chú thích và danh sách ảnh.

## Điều khiển

- Kéo chuột hoặc vuốt để xoay camera quanh cây.
- Cuộn hoặc chụm hai ngón để phóng to/thu nhỏ.
- Nhấn nút ↻ để đưa camera về góc nhìn ban đầu.
- Nhấn trực tiếp hộp quà trong cảnh hoặc một nút quà nhỏ ở cạnh dưới để mở kỷ niệm.
- Đóng khung ảnh bằng nút ×, nhấn Escape hoặc chạm vùng tối bên ngoài.

## Đưa lên GitHub Pages

Đưa toàn bộ nội dung thư mục `sakura-gift` lên repository GitHub, vào **Settings → Pages**, chọn nhánh `main` và thư mục gốc `/(root)`, rồi nhấn **Save**. Sau khi GitHub Pages xuất bản, gửi đường dẫn của trang cho người ấy.
