import { Router } from "express";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";
import {
  applyToStudyHandler,
  getCategories,
  getStudy,
  listStudies,
} from "../controllers/studies.controller.js";

const router = Router();

// All study-browsing routes require a logged-in participant.
router.use(isAuthenticated, requireRole("participant"));

router.get("/", listStudies);
router.get("/categories", getCategories);
router.get("/:id", getStudy);
router.post("/:id/apply", applyToStudyHandler);

export default router;