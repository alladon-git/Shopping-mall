const Cart = require("../models/Cart");
const Product = require("../models/Product");

/* ── 내 장바구니 조회  GET /api/cart ── */
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name sku images price discountRate stock isActive category");

    if (!cart) return res.json({ items: [], totalItems: 0, totalPrice: 0, totalDiscount: 0 });

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/* ── 상품 추가 / 수량 증가  POST /api/cart ── */
const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400);
      return next(new Error("productId는 필수입니다."));
    }
    if (quantity < 1) {
      res.status(400);
      return next(new Error("수량은 1 이상이어야 합니다."));
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      return next(new Error("상품을 찾을 수 없습니다."));
    }

    const salePrice = Math.round(product.price * (1 - (product.discountRate || 0) / 100));

    /* 재고 선 확인 */
    if (product.stock < quantity) {
      res.status(409);
      return next(new Error(`재고가 부족합니다. (현재 재고: ${product.stock}개)`));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existing = cart.items.find((i) => i.product.toString() === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        res.status(409);
        return next(new Error(`재고가 부족합니다. (현재 재고: ${product.stock}개)`));
      }
      existing.quantity = newQty;
      /* 가격이 바뀌었을 수 있으므로 스냅샷 갱신 */
      existing.priceSnapshot = { price: product.price, discountRate: product.discountRate, salePrice };
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceSnapshot: { price: product.price, discountRate: product.discountRate, salePrice },
      });
    }

    await cart.save();
    await cart.populate("items.product", "name sku images price discountRate stock isActive category");

    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

/* ── 수량 변경  PATCH /api/cart/:itemId ── */
const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity == null || quantity < 1) {
      res.status(400);
      return next(new Error("수량은 1 이상이어야 합니다."));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      res.status(404);
      return next(new Error("장바구니가 없습니다."));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      return next(new Error("해당 아이템을 찾을 수 없습니다."));
    }

    /* 재고 확인 */
    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      res.status(409);
      return next(new Error(`재고가 부족합니다. (현재 재고: ${product.stock}개)`));
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name sku images price discountRate stock isActive category");

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/* ── 아이템 삭제  DELETE /api/cart/:itemId ── */
const removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      res.status(404);
      return next(new Error("장바구니가 없습니다."));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      res.status(404);
      return next(new Error("해당 아이템을 찾을 수 없습니다."));
    }

    item.deleteOne();
    await cart.save();
    await cart.populate("items.product", "name sku images price discountRate stock isActive category");

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/* ── 장바구니 전체 비우기  DELETE /api/cart ── */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ message: "장바구니가 이미 비어있습니다." });

    cart.items = [];
    await cart.save();

    res.json({ message: "장바구니를 비웠습니다.", items: [], totalItems: 0, totalPrice: 0, totalDiscount: 0 });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
