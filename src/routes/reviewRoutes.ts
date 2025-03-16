import { Router } from "express";
import { createReview, getItemReviews } from "./../controllers/reviewsController";
import { protect } from "../controllers/authController";


const router = Router();

router.post("/",protect, createReview);
router.get("/:id",protect, getItemReviews);


export default router;