const cloudinary = require("../config/cloudinary");
const Product    = require("../models/Product");

/* ── POST /api/upload/image
   multer-storage-cloudinary가 req.file.path에 Cloudinary URL을 넣어 줌 ── */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "파일이 없습니다." });

    res.json({
      url:       req.file.path,          // secure_url
      publicId:  req.file.filename,      // public_id
      width:     req.file.width,
      height:    req.file.height,
      format:    req.file.format,
    });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/upload/image/:publicId
   상품 이미지를 교체할 때 기존 Cloudinary 파일 삭제 ── */
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    if (!publicId) return res.status(400).json({ message: "publicId가 필요합니다." });

    const result = await cloudinary.uploader.destroy(decodeURIComponent(publicId));
    res.json({ result });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/products/:id/images
   상품에 이미지 URL 추가 (Cloudinary 위젯에서 받은 URL을 DB에 저장) ── */
const addProductImage = async (req, res, next) => {
  try {
    const { url, publicId } = req.body;
    if (!url) return res.status(400).json({ message: "url이 필요합니다." });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: url } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });

    res.json({ images: product.images });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/products/:id/images
   상품에서 특정 이미지 URL 제거 + Cloudinary에서도 삭제 ── */
const removeProductImage = async (req, res, next) => {
  try {
    const { url, publicId } = req.body;
    if (!url) return res.status(400).json({ message: "url이 필요합니다." });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: url } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });

    // Cloudinary에서도 파일 삭제 (publicId 제공 시)
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    res.json({ images: product.images });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage, deleteImage, addProductImage, removeProductImage };
