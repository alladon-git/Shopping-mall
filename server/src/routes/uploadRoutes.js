const express  = require("express");
const router   = express.Router();
const { upload } = require("../middlewares/uploadMiddleware");
const {
  uploadImage,
  deleteImage,
  addProductImage,
  removeProductImage,
} = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

/* ── 단일 이미지 업로드 (서버 경유 multer → Cloudinary) ── */
router.post("/image", protect, adminOnly, upload.single("image"), uploadImage);

/* ── Cloudinary 파일 삭제 ── */
router.delete("/image/:publicId", protect, adminOnly, deleteImage);

/* ── 상품에 이미지 추가/제거 (위젯 URL을 DB에 반영) ── */
router.patch("/products/:id/images", protect, adminOnly, addProductImage);
router.delete("/products/:id/images", protect, adminOnly, removeProductImage);

module.exports = router;
