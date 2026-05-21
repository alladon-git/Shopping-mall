const Product = require("../models/Product");

/* ── GET /api/products ── */
const getProducts = async (req, res, next) => {
  try {
    const { category, isActive, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/products/:id ── */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/products/sku/:sku ── */
const getProductBySku = async (req, res, next) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() });
    if (!product) return res.status(404).json({ message: "해당 SKU의 상품을 찾을 수 없습니다." });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/products ── */
const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `SKU '${req.body.sku}'는 이미 사용 중입니다.` });
    }
    next(err);
  }
};

/* ── PUT /api/products/:id ── */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `SKU '${req.body.sku}'는 이미 사용 중입니다.` });
    }
    next(err);
  }
};

/* ── DELETE /api/products/:id ── */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    res.json({ message: "상품이 삭제되었습니다.", id: product._id });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, getProductBySku, createProduct, updateProduct, deleteProduct };
