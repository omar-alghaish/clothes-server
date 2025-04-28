import { Router } from "express";
import { protect } from "./../controllers/authController";
import { restrictTo } from "./../controllers/authController";
import { createAddress, getAddresses, updateAddress, deleteAddress } from "./../controllers/addressController";


const router = Router();

// All address routes require authentication
router.use(protect);

// Get all addresses and create new address
router.route("/")
  .get(getAddresses)
  .post(createAddress);

// update, delete specific address
router.route("/:id")
  .patch(updateAddress)
  .delete(deleteAddress);
export default router;
