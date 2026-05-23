const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  createOrder,
  getClientOrders,
  getCompanyOrders,
  updateOrderStatus
} = require("../controllers/orderController");
router.post("/",              auth, createOrder);
router.get("/my-orders",      auth, getClientOrders);
router.get("/company-orders", auth, getCompanyOrders);
router.patch("/:id/status",   auth, updateOrderStatus);
module.exports = router;