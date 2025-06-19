const jwt = require("jsonwebtoken");
const pool = require("../db");

// Middleware xác thực người dùng
exports.isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Không có token hoặc định dạng sai" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 1. Kiểm tra xem user có tồn tại trong bảng public.users không, join thêm user_info để lấy created_at
        let userResult = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, ui.created_at
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.id
       WHERE u.id = $1`,
            [decoded.id]
        );

        let userProfile = userResult.rows[0];

        // 2. Nếu user chưa có profile trong public.users, tạo một entry cơ bản
        if (!userProfile) {
            console.warn(
                `User ${decoded.id} not found in public.users, creating a basic profile.`
            );
            // Bạn có thể lấy thêm thông tin từ decoded JWT (như email) nếu có
            const insertResult = await pool.query(
                "INSERT INTO users (id, email, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, avatar_url",
                [decoded.id, decoded.email, "Người", "Dùng Mới"] // Giá trị mặc định
            );
            userProfile = insertResult.rows[0];
        }

        // 3. Gắn thông tin user vào req
        req.user = {
            id: decoded.id, // ID từ JWT (auth.users.id)
            ...userProfile, // Thông tin từ public.users (đã có hoặc vừa tạo)
        };
        next();
    } catch (err) {
        console.error("Lỗi xác thực:", err);
        res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
};
