import { Router } from "express";
import { protect, signUp, signIn, forgotPassword, resetPassword, changePassword, uploadBrandLogo, resizeBrandLogo, uploadBrandLogoToCloudinary, restrictTo} from "./../controllers/authController";
import { uploadUserphoto, resizeUserPhoto,uploadUserPhotoToCloudinary, updateMe, getMe, deleteMe, getAllUsers, updateUser, deleteUser, createUserByAdmin } from "./../controllers/userController";

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

// get me
router.get('/getMe', protect, getMe)
router.delete('/deleteMe', protect, deleteMe)
router.patch("/updateMe",protect,  uploadUserphoto, resizeUserPhoto, uploadUserPhotoToCloudinary, updateMe);

// Admin endpoints
router.post("/", protect, restrictTo('admin'), createUserByAdmin)
router.get("/", protect, restrictTo('admin'), getAllUsers)
router.patch("/:id", protect, restrictTo('admin'), updateUser)
router.delete("/:id", protect, restrictTo('admin'), deleteUser)
 
export default router; 