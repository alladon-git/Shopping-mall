const express = require("express");
const router  = express.Router();
const { protect }   = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.use(protect);

/* ── 관리자 라우트: /:id 보다 먼저 등록해야 충돌 방지 ── */
router.get("/admin",              adminOnly, getAllOrders);           // 전체 주문 조회
router.patch("/admin/:id/status", adminOnly, updateOrderStatus);     // 상태 변경

/* ── 유저 라우트 ── */
router.post("/",                  createOrder);    // 주문 생성
router.get("/",                   getMyOrders);    // 내 주문 목록
router.get("/:id",                getOrderById);   // 주문 상세
router.patch("/:id/cancel",       cancelOrder);    // 주문 취소

module.exports = router;
