const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ibmdb = require("ibm_db");
const cors = require("cors");

// Конфигурация базы данных
const dbConfig = {
  DATABASE: "DIL",
  HOSTNAME: "localhost",
  PORT: 50000,
  PROTOCOL: "TCPIP",
  UID: "Dilmurod",
  PWD: "718210",
};

// Секреты для токенов
const ACCESS_TOKEN_SECRET = "your_access_token_secret";
const REFRESH_TOKEN_SECRET = "your_refresh_token_secret";

// Хранилище refresh токенов
let refreshTokens = [];

const app = express();
app.use(cors());
app.use(express.json());

// Функция для генерации токенов
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.ID, role: user.ROLE }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m", // Время жизни access токена
  });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.ID }, REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return refreshToken;
};

// Подключение к базе данных
const connectToDb = async () => {
  try {
    const connection = await ibmdb.open(dbConfig);
    console.log("Connected to DB2 successfully");
    return connection;
  } catch (err) {
    console.error("Error connecting to DB2:", err.message);
    throw err;
  }
};

// Маршрут для логина
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const conn = await connectToDb();
    const query = `SELECT * FROM USERS WHERE USERNAME = ?`;
    const user = await conn.query(query, [username]);
    await conn.close();

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user[0].PASSWORD);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = generateAccessToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);

    res.json({ success: true, accessToken, refreshToken });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Маршрут для обновления токенов
app.post("/api/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

// Маршрут для выхода
app.post("/api/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ message: "Logged out successfully" });
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
