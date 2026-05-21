const mongoose = require("mongoose");

/* ── 장바구니 아이템 서브 스키마 ── */
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "수량은 1 이상이어야 합니다."],
      default: 1,
    },
    /* 담은 시점의 가격 스냅샷 (이후 가격 변동에 영향받지 않음) */
    priceSnapshot: {
      price:        { type: Number, required: true },
      discountRate: { type: Number, default: 0 },
      salePrice:    { type: Number, required: true },
    },
  },
  { _id: true }
);

/* ── 아이템별 소계 virtual ── */
cartItemSchema.virtual("subtotal").get(function () {
  return this.priceSnapshot.salePrice * this.quantity;
});

/* ── 장바구니 메인 스키마 ── */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 유저 1명당 장바구니 1개
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── 장바구니 합계 virtuals ── */
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce(
    (sum, item) => sum + item.priceSnapshot.salePrice * item.quantity,
    0
  );
});

cartSchema.virtual("totalDiscount").get(function () {
  return this.items.reduce(
    (sum, item) =>
      sum + (item.priceSnapshot.price - item.priceSnapshot.salePrice) * item.quantity,
    0
  );
});


module.exports = mongoose.model("Cart", cartSchema);
