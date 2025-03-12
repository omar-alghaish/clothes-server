import { Router } from "express";
import { createOrder, getMyOrders, getOrder } from "./../controllers/orderController";
import { protect } from "../controllers/authController";


const router = Router();

router.post("/",protect, createOrder);
router.get('/my-orders',protect, getMyOrders)
router.get("/:id",protect, getOrder);


export default router;