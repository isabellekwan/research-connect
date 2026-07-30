import { Router } from "express";
import {
  bookTimeSlotHandler,
  checkEligibilityHandler,
  createStudyHandler,
  getCategories,
  getResearcherApplications,
  getStudy,
  listResearcherStudies,
  listAvailableTimeSlotsHandler,
  listStudies,
  reviewApplicationHandler,
  resumeUpload,
  submitApplicationHandler,
  uploadResumeHandler,
} from "../controllers/studies.controller.js";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, requireRole("researcher"), createStudyHandler);
router.get("/", isAuthenticated, requireRole("participant"), listStudies);
router.get("/categories", isAuthenticated, requireRole("participant"), getCategories);
router.get("/researcher",isAuthenticated,requireRole("researcher"),listResearcherStudies);  
router.get("/applications/researcher", isAuthenticated, requireRole("researcher"), getResearcherApplications);
router.patch("/applications/:applicationId", isAuthenticated, requireRole("researcher"), reviewApplicationHandler);
router.get("/:id", isAuthenticated, requireRole("participant"), getStudy);
router.get("/:id/time-slots", isAuthenticated, requireRole("participant"), listAvailableTimeSlotsHandler);
router.post("/:id/time-slots/:slotId/book", isAuthenticated, requireRole("participant"), bookTimeSlotHandler);
router.post("/:id/check-eligibility", isAuthenticated, requireRole("participant"), checkEligibilityHandler);
router.post("/:id/resume", isAuthenticated, requireRole("participant"), resumeUpload, uploadResumeHandler);
router.post("/:id/apply", isAuthenticated, requireRole("participant"), submitApplicationHandler);

export default router;
