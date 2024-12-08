const express = require('express');
const cors = require('cors');
const app = express();

// Cấu hình CORS
app.use(
  cors({
    origin: 'http://localhost:3001', // URL của frontend Vite
    credentials: true // Cho phép gửi cookie
  })
);

// Hoặc cho phép tất cả origin (không khuyến khích trong production)
app.use(cors());
