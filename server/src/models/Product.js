const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9\-]+$/, "SKU는 영문 대문자, 숫자, 하이픈만 사용할 수 있습니다."],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: [0, "가격은 0 이상이어야 합니다."],
    },
    discountRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["Mac", "iPhone", "iPad", "Apple Watch", "AirPods", "Accessories"],
        message: "카테고리는 Mac, iPhone, iPad, Apple Watch, AirPods, Accessories 중 하나여야 합니다.",
      },
    },
    images: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      trim: true,
      default: "#1D1D1F",
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "재고는 0 이상이어야 합니다."],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Virtual: 할인가 ── */
productSchema.virtual("salePrice").get(function () {
  if (!this.discountRate) return this.price;
  return Math.round(this.price * (1 - this.discountRate / 100));
});

/* ── Index: 검색용 ── */
productSchema.index({ name: "text", description: "text", tagline: "text" });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
