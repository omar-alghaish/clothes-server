import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  getAllFavorites,
  getOneFavorite,
  addToFavorites,
  removeFromFavorites,
  clearAllFavorites,
} from "../controllers/favouritController";

const router = express.Router();

// All favorites routes require authentication
router.use(protect);

// Get all favorites
router.get("/", getAllFavorites);

// Get one favorite
router.get("/:id", getOneFavorite);

// Add to favorites
router.post("/:id", addToFavorites);

// Remove from favorites
router.delete("/:id", removeFromFavorites);

// Clear all favorites
router.delete("/", clearAllFavorites);

export default router;