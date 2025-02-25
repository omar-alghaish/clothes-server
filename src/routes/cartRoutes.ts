import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { addToCart } from "./../controllers/cartController";
import { getCart } from "./../controllers/cartController";
import { removeFromCart } from "./../controllers/cartController";
import { updateProductQuantity } from "./../controllers/cartController";


const router = Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart)
router.delete("/:id", protect, removeFromCart)
router.patch("/:id", protect, updateProductQuantity)

export default router;
