## Đã triển khai trong lần cập nhật này

1. **Khắc phục triệt để lỗi kẹt trong nhà khi ngủ tới ngày khảo nghiệm linh căn (Ngày 3 / SELECTION_READY)**:
   - **Tối ưu tốc độ ngủ & chống vòng lặp ngủ lại**:
     + Rút ngắn hoạt cảnh ngủ từ 2.2 giây xuống 1.2 giây (nhảy ngày ở 0.6 giây, thức dậy sớm sau 0.2 giây nếu chạm/di chuyển).
     + Giảm bán kính tương tác của giường từ 86px xuống 54px; bổ sung `poseCooldown = 1.0s` sau khi thức dậy, ngăn chặn việc chạm liên tục trên màn hình điện thoại vô tình kích hoạt lại hành động ngủ.
     + Chặn ngủ tuyệt đối khi `currentDay >= 3` hoặc `selection_ready`: hiển thị toast nhắc nhở *"Hôm nay là Ngày Khảo Nghiệm Linh Căn! Mau ra quảng trường tham gia tuyển chọn, chớ ngủ quên!"*.
   - **Đồng bộ ngày khảo nghiệm tự động trong `quest1.js` & `npcs.js`**:
     + Mọi trường hợp `currentDay >= 3` khi người chơi ngủ qua ngày hoặc skip day đều tự động chuyển trạng thái nhiệm vụ sang `SELECTION_READY` ngay tức thì (không phụ thuộc vào ngày nhận ban đầu).
     + HUD hiển thị ngay lập tức cảnh báo khẩn: `⚡ Cấp báo: Tiên Nhân Giáng Lâm — Mau đến Quảng Trường Làng!`.
   - **Hỗ trợ lối ra và dẫn đường tức thì đến Quảng Trường Làng**:
     + Khi thức dậy vào Ngày 3 (hoặc bất kỳ ngày khảo nghiệm nào), hộp thoại thông báo lập tức xuất hiện kèm nút hành động nổi bật: `Đến Quảng Trường Làng Ngay ➔`. Bấm nút sẽ đưa Tiểu Phàm ra ngay sân quảng trường `(800, 550)` và mở màn tuyển chọn mà không bị kẹt trong nhà.
     + Khi đi bộ qua cửa nhà hoặc chạm vào bậc thềm cửa `▼ Cửa ra sân làng` vào Ngày 3, game tự động đưa người chơi ra thẳng quảng trường làng.
     + Nâng cấp query version `?v=home7` trong `public/game/index.html` để làm mới bộ nhớ đệm trình duyệt điện thoại.

2. **Cập nhật bộ kiểm thử tự động `tests/quest1.cjs`**:
   - TEST 11: Kiểm thử toàn diện chu trình ngủ Ngày 2 sang Ngày 3, kiểm tra tự động thoát giường, bán kính tương tác giường, chuyển trạng thái `SELECTION_READY`, và cơ chế teleport/bước ra quảng trường không bị kẹt.

## Kiểm chứng
- Toàn bộ 9/9 test suite (`tests/*.cjs`): PASS 100%.
- Kiểm tra biên dịch (`compile_applet`) & kiểm tra cú pháp (`lint_applet`): PASS 100%.

## Lỗi còn lại / Việc tiếp theo
- Không còn lỗi kẹt trong nhà hay giường khi ngủ tới ngày nhiệm vụ.
- Người chơi có thể tiếp tục trải nghiệm toàn bộ diễn biến khảo nghiệm linh căn của Trương Tiểu Phàm và A Huy.

