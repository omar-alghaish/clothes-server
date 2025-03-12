import { Router } from "express";
import { Item } from "../models/itemModel";
import { getAllItems } from "../controllers/itemController";
import { createItem } from "../controllers/itemController";
import { updateItem } from "../controllers/itemController";
import { deleteItem } from "../controllers/itemController";
import { getOneItem } from "../controllers/itemController";
const multer  = require('multer')
import {protect, restrictTo, getSellerItems} from '../controllers/authController'

const router = Router();


const upload = multer({ dest: './../uploads' })

// seller endpoints
router.get("/my-items", protect, getSellerItems);
router.post("/", protect, restrictTo('seller'), createItem);
router.patch("/:id", protect,  updateItem);
router.delete("/:id", protect, deleteItem);

// public endpoints
router.get("/", getAllItems);
router.get("/:id", getOneItem);


export default router;
