import { Router } from "express";
import { signUp } from "./../controllers/authController";
import { signIn } from "./../controllers/authController";
import { authorize } from "./../controllers/authController";
import { forgotPassword } from "./../controllers/authController";
import { resetPassword } from "./../controllers/authController";

const router = Router();

router.post("/register", signUp);
router.post("/login", signIn);

router.post("/forgot password", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

export default router;
