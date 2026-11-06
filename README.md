# Làng Du Lãm — AI Studio

Bản web phiên bản 18, commit 9d4c6cd8a72b8fc62ddc5fdfa7d16bca4d0ec76f.

## Chạy
Node.js 20.19+ hoặc 22.12+.
```sh
npm install
npm run dev
```
`npm run build` tạo bản web; `npm test` kiểm tra gameplay.

## Nhập AI Studio
Giải nén, đưa toàn bộ nội dung vào dự án. package.json nằm ngay thư mục gốc. Không đưa riêng tệp ZIP vào thư mục mã nguồn. Không cần API key.

React làm vỏ ứng dụng, iframe cùng nguồn chạy engine Canvas trong public/game. Toàn bộ gameplay và ảnh nằm tại đây, không nhúng website bên ngoài.

## Đã bao gồm
Tiểu Phàm 14 tuổi; 24 NPC; ruộng mùa vụ 7 ngày; hai con trâu; trẻ chơi; vườn hoa và kiến trúc; ánh sáng/ngày đêm; mưa/bão/tuyết; giếng mới và đình; NPC chạy trú mưa, nông dân mặc áo tơi; sửa nền cỏ lặp và đường nối map.

WASD/phím mũi tên hoặc joystick cảm ứng; Shift/nút Chạy. Giao diện tối giản giữ như bản web. Nút thời tiết/thời gian đang ẩn trong style.css. Chưa lưu tiến trình giữa các lần tải lại; lữ khách chưa mở khóa.
