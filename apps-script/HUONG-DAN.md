# Cài máy chủ bảng xếp hạng và phòng chơi

Máy chủ là một Google Apps Script gắn với Google Sheet. Miễn phí và chỉ cần làm một lần.

1. Tạo một Google Sheet mới (tên tuỳ ý, ví dụ "Trúc Xanh – Kết quả").
2. Trong Sheet: **Tiện ích mở rộng → Apps Script**.
3. Xoá hết nội dung trong `Code.gs`, dán toàn bộ nội dung file `apps-script/Code.gs` vào, bấm **Lưu**.
4. Bấm **Triển khai → Tùy chọn triển khai mới**:
   - Loại: **Ứng dụng web**
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
5. Bấm **Triển khai**, cấp quyền khi được hỏi, rồi sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
6. Dán URL đó vào `js/config.js`:
   ```js
   const LEADERBOARD_URL='https://script.google.com/macros/s/..../exec';
   ```

Sheet sẽ tự sinh 3 trang tính: `Rooms` (phòng), `Players` (người đã vào phòng), `Results` (kết quả).

**Khi sửa `Code.gs` sau này**: vào **Triển khai → Quản lý các lần triển khai → (biểu tượng bút) → Phiên bản: Phiên bản mới → Triển khai** để giữ nguyên URL.

## Cách MC tổ chức một phiên

1. Mở `mc.html`, nhập tên phiên (không bắt buộc), bấm **Tạo phòng**. Màn hình hiện mã phòng 5 chữ cái.
2. Chiếu màn hình này lên. Người chơi mở trò chơi, nhập tên và **mã phòng**, rồi bấm Bắt đầu.
   Nếu trò chơi được đưa lên web (GitHub Pages, Netlify…), trang MC hiện thêm mã QR và đường dẫn có sẵn mã phòng.
3. Bảng của MC tự cập nhật mỗi 4 giây:
   - **Hoàn thành nhanh nhất**: người ghép đủ 15 cặp, xếp theo thời gian (chính xác đến 0,1 giây).
   - **Chưa ghép đủ**: người hết giờ, xếp theo số cặp rồi số câu đúng.
   - **Đang chơi**: ai đã vào phòng mà chưa xong.
4. Hết phiên, bấm **Đóng phòng**: từ lúc đó không ai vào hoặc nộp thêm kết quả được. Bấm **Mở lại** nếu cần.

Mỗi phòng chỉ đóng/mở được từ máy đã tạo ra nó (máy giữ khoá của phòng). Trên máy khác, MC vẫn xem được bảng bằng cách mở `mc.html#MAPHONG`.
Nếu một người chơi nhiều lượt trong cùng phòng, bảng chỉ lấy lượt tốt nhất của người đó.
