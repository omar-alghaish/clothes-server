import { Router } from "express";
import { createOrder, getMyOrders, getOrder, getSellerOrders, updateSellerOrder } from "./../controllers/orderController";
import { protect, restrictTo } from "../controllers/authController";


const router = Router();

router.post("/", protect, createOrder);
router.get('/my-orders', protect, getMyOrders)
router.get("/seller-orders", protect, restrictTo('seller'), getSellerOrders);
router.patch("/seller-orders", protect, restrictTo('seller'), updateSellerOrder);
router.get("/:id", protect, getOrder);


export default router;