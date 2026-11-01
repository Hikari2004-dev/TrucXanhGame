/*
 * CẤU HÌNH TRÒ CHƠI – sửa câu hỏi, đáp án, lời giải, thời gian, điểm tại đây.
 * Bản này nằm trong thư mục web để chạy được trên web tĩnh (GitHub Pages/Netlify),
 * nên ai mở mã nguồn trang cũng đọc được đáp án. Chỉ chiếu trên máy MC.
 */
(function (root) {
  const GAME_CONFIG = {
    title: 'ĐUỔI HÌNH BẮT CHỮ',
    subtitle: 'GIẢI MÃ 54 DÂN TỘC',

    // Kịch bản 5 phút: 30s giới thiệu + 5 × 42s + 30s TOP 3 + 30s thông điệp = 300s
    timeline: {
      introSec: 30,       // 0:00–0:30 giới thiệu & tham gia
      countdownSec: 3,    // đếm 3-2-1 trước câu 1 (nằm trong phần giới thiệu)
      answerSec: 35,      // thời gian trả lời mỗi câu
      revealSec: 7,       // hiển thị đáp án + chuyển câu  (35 + 7 = 42s/câu)
      autoAdvance: true,  // tự động sang câu tiếp sau revealSec
      top3Sec: 30,        // 4:00–4:30
      finaleSec: 30       // 4:30–5:00
    },

    scoring: {
      base: 1000,               // điểm cơ bản khi đúng
      maxBonus: 500,            // thưởng tốc độ tối đa
      wrongPenalty: 150,        // mỗi lần sai giảm thưởng tối đa
      maxAttempts: 3,           // số lần đoán mỗi câu
      minSubmitIntervalMs: 1500 // chống spam: khoảng cách tối thiểu giữa 2 lần gửi
    },

    limits: { maxPlayers: 200, maxNameLength: 20, maxAnswerLength: 60 },

    // image: đường dẫn trong thư mục public/. accept: các cách viết khác được chấp nhận.
    questions: [
      {
        answer: 'BẢN SẮC',
        accept: ['ban sac dan toc', 'ban sac van hoa'],
        image: 'img/q1.svg',
        alt: 'Dải màu rực rỡ uốn hình chữ S và một dấu vân tay nhiều màu',
        explanation: 'Mỗi dân tộc có ngôn ngữ, trang phục, phong tục riêng. Bản sắc văn hóa là nền tảng của sự thống nhất trong đa dạng.'
      },
      {
        answer: 'BÌNH ĐẲNG',
        accept: ['binh dang dan toc'],
        image: 'img/q2.svg',
        alt: 'Hai người đứng trên hai đĩa của một cán cân thăng bằng',
        explanation: 'Các dân tộc hoàn toàn bình đẳng về quyền và nghĩa vụ, không phân biệt lớn hay nhỏ, trình độ phát triển cao hay thấp.'
      },
      {
        answer: 'ĐỘC LẬP',
        accept: ['doc lap dan toc'],
        image: 'img/q3.svg',
        alt: 'Một người cầm cờ đứng vững trên bệ riêng, tách khỏi nhóm người phía sau',
        explanation: 'Độc lập dân tộc là quyền thiêng liêng, là tiền đề để mỗi dân tộc tự làm chủ vận mệnh của mình.'
      },
      {
        answer: 'TỰ QUYẾT',
        accept: ['quyen tu quyet', 'dan toc tu quyet'],
        image: 'img/q4.svg',
        alt: 'Một người đứng ở ngã ba, chỉ tay chọn một con đường',
        explanation: 'Quyền dân tộc tự quyết: quyền tự quyết định chế độ chính trị và con đường phát triển của dân tộc mình.'
      },
      {
        answer: 'ĐOÀN KẾT',
        accept: ['doan ket dan toc', 'dai doan ket'],
        image: 'img/q5.svg',
        alt: 'Nhiều người nắm tay nhau thành một vòng tròn quanh ngôi sao',
        explanation: 'Liên hiệp công nhân tất cả các dân tộc – ở Việt Nam là khối đại đoàn kết toàn dân tộc, nguồn sức mạnh của cách mạng.'
      }
    ],

    finale: {
      line1: '54 DÂN TỘC – 1 VIỆT NAM',
      line2: 'MỖI DÂN TỘC MỘT BẢN SẮC – CÙNG TẠO NÊN SỨC MẠNH VIỆT NAM',
      kicker: 'CHỦ NGHĨA XÃ HỘI KHOA HỌC',
      title: 'VẤN ĐỀ DÂN TỘC TRONG CHỦ NGHĨA MÁC – LÊNIN VÀ THỰC TIỄN VIỆT NAM',
      // Ảnh văn hóa (tùy chọn): đặt file vào public/img/culture/ rồi khai báo ở đây
      photos: ['img/culture/1.jpg', 'img/culture/2.jpg', 'img/culture/3.jpg', 'img/culture/4.jpg', 'img/culture/5.jpg', 'img/culture/6.jpg']
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = GAME_CONFIG;
  else root.GAME_CONFIG = GAME_CONFIG;
})(typeof self !== 'undefined' ? self : this);
