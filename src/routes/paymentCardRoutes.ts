import { Router } from "express";
import { createPaymentCard } from "./../controllers/paymentCardController";
import { protect } from "../controllers/authController";


const router = Router();

router.post("/",protect, createPaymentCard);

export default router;