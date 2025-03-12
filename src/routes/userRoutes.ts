import { Router } from "express";
import { protect, signUp, signIn, forgotPassword, resetPassword} from "./../controllers/authController";
import { uploadUserphoto, resizeUserPhoto,uploadUserPhotoToCloudinary, updateMe, getMe } from "./../controllers/userController";

const router = Router();

// To be moved to 'auth routes' file
router.post("/register", signUp);
router.post("/login", signIn);

//To be implemented
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);


//user routes

//get me
router.get('/getMe', protect, getMe)
//get orders
//get favourits
// add cart
//add favourits
//add address

router.patch("/updateMe",protect,  uploadUserphoto, resizeUserPhoto, uploadUserPhotoToCloudinary, updateMe);

export default router;