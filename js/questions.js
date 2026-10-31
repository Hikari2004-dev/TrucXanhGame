// Bộ câu hỏi trắc nghiệm.
// q: nội dung câu hỏi
// opts: 4 đáp án — ĐÁP ÁN ĐÚNG LUÔN ĐẶT ĐẦU TIÊN (game tự xáo trộn khi hiển thị)
const QS=[
  {
    "q": "Theo Hồ Chí Minh, yếu tố nào đóng vai trò là chiến lược lâu dài, nhất quán, quyết định sự thành công của cách mạng Việt Nam?",
    "opts": [
      "Đại đoàn kết toàn dân tộc",
      "Đấu tranh giai cấp triệt để",
      "Tranh thủ viện trợ quốc tế",
      "Tăng cường lực lượng quân sự"
    ]
  },
  {
    "q": "Bài học lịch sử nào được Hồ Chí Minh tổng kết về mối quan hệ giữa đoàn kết và sự tồn vong của dân tộc Việt Nam?",
    "opts": [
      "\"Lúc nào dân ta đoàn kết muôn người như một thì nước ta độc lập, tự do. Trái lại lúc nào dân ta không đoàn kết thì bị nước ngoài xâm lấn\"",
      "\"Lúc nào kinh tế phát triển thì nước ta độc lập, tự do. Trái lại lúc nào kinh tế suy yếu thì bị nước ngoài xâm lấn\"",
      "\"Lúc nào quân đội mạnh thì nước ta độc lập, tự do. Trái lại lúc nào quân đội yếu thì bị nước ngoài xâm lấn\"",
      "\"Lúc nào ngoại giao khéo léo thì nước ta độc lập, tự do. Trái lại lúc nào ngoại giao kém thì bị nước ngoài xâm lấn\""
    ]
  },
  {
    "q": "Khẩu hiệu chiến lược nào của Hồ Chí Minh đã trở thành chân lý về vai trò của khối đại đoàn kết toàn dân tộc?",
    "opts": [
      "\"Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công\"",
      "\"Không có gì quý hơn độc lập, tự do\"",
      "\"Dù phải đốt cháy cả dãy Trường Sơn cũng phải giành cho được độc lập\"",
      "\"Muốn cứu nước và giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản\""
    ]
  },
  {
    "q": "Luận điểm nào khẳng định mục đích ra mắt của Đảng Lao động Việt Nam ngày 3/3/1951 theo Hồ Chí Minh?",
    "opts": [
      "\"Mục đích của Đảng Lao động Việt Nam có thể gồm trong 8 chữ là: ĐOÀN KẾT TOÀN DÂN, PHỤNG SỰ TỔ QUỐC\"",
      "\"Mục đích của Đảng Lao động Việt Nam là lãnh đạo công nhân và nông dân đấu tranh giai cấp\"",
      "\"Mục đích của Đảng Lao động Việt Nam là xây dựng quân đội chính quy và hiện đại\"",
      "\"Mục đích của Đảng Lao động Việt Nam là mở rộng quan hệ đối ngoại với các nước\""
    ]
  },
  {
    "q": "Đối tượng nào bao gồm trong chủ thể của khối đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh?",
    "opts": [
      "Toàn thể nhân dân Việt Nam, không phân biệt dân tộc, giai cấp, tầng lớp, tôn giáo, lứa tuổi",
      "Chỉ gồm giai cấp công nhân và giai cấp nông dân lao động",
      "Chỉ gồm các lực lượng tham gia vào các đoàn thể cách mạng",
      "Chỉ gồm những người lao động sống ở trong nước"
    ]
  },
  {
    "q": "Hồ Chí Minh dùng từ \"ta\" trong tư tưởng đại đoàn kết toàn dân tộc để chỉ những ai?",
    "opts": [
      "Vừa là Đảng Cộng sản Việt Nam nói riêng, vừa là mọi người dân Việt Nam nói chung",
      "Chỉ riêng các cán bộ và đảng viên Đảng Cộng sản Việt Nam",
      "Chỉ riêng giai cấp công nhân và giai cấp nông dân",
      "Chỉ riêng lực lượng vũ trang nhân dân Việt Nam"
    ]
  },
  {
    "q": "Lực lượng nào tạo thành nền tảng của khối đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh?",
    "opts": [
      "Công nhân, nông dân và trí thức",
      "Công nhân, tiểu tư sản và tư sản dân tộc",
      "Nông dân, trí thức và thương gia",
      "Lực lượng vũ trang và thanh niên"
    ]
  },
  {
    "q": "Yếu tố nào được Hồ Chí Minh xác định là \"hạt nhân\" của khối đại đoàn kết toàn dân tộc?",
    "opts": [
      "Sự đoàn kết và thống nhất trong Đảng",
      "Sự phát triển kinh tế của đất nước",
      "Lực lượng quốc phòng toàn dân",
      "Sự mở rộng hợp tác quốc tế"
    ]
  },
  {
    "q": "Điểm quy tụ để xây dựng khối đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh là gì?",
    "opts": [
      "Độc lập, tự do của dân tộc và hạnh phúc của nhân dân",
      "Sự gia tăng thu nhập cá nhân của mọi tầng lớp",
      "Việc xoá bỏ hoàn toàn các tôn giáo trong xã hội",
      "Việc mở rộng địa giới hành chính của quốc gia"
    ]
  },
  {
    "q": "Hồ Chí Minh thể hiện tinh thần khoan dung, đại độ đối với những người Việt Nam từng có quá khứ đi nhầm đường bằng câu nói nào?",
    "opts": [
      "\"Bất kỳ ai mà thật thà tán thành hòa bình, thống nhất, độc lập, dân chủ thì dù những người đó trước đây chống chúng ta, bây giờ chúng ta cũng thật thà đoàn kết với họ\"",
      "\"Thà hy sinh tất cả chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ\"",
      "\"Không có gì quý hơn độc lập, tự do\"",
      "\"Nước Việt Nam là một, dân tộc Việt Nam là một. Sông có thể cạn, núi có thể mòn, song chân lý ấy không bao giờ thay đổi\""
    ]
  },
  {
    "q": "Tổ chức nào là hình thức tập hợp đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh?",
    "opts": [
      "Mặt trận dân tộc thống nhất",
      "Các câu lạc bộ tự phát của nhân dân",
      "Hệ thống các cơ quan hành chính nhà nước",
      "Các hiệp hội thương mại tư nhân"
    ]
  },
  {
    "q": "Tên gọi của Mặt trận dân tộc thống nhất do Đảng Cộng sản Việt Nam thành lập vào tháng 5/1941 là gì?",
    "opts": [
      "Mặt trận Việt Minh (Việt Nam Độc lập Đồng minh)",
      "Hội Phản đế Đồng minh",
      "Mặt trận Dân chủ Đông Dương",
      "Mặt trận Liên Việt"
    ]
  },
  {
    "q": "Nguyên tắc làm việc chủ yếu trong quan hệ giữa các thành viên của Mặt trận dân tộc thống nhất là gì?",
    "opts": [
      "Hiệp thương dân chủ",
      "Mệnh lệnh hành chính",
      "Quyết định cá nhân",
      "Bắt buộc tuân thủ không thảo luận"
    ]
  },
  {
    "q": "Vì sao Hồ Chí Minh khẳng định đại đoàn kết toàn dân tộc là một mục tiêu, nhiệm vụ hàng đầu của cách mạng Việt Nam?",
    "opts": [
      "Vì cách mạng là sự nghiệp của quần chúng, do quần chúng và vì quần chúng, đại đoàn kết tạo nên sức mạnh tự giải phóng",
      "Vì đoàn kết quốc tế chỉ là phụ thuộc, không ảnh hưởng tới tiến trình cách mạng",
      "Vì tập hợp nhân dân giúp cắt giảm chi phí quân sự và hành chính",
      "Vì đoàn kết chỉ cần thiết trong giai đoạn đấu tranh giành chính quyền"
    ]
  },
  {
    "q": "Thái độ của Hồ Chí Minh đối với đồng bào các dân tộc thiểu số và các tôn giáo khác nhau được thể hiện như thế nào trong chính sách đại đoàn kết?",
    "opts": [
      "Tôn trọng sự đa dạng, bảo đảm bình đẳng, đoàn kết tôn giáo, đoàn kết các dân tộc anh em trên cơ sở yêu nước",
      "Yêu cầu xóa bỏ ranh giới tôn giáo và tập quán dân tộc để hòa nhập hoàn toàn",
      "Chỉ ưu tiên đoàn kết với các tôn giáo lớn và dân tộc đa số",
      "Coi tín ngưỡng tôn giáo là trở ngại cho việc xây dựng khối đại đoàn kết toàn dân"
    ]
  },
  {
    "q": "Theo Hồ Chí Minh, vì sao giai cấp công nhân và giai cấp nông dân là gốc của khối đại đoàn kết toàn dân tộc?",
    "opts": [
      "Vì họ là người trực tiếp sản xuất tài phú, đông đảo nhất và bị áp bức bóc lột nặng nề nhất",
      "Vì họ là lực lượng duy nhất có tri thức khoa học hiện đại trong xã hội",
      "Vì họ nắm giữ toàn bộ cơ sở vật chất và tài chính quốc gia",
      "Vì họ có khả năng tài chính tự trang bị vũ khí cho cách mạng"
    ]
  },
  {
    "q": "Quan điểm nào thể hiện thái độ bao dung, đại độ của Hồ Chí Minh đối với con người nhằm mở rộng khối đại đoàn kết?",
    "opts": [
      "\"Trong mấy triệu người cũng có người thế này thế khác, nhưng thế này hay thế khác đều là dòng dõi tổ tiên ta. Vậy nên ta phải khoan hồng đại độ...\"",
      "\"Ai có tài, có đức, có sức, có lòng phụng sự Tổ quốc thì ta tôn vinh họ làm lãnh đạo\"",
      "\"Chỉ đoàn kết với những người hoàn toàn không mắc sai lầm trong quá khứ\"",
      "\"Giai cấp công nhân phải loại bỏ hoàn toàn các giai cấp khác khỏi khối đoàn kết\""
    ]
  },
  {
    "q": "Điều kiện nào giúp củng cố niềm tin vào nhân dân trong xây dựng khối đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh?",
    "opts": [
      "Quán triệt sâu sắc quan điểm \"dân là gốc\", tin tưởng vào lực lượng và trí tuệ vô tận của quần chúng",
      "Đặt toàn bộ quyền quyết định vào các cán bộ lãnh đạo cấp cao",
      "Chỉ tin tưởng vào nhân dân khi họ đã trải qua rèn luyện trong quân đội",
      "Giới hạn sự tham gia của nhân dân vào các công việc kinh tế nhỏ lẻ"
    ]
  },
  {
    "q": "Quan hệ giữa Đảng Cộng sản Việt Nam và Mặt trận dân tộc thống nhất được Hồ Chí Minh xác định như thế nào?",
    "opts": [
      "Đảng vừa là thành viên, vừa là lực lượng lãnh đạo Mặt trận",
      "Đảng đứng ngoài Mặt trận để chỉ đạo độc lập",
      "Mặt trận quản lý và điều hành trực tiếp mọi hoạt động của Đảng",
      "Đảng và Mặt trận là hai tổ chức song song không có mối quan hệ với nhau"
    ]
  },
  {
    "q": "Phương pháp tự phê bình và phê bình trong Mặt trận dân tộc thống nhất phải dựa trên lập trường nào theo Hồ Chí Minh?",
    "opts": [
      "Lập trường thân ái, vì nước, vì dân, giúp nhau cùng tiến bộ",
      "Lập trường đấu tranh giai cấp gay gắt, triệt hạ lẫn nhau",
      "Lập trường bảo vệ quyền lợi riêng của từng đảng phái",
      "Lập trường né tránh khuyết điểm để giữ hòa khí bề ngoài"
    ]
  },
  {
    "q": "Công tác vận động quần chúng (dân vận) có vai trò gì trong phương thức xây dựng khối đại đoàn kết toàn dân tộc?",
    "opts": [
      "Giúp thu hút, giáo dục, hướng dẫn quần chúng tự giác phấn đấu cho sự nghiệp cách mạng",
      "Thay thế hoàn toàn các hình thức tổ chức đoàn thể nhân dân",
      "Bắt buộc nhân dân phải thực hiện các mệnh lệnh hành chính",
      "Chỉ áp dụng đối với đồng bào các dân tộc thiểu số ở vùng sâu vùng xa"
    ]
  },
  {
    "q": "Sự khác biệt bản chất giữa đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh và việc tập hợp lực lượng mang tính thủ đoạn chính trị là gì?",
    "opts": [
      "Đại đoàn kết toàn dân tộc là chiến lược lâu dài, nhất quán, chân thành xuất phát từ lợi ích dân tộc; không phải là thủ đoạn chính trị tập hợp lực lượng tạm thời",
      "Đại đoàn kết toàn dân tộc chỉ là biện pháp kỹ thuật thu hút quần chúng khi gặp khó khăn",
      "Đại đoàn kết toàn dân tộc là sự nhượng bộ nguyên tắc giai cấp để thu hút tầng lớp tư sản",
      "Đại đoàn kết toàn dân tộc là việc duy trì sự phục tùng tuyệt đối của nhân dân đối với chính quyền"
    ]
  },
  {
    "q": "Hồ Chí Minh đã giải quyết mối quan hệ giữa \"lợi ích chung của dân tộc\" và \"lợi ích riêng của các tầng lớp nhân dân\" như thế nào trong điều kiện xây dựng khối đại đoàn kết?",
    "opts": [
      "Lấy lợi ích tối cao của dân tộc làm điểm quy tụ, đồng thời tôn trọng và kết hợp hài hòa các lợi ích khác biệt chính đáng",
      "Đặt lợi ích giai cấp công nhân lên trên và xóa bỏ toàn bộ các lợi ích cá nhân khác",
      "Đặt lợi ích riêng của từng cá nhân lên trước lợi ích chung của quốc gia",
      "Xem các lợi ích khác biệt là yếu tố nguy hại cần tiêu diệt hoàn toàn"
    ]
  },
  {
    "q": "Đánh giá mối quan hệ giữa việc đứng vững trên lập trường giai cấp công nhân và việc mở rộng khối đại đoàn kết toàn dân tộc trong tư tưởng Hồ Chí Minh?",
    "opts": [
      "Lập trường giai cấp công nhân giúp xác định đúng bản chất, hướng tiến lên và giữ vững mục tiêu cách mạng, từ đó mở rộng khối đoàn kết không bị chao đảo hay chệch hướng",
      "Lập trường giai cấp công nhân mâu thuẫn trực tiếp và cản trở việc thu hút các tầng lớp trung lưu",
      "Việc mở rộng đoàn kết đòi hỏi phải từ bỏ hoàn toàn tính chất giai cấp của Đảng",
      "Mở rộng đoàn kết là sự tự phát của nhân dân, không phụ thuộc vào lập trường giai cấp"
    ]
  },
  {
    "q": "Vì sao việc xây dựng Mặt trận dân tộc thống nhất phải tuân thủ nguyên tắc đoàn kết lâu dài, chặt chẽ, chân thành, thân ái, giúp đỡ nhau cùng tiến bộ?",
    "opts": [
      "Vì các giai cấp, tầng lớp có lợi ích chung lâu dài nhưng còn những khác biệt về nhận thức và lợi ích riêng, cần giúp nhau sửa chữa khuyết điểm để cùng tiến bộ",
      "Vì Mặt trận là nơi thi hành các bản án kỷ luật đối với các đoàn thể yếu kém",
      "Vì sự tồn tại của Mặt trận chỉ mang tính chất ngắn hạn trong thời chiến",
      "Vì các đảng phái trong Mặt trận phải hoàn toàn từ bỏ bản chất riêng của tổ chức mình"
    ]
  },
  {
    "q": "Vai trò hạt nhân của các đoàn thể nhân dân và tổ chức quần chúng đối với sự bền vững của Mặt trận dân tộc thống nhất theo tư tưởng Hồ Chí Minh là gì?",
    "opts": [
      "Các đoàn thể là sợi dây gắn kết Đảng với nhân dân, là nòng cốt thu hút quần chúng vào Mặt trận, tạo nên sức mạnh thực tế của khối đại đoàn kết",
      "Các đoàn thể thay thế vai trò quản lý nhà nước ở các địa phương",
      "Các đoàn thể hoạt động độc lập và không chịu sự lãnh đạo của Mặt trận",
      "Các đoàn thể chỉ có nhiệm vụ thu tài chính đóng góp cho quỹ Mặt trận"
    ]
  },
  {
    "q": "Thực chất của việc kết hợp sức mạnh dân tộc với sức mạnh thời đại theo tư tưởng Hồ Chí Minh là gì?",
    "opts": [
      "Kết hợp chủ nghĩa yêu nước chân chính với chủ nghĩa quốc tế chân chính",
      "Kết hợp tiềm lực kinh tế trong nước với nguồn vốn vay nước ngoài",
      "Kết hợp quân đội thường trực với lực lượng dân quân tự vệ",
      "Kết hợp truyền thống văn hóa cổ truyền với văn hóa phương Tây"
    ]
  },
  {
    "q": "Lực lượng nào được Hồ Chí Minh coi là nòng cốt của khối đoàn kết quốc tế?",
    "opts": [
      "Phong trào cộng sản và công nhân quốc tế",
      "Bọn tư sản dân tộc ở các nước thuộc địa",
      "Các phe phái quân sự đối lập ở Châu Âu",
      "Các tổ chức từ thiện phi chính phủ"
    ]
  },
  {
    "q": "Hồ Chí Minh định hướng xây dựng bao nhiêu tầng mặt trận trong hình thức tổ chức đoàn kết quốc tế?",
    "opts": [
      "Bốn tầng mặt trận",
      "Hai tầng mặt trận",
      "Ba tầng mặt trận",
      "Năm tầng mặt trận"
    ]
  },
  {
    "q": "Tầng mặt trận quốc tế trực tiếp liên kết ba nước Đông Dương chống kẻ thù chung theo tư tưởng Hồ Chí Minh là gì?",
    "opts": [
      "Mặt trận đoàn kết Việt - Lào - Campuchia",
      "Mặt trận nhân dân Á - Phi đoàn kết với Việt Nam",
      "Mặt trận đại đoàn kết dân tộc Việt Nam",
      "Mặt trận nhân dân thế giới chống đế quốc"
    ]
  },
  {
    "q": "Nguyên tắc đoàn kết quốc tế hàng đầu được Hồ Chí Minh xác định dựa trên cơ sở nào?",
    "opts": [
      "Thống nhất mục tiêu và lợi ích; có lý, có tình",
      "Đánh đổi chủ quyền quốc gia lấy nguồn viện trợ",
      "Phụ thuộc hoàn toàn vào đường lối của các nước lớn",
      "Loại bỏ tính độc lập tự chủ của dân tộc"
    ]
  },
  {
    "q": "Câu nói nào của Hồ Chí Minh nhấn mạnh nguyên tắc tự lực tự cường khi tranh thủ sự giúp đỡ quốc tế?",
    "opts": [
      "\"Muốn người ta giúp mình, thì trước hết mình phải tự giúp lấy mình đã\"",
      "\"Không có gì quý hơn độc lập, tự do\"",
      "\"Đoàn kết, đoàn kết, đại đoàn kết\"",
      "\"Nước Việt Nam là một, dân tộc Việt Nam là một\""
    ]
  },
  {
    "q": "Lực lượng tiến bộ nào trên thế giới cũng được Hồ Chí Minh chủ trương tập hợp vào khối đoàn kết quốc tế?",
    "opts": [
      "Những người yêu chuộng hòa bình, dân chủ, tự do và công lý",
      "Bọn quân phiệt xâm lược ở các nước đế quốc",
      "Các tập đoàn tài chính độc quyền ở phương Tây",
      "Các lực lượng ủng hộ duy trì chế độ thuộc địa"
    ]
  },
  {
    "q": "Khẩu hiệu chiến lược của chủ nghĩa Mác - Lênin được Hồ Chí Minh phát triển sáng tạo trong đoàn kết quốc tế là gì?",
    "opts": [
      "\"Vô sản tất cả các nước và các dân tộc bị áp bức, đoàn kết lại\"",
      "\"Thế giới vô sản giai cấp liên hợp lại\"",
      "\"Lương giáo đoàn kết, toàn dân đoàn kết\"",
      "\"Bốn phương vô sản đều là anh em\""
    ]
  },
  {
    "q": "Vì sao việc kết hợp sức mạnh dân tộc với sức mạnh thời đại là yếu tố quyết định thắng lợi của cách mạng Việt Nam?",
    "opts": [
      "Vì cách mạng Việt Nam là một bộ phận của cách mạng thế giới, tranh thủ sự ủng hộ quốc tế tạo nên sức mạnh tổng hợp thắng kẻ thù",
      "Vì nội lực trong nước không đủ sức tự tiến hành kháng chiến",
      "Vì đường lối cách mạng Việt Nam do các tổ chức quốc tế hoạch định hoàn toàn",
      "Vì các nước lớn sẽ thay Việt Nam giải quyết các xung đột quân sự"
    ]
  },
  {
    "q": "Mối quan hệ giữa sức mạnh dân tộc và sức mạnh thời đại trong tư tưởng Hồ Chí Minh được xác định như thế nào?",
    "opts": [
      "Sức mạnh dân tộc là gốc, là quyết định; sức mạnh thời đại là rất quan trọng và phát huy tác dụng thông qua sức mạnh dân tộc",
      "Sức mạnh thời đại giữ vai trò quyết định hoàn toàn, sức mạnh dân tộc là thứ yếu",
      "Hai nguồn sức mạnh này hoàn toàn tách biệt và không hỗ trợ lẫn nhau",
      "Sức mạnh dân tộc chỉ có ý nghĩa trong giai đoạn hòa bình xây dựng"
    ]
  },
  {
    "q": "Ý nghĩa của phương châm \"có lý, có tình\" trong xử lý các bất đồng thuộc phong trào cộng sản và công nhân quốc tế theo tư tưởng Hồ Chí Minh là gì?",
    "opts": [
      "Tuân thủ các nguyên tắc Mác - Lênin, tôn trọng độc lập của nhau, ứng xử có trước có sau, kiên nhẫn thuyết phục bằng tình đồng chí",
      "Sử dụng áp lực chính trị để buộc các đảng khác tuân theo quan điểm của mình",
      "Né tránh các vấn đề bất đồng để giữ mối quan hệ hình thức",
      "Công khai chỉ trích gay gắt các sai lầm của các đảng bạn trên các phương tiện truyền thông"
    ]
  },
  {
    "q": "Nội dung nào phản ánh đúng thái độ của Hồ Chí Minh đối với nhân dân các nước đi xâm lược (như nhân dân Pháp, nhân dân Mỹ)?",
    "opts": [
      "Phân biệt rõ giữa nhân dân lao động tiến bộ với giai cấp cầm quyền hiếu chiến xâm lược",
      "Coi toàn bộ nhân dân nước đi xâm lược đều là kẻ thù của dân tộc Việt Nam",
      "Từ chối mọi sự giúp đỡ từ các đoàn thể nhân dân ở các nước đi xâm lược",
      "Chỉ đoàn kết với nhân dân các nước đi xâm lược sau khi chiến tranh kết thúc"
    ]
  },
  {
    "q": "Mục tiêu chung làm cơ sở cho sự đoàn kết giữa Việt Nam với phong trào giải phóng dân tộc trên thế giới là gì?",
    "opts": [
      "Đấu tranh chống chủ nghĩa đế quốc, chủ nghĩa thực dân để giành độc lập, tự do",
      "Xây dựng mô hình kinh tế thị trường tự do",
      "Thành lập các liên minh quân sự tiến công",
      "Đồng hóa các giá trị văn hóa giữa các quốc gia"
    ]
  },
  {
    "q": "Sự sáng tạo của Hồ Chí Minh trong việc xác định lực lượng đoàn kết quốc tế so với lý luận Mác - Lênin truyền thống thể hiện ở điểm nào?",
    "opts": [
      "Bổ sung phong trào giải phóng dân tộc và lực lượng tiến bộ yêu chuộng hòa bình bên cạnh phong trào vô sản quốc tế",
      "Đặt tư sản dân tộc các nước đế quốc làm nòng cốt cho đoàn kết quốc tế",
      "Phủ nhận vai trò của giai cấp công nhân quốc tế trong sự nghiệp giải phóng dân tộc",
      "Chỉ tập trung đoàn kết với các nước láng giềng có chung biên giới"
    ]
  },
  {
    "q": "Trình bày sự kết hợp logic giữa hai nguyên tắc \"thống nhất mục tiêu, lợi ích\" và \"độc lập, tự chủ, tự lực tự cường\" trong đoàn kết quốc tế của Hồ Chí Minh?",
    "opts": [
      "Tự lực tự cường giúp nâng cao vị thế và thực lực để đoàn kết bình đẳng, còn thống nhất mục tiêu giúp mở rộng liên minh mà không tổn hại đến độc lập dân tộc",
      "Tự lực tự cường đòi hỏi từ chối sự giúp đỡ quốc tế để giữ nguyên vẹn mục tiêu",
      "Thống nhất mục tiêu đòi hỏi quốc gia phải chấp nhận sự điều hành từ trung tâm quốc tế",
      "Hai nguyên tắc này loại trừ lẫn nhau trong quá trình thực thi chính sách đối ngoại"
    ]
  },
  {
    "q": "Đánh giá ý nghĩa lịch sử của tư tưởng bốn tầng mặt trận đoàn kết quốc tế do Hồ Chí Minh khởi xướng đối với thắng lợi của cách mạng Việt Nam?",
    "opts": [
      "Tạo nên một trận tuyến nhân dân thế giới rộng lớn bao vây, cô lập kẻ thù, tranh thủ tối đa sự hỗ trợ tinh thần và vật chất cho kháng chiến",
      "Thay thế hoàn toàn lực lượng vũ trang trong nước bằng quân tình nguyện quốc tế",
      "Làm cho cách mạng Việt Nam trở thành lực lượng chi phối các tổ chức quốc tế",
      "Thu hẹp phạm vi đối ngoại của Việt Nam trong khu vực Đông Nam Á"
    ]
  },
  {
    "q": "Nghị quyết nào của Bộ Chính trị Trung ương Đảng khóa VII đã kế thừa và phát triển tư tưởng Hồ Chí Minh về đại đoàn kết dân tộc trong thời kỳ đổi mới?",
    "opts": [
      "Nghị quyết số 07-NQ/TW ngày 17/11/1993",
      "Nghị quyết số 01-NQ/TW ngày 1/1/1990",
      "Nghị quyết số 05-NQ/TW ngày 5/5/1995",
      "Nghị quyết số 10-NQ/TW ngày 10/10/2000"
    ]
  },
  {
    "q": "Trong giai đoạn hiện nay, sức mạnh của khối đại đoàn kết toàn dân tộc cần tập trung vào mục tiêu chủ yếu nào?",
    "opts": [
      "Chiến thắng nghèo nàn, lạc hậu, thực hiện dân giàu, nước mạnh, dân chủ, công bằng, văn minh",
      "Duy trì nền kinh tế tự cấp tự túc khép kín",
      "Xóa bỏ hoàn toàn thành phần kinh tế tư nhân",
      "Tập trung mọi nguồn lực cho quân sự bên ngoài"
    ]
  },
  {
    "q": "Nền tảng của khối đại đoàn kết toàn dân tộc trong giai đoạn hiện nay dưới sự lãnh đạo của Đảng là gì?",
    "opts": [
      "Liên minh công nhân - nông dân - trí thức",
      "Liên minh tư sản - địa chủ - trí thức",
      "Liên minh thương gia - thanh niên - phụ nữ",
      "Khối liên kết các doanh nghiệp nước ngoài"
    ]
  },
  {
    "q": "Đường lối đối ngoại hiện nay của Đảng và Nhà nước ta vận dụng tư tưởng đoàn kết quốc tế của Hồ Chí Minh bao gồm nội dung nào?",
    "opts": [
      "Độc lập, tự chủ, hòa bình, hợp tác và phát triển; đa phương hóa, đa dạng hóa quan hệ",
      "Liên minh quân sự khép kín với các nước láng giềng",
      "Chỉ mở rộng quan hệ thương mại với các nước phát triển",
      "Khép kín đối ngoại để tự bảo vệ an ninh quốc gia"
    ]
  },
  {
    "q": "Yêu cầu quán triệt tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc trong việc hoạch định chủ trương, đường lối của Đảng giai đoạn hiện nay là gì?",
    "opts": [
      "Lấy lợi ích dân tộc, đất nước lên hàng đầu, làm cơ sở xây dựng các chính sách kinh tế - xã hội",
      "Ưu tiên phát triển lợi ích của nhóm doanh nghiệp lớn",
      "Đặt lợi ích cá nhân của người lao động độc lập với lợi ích quốc gia",
      "Áp dụng rập khuôn chính sách của các nước phát triển"
    ]
  },
  {
    "q": "Vai trò của Mặt trận Tổ quốc Việt Nam và các đoàn thể nhân dân trong việc phát huy khối đại đoàn kết toàn dân tộc hiện nay được thể hiện ra sao?",
    "opts": [
      "Đổi mới nội dung và phương thức hoạt động, đại diện quyền và lợi ích hợp pháp của nhân dân, làm nòng cốt đoàn kết",
      "Chuyển sang thực hiện các chức năng quản lý nhà nước thay các bộ ngành",
      "Giảm bớt các hoạt động vận động quần chúng để tập trung kinh doanh",
      "Chỉ chú trọng công tác đối ngoại với các tổ chức phi chính phủ"
    ]
  },
  {
    "q": "Mối quan hệ biện chứng giữa đại đoàn kết toàn dân tộc và đoàn kết quốc tế trong thời kỳ hội nhập quốc tế hiện nay được thể hiện như thế nào?",
    "opts": [
      "Đại đoàn kết toàn dân tộc là cơ sở phát huy nội lực để hội nhập thành công, còn đoàn kết quốc tế giúp tranh thủ ngoại lực để tăng cường sức mạnh dân tộc",
      "Đoàn kết quốc tế là yếu tố quyết định thay thế cho việc xây dựng đại đoàn kết trong nước",
      "Hội nhập quốc tế đòi hỏi phải giảm bớt vai trò lãnh đạo của Đảng đối với khối đại đoàn kết",
      "Đại đoàn kết trong nước chỉ có tác dụng bảo vệ an ninh quốc phòng, không liên quan đến đối ngoại"
    ]
  },
  {
    "q": "Phương châm \"Việt Nam là bạn, là đối tác tin cậy và là thành viên có trách nhiệm của cộng đồng quốc tế\" thể hiện sự vận dụng sáng tạo tư tưởng Hồ Chí Minh nào?",
    "opts": [
      "Tư tưởng đoàn kết quốc tế trên cơ sở bình đẳng, cùng có lợi, kết hợp chủ nghĩa yêu nước với chủ nghĩa quốc tế chân chính",
      "Tư tưởng biệt lập và khép kín quốc gia để giữ vững bản sắc",
      "Tư tưởng phụ thuộc vào các nước lớn để đảm bảo an ninh",
      "Tư tưởng đặt lợi ích quốc tế lên trên lợi ích tối cao của dân tộc"
    ]
  }
];
