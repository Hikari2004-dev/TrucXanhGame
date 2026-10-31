# Trúc Xanh – Đại đoàn kết dân tộc

Mở `index.html` bằng trình duyệt (Chrome/Edge) để chơi. Không cần cài đặt gì.

## Cấu trúc
- `index.html` – khung giao diện (các màn hình bắt đầu, chơi, kết thúc)
- `css/style.css` – màu sắc, bố cục (biến màu ở đầu file, mục `:root`)
- `js/questions.js` – **bộ câu hỏi**. Đáp án đúng luôn để ở vị trí đầu tiên trong `opts`.
- `js/data.js` – tên dân tộc (`NAMES`), thẻ kiến thức (`FACTS`), đường dẫn ảnh (`IMG`)
- `js/game.js` – logic trò chơi. Dòng đầu có các thông số: `TOTAL` (thời gian ván, giây), `QTIME` (giây/câu), `PAIRS` (số cặp), `REWARD` (sao mỗi câu đúng), `STREAK_N`/`BONUS` (thưởng chuỗi)
- `images/` – ảnh nền, ảnh bìa và ảnh 54 dân tộc (`images/dantoc/`)

- `js/config.js` – địa chỉ máy chủ bảng xếp hạng (`LEADERBOARD_URL`)
- `mc.html`, `js/mc.js` – trang của MC: tạo phòng có mã, xem trực tiếp ai giải nhanh nhất
- `apps-script/` – mã máy chủ (Google Apps Script) và hướng dẫn cài

## Bảng xếp hạng và phòng chơi
Mặc định lưu trên trình duyệt của từng máy (localStorage). Muốn dùng chung cho cả lớp và dùng được mã phòng, cài máy chủ theo `apps-script/HUONG-DAN.md` rồi điền URL vào `LEADERBOARD_URL` trong `js/config.js`.

Chơi theo phòng: MC mở `mc.html` → **Tạo phòng** → đọc mã 5 chữ cái cho mọi người. Người chơi nhập mã vào ô **Mã phòng** ở màn hình bắt đầu (hoặc mở `index.html?phong=MAPHONG`). Bảng của MC tự cập nhật, xếp ai ghép đủ 15 cặp nhanh nhất lên đầu.
