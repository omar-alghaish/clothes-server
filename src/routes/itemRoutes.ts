import { Router } from "express";
import { Item } from "../models/itemModel";
import { getAllItems, uploadItemImages, uploadItemImagesToCloudinary } from "../controllers/itemController";
import { createItem, resizeItemImages} from "../controllers/itemController";
import { updateItem } from "../controllers/itemController";
import { deleteItem } from "../controllers/itemController";
import { getOneItem } from "../controllers/itemController";
import { getNewArrivals } from "../controllers/itemController";
import { getFeaturedItems } from "../controllers/itemController";
import { searchItems } from "../controllers/itemController";

const multer  = require('multer')
import {protect, restrictTo, getSellerItems} from '../controllers/authController'

const router = Router();


const upload = multer({ dest: './../uploads' })

// seller endpoints
router.get("/my-items", protect, getSellerItems);
router.get("/search", searchItems);
router.get("/new-arrivals", getNewArrivals);
router.get("/featured", getFeaturedItems);

router.post(
    "/", 
    protect, 
    restrictTo('seller'), 
    uploadItemImages,
    resizeItemImages,
    uploadItemImagesToCloudinary,
    createItem
);

router.patch(
    "/:id", 
    protect, 
    uploadItemImages,
    resizeItemImages,
    uploadItemImagesToCloudinary,
    updateItem
);

router.delete("/:id", protect, deleteItem);

// public endpoints
router.get("/", getAllItems);
router.get("/:id", getOneItem);


export default router;
