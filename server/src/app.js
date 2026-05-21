const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const indexRouter = require("./routes/index");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes  = require("./routes/uploadRoutes");
const cartRoutes    = require("./routes/cartRoutes");
const orderRoutes   = require("./routes/orderRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS policy: origin not allowed"));
  },
  credentials: true,
}));

/* ── Rate limiting ── */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 로그인/회원가입은 15분에 10회
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "너무 많은 인증 시도입니다. 잠시 후 다시 시도해주세요." },
});

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload",  uploadRoutes);
app.use("/api/cart",    cartRoutes);
app.use("/api/orders",  orderRoutes);

app.use(errorHandler);

module.exports = app;
