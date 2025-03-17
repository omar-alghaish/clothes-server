import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { createAddress } from "./../controllers/addressController";


const router = Router();

router.post("/", protect, createAddress)


export default router;
