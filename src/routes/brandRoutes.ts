import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { getBrand, getMyBrand, updateBrand } from "./../controllers/brandController";


const router = Router();

router.get("/", getBrand)
router.get("/my-brand", protect, getMyBrand)
router.patch("/:id", protect, updateBrand)

export default router;
