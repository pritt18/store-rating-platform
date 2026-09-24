import { Router } from "express";
import {
  getAllStores,
  rateStore,
  getOwnerDashboard,
} from "../controllers/storeController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody, ratingSchema } from "../middlewares/validation";

const router = Router();

// Store Owner dashboard (requires STORE_OWNER role)
router.get("/owner/dashboard", requireAuth, requireRole(["STORE_OWNER"]), getOwnerDashboard);

// Normal User & public/authenticated store listings
// If authenticated, returns user's submitted rating
router.get("/", requireAuth, getAllStores);

// Normal User submits/modifies rating for a store
router.post("/:storeId/rate", requireAuth, requireRole(["USER", "ADMIN"]), validateBody(ratingSchema), rateStore);

export default router;
