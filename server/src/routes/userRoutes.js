const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.post("/", createUser);             // 회원가입은 인증 불필요
router.put("/:id", protect, updateUser);  // 본인 또는 관리자만
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
