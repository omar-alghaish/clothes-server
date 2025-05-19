import { Router } from "express";
import { protect, resizeBrandLogo, uploadBrandLogo, uploadBrandLogoToCloudinary } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { deleteBrand, getAllBrands, getBrand, getMyBrand, updateBrand, updateBrandActive } from "./../controllers/brandController";


const router = Router();

router.get("/my-brand", protect, getMyBrand)
router.patch("/:id", 
    // protect,
    uploadBrandLogo,
    resizeBrandLogo, 
    uploadBrandLogoToCloudinary, 
    updateBrand
)

//Admin routes

router.get("/", getAllBrands)
router.patch("/:id/active", protect, restrictTo('admin'), updateBrandActive);
router.delete("/:id", protect, restrictTo('admin'), deleteBrand)


export default router;
