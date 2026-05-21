const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cartController");

/* 모든 장바구니 엔드포인트는 로그인 필수 */
router.use(protect);

router.get("/",          getCart);    // 내 장바구니 조회
router.post("/",         addItem);    // 상품 추가
router.patch("/:itemId", updateItem); // 수량 변경
router.delete("/:itemId",removeItem); // 아이템 삭제
router.delete("/",       clearCart);  // 전체 비우기

module.exports = router;
