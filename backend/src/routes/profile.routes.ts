import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/profile.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", isAuthenticated, getMyProfile);
router.patch("/me", isAuthenticated, updateMyProfile);

export default router;