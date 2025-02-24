import { Router } from "express";
import {
  createDiscount,
  getDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
} from "../controllers/discountController";

const router = Router();

// Create a new discount coupon
router.post("/", createDiscount);

// Get a coupon by its code
router.get("/:code", getDiscount);

// Update a coupon by its code
router.put("/:code", updateDiscount);

// Delete a coupon by its code
router.delete("/:code", deleteDiscount);

// Apply a coupon (e.g., during checkout)
router.post("/apply", applyDiscount);

export default router;
