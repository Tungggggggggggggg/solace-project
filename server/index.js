const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/user.routes"); 
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/reports');
const cookieParser = require("cookie-parser");
const pool = require('./db');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("LỖI: JWT_SECRET chưa được định nghĩa trong file .env. Vui lòng kiểm tra lại.");
    process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Solace API');
});

// Gắn API xác thực
app.use("/api/auth", authRoutes);

app.use('/api/posts', postRoutes);
app.use('/api', searchRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));