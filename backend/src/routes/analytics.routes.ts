import { Router } from "express";
import { getEnrollments, getOverview, getViews } from "../controllers/analytics.controller.js";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/overview", isAuthenticated, requireRole("researcher"), getOverview);
router.get("/views", isAuthenticated, requireRole("researcher"), getViews);
router.get("/enrollments", isAuthenticated, requireRole("researcher"), getEnrollments);

export default router;
