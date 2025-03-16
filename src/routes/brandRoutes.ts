import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { getBrand } from "./../controllers/brandController";


const router = Router();

router.get("/", getBrand)


export default router;
