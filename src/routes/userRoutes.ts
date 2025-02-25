import { Router } from "express";
import { protect, signUp, signIn, forgotPassword, resetPassword} from "./../controllers/authController";
import { uploadUserphoto, resizeUserPhoto,uploadUserPhotoToCloudinary, updateMe } from "./../controllers/userController";

const router = Router();

router.post("/register", signUp);
router.post("/login", signIn);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.patch("/updateMe",protect,  uploadUserphoto, resizeUserPhoto, uploadUserPhotoToCloudinary, updateMe);

export default router;