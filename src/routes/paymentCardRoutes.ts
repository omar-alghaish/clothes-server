import { Router } from "express";
import { createPaymentCard, getPaymentCards } from "./../controllers/paymentCardController";
import { protect } from "../controllers/authController";


const router = Router();

router.post("/",protect, createPaymentCard);
router.get("/",protect, getPaymentCards);

/*
router.post("/",protect, updatePaymentCard);
router.post("/",protect, deletePaymentCard);
*/
export default router;