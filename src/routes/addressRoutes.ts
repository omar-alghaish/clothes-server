import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { createAddress, getAddresses } from "./../controllers/addressController";


const router = Router();

router.post("/", protect, createAddress)
router.get("/", protect, getAddresses)


export default router;
