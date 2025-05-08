import { Router } from "express";
import { createOrder, deleteOrder, getAllOrders, getMyOrders, getOrder, getSellerOrders, updateOrderActive, updateSellerOrder } from "./../controllers/orderController";
import { protect, restrictTo } from "../controllers/authController";


const router = Router();

// Admin routes
router.get("/admin/all", protect, restrictTo("admin"), getAllOrders);
router.patch("/admin/:id/active", protect, restrictTo("admin"), updateOrderActive);
router.delete("/admin/:id", protect, restrictTo("admin"), deleteOrder);



router.post("/", protect, createOrder);
router.get('/my-orders', protect, getMyOrders)
router.get("/seller-orders", protect, restrictTo('seller'), getSellerOrders);
router.patch("/seller-orders", protect, restrictTo('seller'), updateSellerOrder);
router.get("/:id", protect, getOrder);


export default router;