import { Router } from "express";
import {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getStoreOwnersList,
} from "../controllers/adminController";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  validateBody,
  adminCreateUserSchema,
  createStoreSchema,
} from "../middlewares/validation";

const router = Router();

// All admin routes require ADMIN role
router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/dashboard-stats", getDashboardStats);
router.post("/users", validateBody(adminCreateUserSchema), createUser);
router.get("/users", getUsers);
router.post("/stores", validateBody(createStoreSchema), createStore);
router.get("/stores", getStores);
router.get("/store-owners", getStoreOwnersList);

export default router;
