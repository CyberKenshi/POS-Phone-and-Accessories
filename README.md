Hướng dẫn chạy project với Docker-compose:
Tài khoản: admin
Mật khẩu: admin

# Build toàn bộ dự án:
## Đứng tại thư mục gốc nodejs_2024:
    cmd: docker-compose up

# Nếu muốn chạy từng container đọc lập:
### Cho backend:
    cmd: cd backend
    cmd: docker build -t backend .
    cmd: docker run -p 3000:3000 backend

### Cho frontend:
    cmd: cd src_fe
    cmd: docker build -t frontend:dev . 
    cmd: docker run -p 3001:3001 frontend:dev

### Link video demo:
https://drive.google.com/drive/folders/1D4Vrb3sZeGdbgN4ipcxiIXnj21FoaY5T?usp=sharing
