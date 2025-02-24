import { Router } from "express";

import discountRoutes from "./discountRoutes";
// import other routes ...

const router = Router();

// Mount discount routes
router.use("/discounts", discountRoutes);
// Mount other routes...

export default router;
