import { Router } from "express";
import { protect, signUp, signIn, forgotPassword, resetPassword, changePassword, uploadBrandLogo, resizeBrandLogo, uploadBrandLogoToCloudinary} from "./../controllers/authController";
import { uploadUserphoto, resizeUserPhoto,uploadUserPhotoToCloudinary, updateMe, getMe, deleteMe } from "./../controllers/userController";

const router = Router();

// To be moved to 'auth routes' file
router.post('/register', 
    uploadBrandLogo,
    resizeBrandLogo,
    uploadBrandLogoToCloudinary,
    signUp
  );
router.post("/login", signIn);

// Password reset routes 
router.patch('/changePassword', protect, changePassword);


//get me
router.get('/getMe', protect, getMe)
router.delete('/deleteMe', protect, deleteMe)


router.patch("/updateMe",protect,  uploadUserphoto, resizeUserPhoto, uploadUserPhotoToCloudinary, updateMe);

export default router;