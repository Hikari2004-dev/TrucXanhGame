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
- `san-khau.html`, `js/stage.js` – **chế độ sân khấu** (hoạt động mở đầu 5 phút): chơi theo đội trên màn hình chiếu, không cần điện thoại
- `mc.html`, `js/mc.js` – trang của MC: tạo phòng có mã, xem trực tiếp ai giải nhanh nhất
- `apps-script/` – mã máy chủ (Google Apps Script) và hướng dẫn cài

## Bảng xếp hạng và phòng chơi
Mặc định lưu trên trình duyệt của từng máy (localStorage). Muốn dùng chung cho cả lớp và dùng được mã phòng, cài máy chủ theo `apps-script/HUONG-DAN.md` rồi điền URL vào `LEADERBOARD_URL` trong `js/config.js`.

Chơi theo phòng: MC mở `mc.html` → **Tạo phòng** → đọc mã 5 chữ cái cho mọi người. Người chơi nhập mã vào ô **Mã phòng** ở màn hình bắt đầu (hoặc mở `index.html?phong=MAPHONG`). Bảng của MC tự cập nhật, xếp ai ghép đủ 8 cặp nhanh nhất lên đầu.

## Chế độ sân khấu (hoạt động mở đầu 5 phút)
Mở `san-khau.html` trên máy chiếu. Gợi ý chia giờ: **1 phút** chia đội và đọc luật (màn hình đầu), **3 phút** chơi, **1 phút** công bố đội thắng và đọc phần "Ý chính".

1. Bấm **Câu hỏi**. Đội giơ tay trước: bấm tên đội ở bảng điểm, rồi bấm đáp án đội đọc. Sai thì đội khác giành quyền.
2. Đúng thì đội gọi 2 số, MC bấm 2 thẻ đó. Trùng dân tộc: +10 điểm, 2 thẻ biến mất, lộ ra một phần ô chữ.
3. Có đội muốn đoán ô chữ: bấm **Đoán ô chữ**, chọn đội, bấm Đúng (+30, kết thúc) hoặc Sai (đội mất quyền đoán).
4. Hết 3 phút hoặc mở hết thẻ thì tự sang màn hình công bố.

Đổi ô chữ bí mật ở màn hình đầu (mặc định: ĐOÀN KẾT ĐẠI ĐOÀN KẾT). Thời gian, số cặp, điểm nằm ở dòng đầu `js/stage.js`.
