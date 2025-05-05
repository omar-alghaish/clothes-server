import { Router } from "express";
import { protect, resizeBrandLogo, uploadBrandLogo, uploadBrandLogoToCloudinary } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { getBrand, getMyBrand, updateBrand } from "./../controllers/brandController";


const router = Router();

router.get("/", getBrand)
router.get("/my-brand", protect, getMyBrand)
router.patch("/:id", 
    protect,
    uploadBrandLogo,
    resizeBrandLogo, 
    uploadBrandLogoToCloudinary, 
    updateBrand
)

export default router;
