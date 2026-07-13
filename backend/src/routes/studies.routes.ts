import { Router } from "express";
import {
  applyToStudyHandler,
  createStudyHandler,
  getCategories,
  getStudy,
  listResearcherStudies,
  listStudies,
} from "../controllers/studies.controller.js";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, requireRole("researcher"), createStudyHandler);
router.get("/", isAuthenticated, requireRole("participant"), listStudies);
router.get("/categories", isAuthenticated, requireRole("participant"), getCategories);
router.get("/researcher",isAuthenticated,requireRole("researcher"),listResearcherStudies);  
router.get("/:id", isAuthenticated, requireRole("participant"), getStudy);
router.post("/:id/apply", isAuthenticated, requireRole("participant"), applyToStudyHandler);

export default router;
