const express = require("express");
const router = express.Router();
const { login } = require("../controllers/loginController");
const { getMe, logout } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
