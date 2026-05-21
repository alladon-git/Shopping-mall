const mongoose = require("mongoose");

/* ── 주문 아이템 서브 스키마 ── */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null, // 상품 삭제 후에도 이력 보존
    },
    name:         { type: String, required: true },
    sku:          { type: String, required: true },
    image:        { type: String, default: "" },
    price:        { type: Number, required: true },
    discountRate: { type: Number, default: 0 },
    salePrice:    { type: Number, required: true },
    quantity:     { type: Number, required: true, min: [1, "수량은 1 이상이어야 합니다."] },
  },
  { _id: true }
);

orderItemSchema.virtual("subtotal").get(function () {
  return this.salePrice * this.quantity;
});

/* ── 주문 메인 스키마 ── */
const orderSchema = new mongoose.Schema(
  {
    /* 주문 식별 */
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* 주문 아이템 */
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "주문 아이템이 1개 이상이어야 합니다.",
      },
    },

    /* 주문 상태 */
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"],
        message: "유효하지 않은 주문 상태입니다.",
      },
      default: "pending",
    },

    /* 배송 정보 */
    shippingAddress: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      zipCode: { type: String, required: true },
      street:  { type: String, required: true },
      detail:  { type: String, default: "" },
    },

    /* 결제 정보 */
    payment: {
      method: {
        type: String,
        enum: {
          values: ["card", "bank_transfer", "kakao_pay"],
          message: "유효하지 않은 결제 수단입니다.",
        },
        required: true,
      },
      status: {
        type: String,
        enum: ["unpaid", "paid", "refunded"],
        default: "unpaid",
      },
      paidAt:        { type: Date, default: null },
      transactionId: { type: String, default: "" },
    },

    /* 금액 요약 */
    pricing: {
      itemsTotal:  { type: Number, required: true, min: 0 }, // 할인 전 합계
      discount:    { type: Number, required: true, min: 0 }, // 총 할인액
      shippingFee: { type: Number, required: true, min: 0, default: 0 },
      total:       { type: Number, required: true, min: 0 }, // 최종 결제금액
    },

    /* 취소/환불 사유 */
    cancelReason: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── 주문번호 자동 생성 (저장 전) ── */
orderSchema.pre("validate", async function () {
  if (this.isNew && !this.orderNumber) {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // 20260519
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${datePart}-${String(count + 1).padStart(4, "0")}`;
  }
});

/* ── 인덱스 ── */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
