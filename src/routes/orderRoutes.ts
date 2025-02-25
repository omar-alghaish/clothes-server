import { Router } from "express";
import { createOrder, getAllOrders, getOrder } from "./../controllers/orderController";
import { protect } from "../controllers/authController";


const router = Router();

router.post("/",protect, createOrder);
router.get("/",protect, getAllOrders);
router.get("/:id",protect, getOrder);


export default router;
