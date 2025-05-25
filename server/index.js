const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // Cần nếu frontend gọi API từ khác port
const userRoutes = require("./routes/user.routes"); // Import route người dùng

dotenv.config();

const app = express();

app.use(cors()); // Cho phép frontend gọi API
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("Solace API");
});

// Gắn API người dùng
app.use("/api/users", userRoutes); 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
