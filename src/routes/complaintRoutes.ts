import { Router } from "express";
import { submitComplaint } from "../controllers/complaintController";

const router = Router();

// Public route - anyone can submit a complaint
router.post("/", submitComplaint);


export default router;