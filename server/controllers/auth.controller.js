const admin = require("firebase-admin");
const pool = require("../db");
const { createTokens, createAccessToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Xác thực Firebase ID Token
const verifyFirebaseToken = async (idToken) => {
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
};

exports.googleLogin = async (req, res) => {
  const {email, displayName, photoURL } = req.body;

  if (!email || !displayName) {
    return res.status(400).json({ error: "Thiếu thông tin xác thực" });
  }

  try {
    // Xác thực ID token với Firebase
    // const decoded = await verifyFirebaseToken(idToken);
    // if (decoded.uid !== uid) {
    //   return res.status(401).json({ error: "Token không hợp lệ" });
    // }

    // Kiểm tra user đã tồn tại trong PostgreSQL chưa
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;

    if (existingUser.rows.length === 0) {
      // Tách họ tên nếu cần
      const nameParts = displayName.trim().split(" ");
      const first_name = nameParts.slice(0, -1).join(" ");
      const last_name = nameParts[nameParts.length - 1];

      // Thêm người dùng mới
      const newUser = await pool.query(
        `INSERT INTO users (email, avatar_url, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email, photoURL, first_name, last_name]
      );
      user = newUser.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    // Tạo access và refresh token
    const { accessToken, refreshToken } = createTokens(user);

    // Xóa các refresh token hết hạn trước khi thêm token mới
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [user.id]
    );
    // Kiểm tra xem refresh token đã tồn tại chưa
    const existingRefreshToken = await pool.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [user.id]
    );
    if (existingRefreshToken.rows.length > 0) {
      // Nếu đã tồn tại, cập nhật token và thời gian hết hạn
      await pool.query(
        `UPDATE refresh_tokens
          SET token = $1, expires_at = NOW() + interval '15 days'
          WHERE user_id = $2`,
        [refreshToken, user.id]
      );
    } else {
      // Nếu chưa tồn tại, thêm mới
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + interval '15 days')`,
        [user.id, refreshToken]
      );
    }
    // Xóa password nếu có (trong trường hợp người dùng đã đăng ký bằng email và mật khẩu)
    delete user.password;
    // Lưu refreshToken vào cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
      path: "/", // Đặt path để cookie có thể truy cập từ mọi route
    });

    res.json({
      message: "Xác thực Google thành công",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
      accessToken,
    });

  } catch (error) {
    console.error("Lỗi xác thực Google:", error);
    return res.status(401).json({ error: "Xác thực Google thất bại" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    console.log(`Info user:`, user);
    console.log(`Email: ${email}, Password: ${password}`);

    if (!user) {
      return res.status(401).json({ error: 'Email không tồn tại hoặc không hợp lệ.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${valid}`);
    if (!valid) return res.status(401).json({ error: 'Sai mật khẩu.' });

    const { accessToken, refreshToken } = createTokens(user);

    // Xóa các refresh token hết hạn trước khi thêm token mới
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [user.id]
    );

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + interval '15 days')`,
      [user.id, refreshToken]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
      path: "/", // Đặt path để cookie có thể truy cập từ mọi route
    });
    // Xóa password trước khi trả về
    delete user.password;

    // Trả về access token và thông tin user
    res.json({ accessToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// Đăng ký user mới (local)
exports.signup = async (req, res) => {
  // Chuẩn hóa dữ liệu đầu vào
  const { 
    email = '', 
    password = '', 
    firstName = '', 
    lastName = '' 
  } = req.body;

  // Validate
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) errors.push('Email không hợp lệ');
  if (password.length < 8) errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  if (!firstName.trim()) errors.push('Họ không được để trống');
  if (!lastName.trim()) errors.push('Tên không được để trống');
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, firstName, lastName, hashedPassword]
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email đã được đăng ký' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[Signup] Error: ${err.stack}`);
    }

    logger.error(`Signup Error [${new Date().toISOString()}]`, {
      email: sanitizedEmail,
      error: err.stack,
    });

    res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Lỗi hệ thống' : err.message,
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Kiểm tra database trước
    const tokenCheck = await pool.query(
      `SELECT * FROM refresh_tokens 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (tokenCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const { user_id } = tokenCheck.rows[0];


    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
          return res.status(403).json({ error: 'Refresh token đã hết hạn' });
        }
        await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        return res.status(403).json({ error: 'Refresh token không hợp lệ' });
      }

      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (!userResult.rows.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Tạo token mới và xóa token cũ
      const { accessToken } = createAccessToken(userResult.rows[0]);

      res.json({ accessToken });
    });
  } catch (err) {
    logger.error("Lỗi refresh token", { error: err.stack });
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout
exports.logout = async (req, res) => {
  console.log("Logout request received");
  console.log("Cookies:", req.cookies);
  const token = req.cookies.refreshToken;
  console.log(`Logout token: ${token}`);
  if (!token) return res.status(400).json({ error: 'Không có token' });

  try {
    // Xóa refresh token khỏi database
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

    // Xóa cookie bằng cách đặt maxAge = 0 và sameSite, path trùng với khi set
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 0, // Đặt maxAge = 0 để xóa cookie
    });

    res.json({ message: "Đã đăng xuất" });
  } catch (err) {
    console.error("Lỗi logout:", err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// Trả về thông tin người dùng hiện tại sau xác thực
exports.getProfile = async (req, res) => {
  try {
    const { id, email, first_name, last_name, avatar_url } = req.user;
    res.json({ user: { id, email, first_name, last_name, avatar_url } });
  } catch (err) {
    console.error("Lỗi getProfile:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};