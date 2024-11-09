import { Router } from "express";
import { item } from "../models/itemModel";
import { getAllItems } from "../controllers/itemController";
import { createItem } from "../controllers/itemController";
import { updateItem } from "../controllers/itemController";
import { deleteItem } from "../controllers/itemController";
const router = Router();

router.get("/", getAllItems);
router.post("/", createItem);

router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
