const Order   = require("../models/Order");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

/* ── 포트원 REST API: 액세스 토큰 발급 ── */
const getIamportToken = async () => {
  const res = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key:    process.env.IMP_KEY,
      imp_secret: process.env.IMP_SECRET,
    }),
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error("포트원 토큰 발급 실패: " + json.message);
  return json.response.access_token;
};

/* ── 포트원 REST API: imp_uid로 결제 정보 조회 ── */
const getIamportPayment = async (impUid, token) => {
  const res = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: { Authorization: token },
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error("결제 정보 조회 실패: " + json.message);
  return json.response;
};

/* ────────────────────────────────────────────
   유저용 엔드포인트
──────────────────────────────────────────── */

/* ── POST /api/orders
   장바구니 → 주문 생성, 재고 차감, 장바구니 비우기 ── */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, payment } = req.body;

    if (!shippingAddress?.name || !shippingAddress?.phone ||
        !shippingAddress?.zipCode || !shippingAddress?.street) {
      res.status(400);
      return next(new Error("배송지 정보(이름, 연락처, 우편번호, 주소)를 모두 입력해 주세요."));
    }
    if (!payment?.method) {
      res.status(400);
      return next(new Error("결제 수단을 선택해 주세요."));
    }
    if (!payment?.transactionId) {
      res.status(400);
      return next(new Error("결제 트랜잭션 정보가 없습니다."));
    }

    /* ── 중복 주문 방지: 동일 imp_uid 재사용 차단 ── */
    const duplicated = await Order.findOne({ "payment.transactionId": payment.transactionId });
    if (duplicated) {
      res.status(409);
      return next(new Error("이미 처리된 결제입니다."));
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name sku images price discountRate stock isActive");

    if (!cart || cart.items.length === 0) {
      res.status(400);
      return next(new Error("장바구니가 비어있습니다."));
    }

    /* 재고 일괄 검증 */
    for (const item of cart.items) {
      const p = item.product;
      if (!p || !p.isActive) {
        res.status(409);
        return next(new Error(`'${item.priceSnapshot?.price ? p?.name ?? "상품" : "상품"}'은(는) 현재 구매할 수 없습니다.`));
      }
      if (p.stock < item.quantity) {
        res.status(409);
        return next(new Error(`'${p.name}' 재고가 부족합니다. (현재 재고: ${p.stock}개)`));
      }
    }

    /* 주문 아이템 구성 (스냅샷) */
    const items = cart.items.map((item) => {
      const p = item.product;
      return {
        product:      p._id,
        name:         p.name,
        sku:          p.sku,
        image:        p.images?.[0] ?? "",
        price:        item.priceSnapshot.price,
        discountRate: item.priceSnapshot.discountRate,
        salePrice:    item.priceSnapshot.salePrice,
        quantity:     item.quantity,
      };
    });

    /* 금액 계산 */
    const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount   = items.reduce((s, i) => s + (i.price - i.salePrice) * i.quantity, 0);
    const total      = itemsTotal - discount; // 무료 배송

    /* ── 포트원 결제 금액 검증 (운영 환경만 강제 적용) ── */
    if (process.env.NODE_ENV === "production") {
      try {
        const token = await getIamportToken();
        const paid  = await getIamportPayment(payment.transactionId, token);

        if (paid.status !== "paid") {
          res.status(402);
          return next(new Error(`결제가 완료되지 않았습니다. (상태: ${paid.status})`));
        }
        if (paid.amount !== total) {
          res.status(402);
          return next(new Error(
            `결제 금액이 일치하지 않습니다. (결제: ${paid.amount}원 / 주문: ${total}원)`
          ));
        }
      } catch (verifyErr) {
        res.status(502);
        return next(verifyErr);
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      payment: {
        method:        payment.method,
        status:        "paid",
        paidAt:        new Date(),
        transactionId: payment.transactionId,
      },
      status:  "confirmed",
      pricing: { itemsTotal, discount, shippingFee: 0, total },
    });

    /* 재고 차감 */
    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    /* 장바구니 비우기 */
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/orders
   내 주문 목록 (최신순, 페이지네이션) ── */
const getMyOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/orders/:id
   주문 상세 (본인 주문만) ── */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      res.status(404);
      return next(new Error("주문을 찾을 수 없습니다."));
    }
    if (order.user._id.toString() !== req.user.id && req.user.userType !== "admin") {
      res.status(403);
      return next(new Error("접근 권한이 없습니다."));
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/orders/:id/cancel
   주문 취소 (pending / confirmed 상태만 가능) ── */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      return next(new Error("주문을 찾을 수 없습니다."));
    }
    if (order.user.toString() !== req.user.id) {
      res.status(403);
      return next(new Error("접근 권한이 없습니다."));
    }
    if (!["pending", "confirmed"].includes(order.status)) {
      res.status(409);
      return next(new Error(`'${order.status}' 상태의 주문은 취소할 수 없습니다.`));
    }

    order.status = "cancelled";
    order.cancelReason = req.body.cancelReason ?? "";
    await order.save();

    /* 재고 복구 */
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      )
    );

    res.json(order);
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   관리자용 엔드포인트
──────────────────────────────────────────── */

/* ── GET /api/orders/admin
   전체 주문 목록 (status·user 필터, 페이지네이션) ── */
const getAllOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user)   filter.user   = req.query.user;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/orders/admin/:id/status
   주문 상태 변경 + 결제 완료 처리 ── */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, transactionId } = req.body;

    const VALID = ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"];
    if (!VALID.includes(status)) {
      res.status(400);
      return next(new Error("유효하지 않은 주문 상태입니다."));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      return next(new Error("주문을 찾을 수 없습니다."));
    }

    order.status = status;

    /* confirmed 전환 시 결제 완료 처리 */
    if (status === "confirmed") {
      order.payment.status = "paid";
      order.payment.paidAt = new Date();
      if (transactionId) order.payment.transactionId = transactionId;
    }

    /* refunded 전환 시 */
    if (status === "refunded") {
      order.payment.status = "refunded";
    }

    /* cancelled 전환 시 재고 복구 (관리자) */
    if (status === "cancelled" && order.status !== "cancelled") {
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
        )
      );
      order.cancelReason = req.body.cancelReason ?? "관리자 취소";
    }

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
