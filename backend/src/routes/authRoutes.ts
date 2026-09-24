import { Router } from "express";
import { register, login, getMe, changePassword } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth";
import { validateBody, registerSchema, loginSchema, changePasswordSchema } from "../middlewares/validation";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", requireAuth, getMe);
router.put("/change-password", requireAuth, validateBody(changePasswordSchema), changePassword);

export default router;
