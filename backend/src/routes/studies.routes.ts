import { Router } from "express";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";
import {
  applyToStudyHandler,
  getCategories,
  getStudy,
  listStudies,
  createStudyHandler,
} from "../controllers/studies.controller.js";

const router = Router();

router.post("/", isAuthenticated, requireRole("researcher"), createStudyHandler);
router.get("/", isAuthenticated, requireRole("participant"), listStudies);
router.get("/categories", isAuthenticated, requireRole("participant"), getCategories);
router.get("/:id", isAuthenticated, requireRole("participant"), getStudy);
router.post("/:id/apply", isAuthenticated, requireRole("participant"), applyToStudyHandler);

export default router;
