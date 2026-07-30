import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import multer from "multer";
import {
  bookTimeSlot,
  checkStudyEligibility,
  createStudy,
  getApplicationForParticipant,
  getAvailableTimeSlots,
  getScreeningQuestions,
  getStudyById,
  listCalendarForParticipant,
  listCalendarForResearcher,
  listDistinctCategories,
  listApplicationsForResearcher,
  listStudiesForParticipant,
  listStudiesForResearcher,
  recordStudyView,
  reviewStudyApplication,
  saveApplicationResume,
  submitEligibleApplication,
} from "../models/study.model.js";
import type { StudyFilters, User } from "../types/index.js";

const resumeBucketName = process.env.GCS_BUCKET_NAME;
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("resume");

/** POST /studies — creates a study owned by the logged-in researcher. */
export async function createStudyHandler(req: Request, res: Response) {
  const user = req.user as User;
  const body = req.body as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const isRemote = body.isRemote === true;
  const status = body.status === "draft" ? "draft" : body.status === "open" ? "open" : null;
  const compensation = body.compensation;
  const questions = Array.isArray(body.screeningQuestions) ? body.screeningQuestions : [];
  const slots = Array.isArray(body.timeSlots) ? body.timeSlots : [];

  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, description, and category are required" });
  }
  if (!status) return res.status(400).json({ error: "Status must be draft or open" });
  if (
    compensation !== null &&
    (typeof compensation !== "number" || !Number.isFinite(compensation) || compensation < 0)
  ) {
    return res.status(400).json({ error: "Compensation must be a non-negative number" });
  }
  if (questions.length > 20) {
    return res.status(400).json({ error: "A study can have at most 20 screening questions" });
  }
  if (slots.length === 0 || slots.length > 50) {
    return res.status(400).json({ error: "Add between 1 and 50 session times" });
  }

  const screeningQuestions: { questionText: string; qualifyingAnswer: boolean }[] = [];
  for (const item of questions) {
    if (!item || typeof item !== "object") {
      return res.status(400).json({ error: "Invalid screening question" });
    }
    const question = item as Record<string, unknown>;
    const questionText = typeof question.questionText === "string" ? question.questionText.trim() : "";
    if (!questionText || typeof question.qualifyingAnswer !== "boolean") {
      return res.status(400).json({ error: "Each screening question needs text and a qualifying answer" });
    }
    screeningQuestions.push({ questionText, qualifyingAnswer: question.qualifyingAnswer });
  }

  const timeSlots: { startTime: string; endTime: string; capacity: number }[] = [];
  for (const item of slots) {
    if (!item || typeof item !== "object") {
      return res.status(400).json({ error: "Invalid session time" });
    }
    const slot = item as Record<string, unknown>;
    const startTime = typeof slot.startTime === "string" ? slot.startTime : "";
    const endTime = typeof slot.endTime === "string" ? slot.endTime : "";
    const capacity = slot.capacity;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      !startTime ||
      !endTime ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({ error: "Each session needs a valid start and end time" });
    }
    if (start <= new Date()) {
      return res.status(400).json({ error: "Session times must be in the future" });
    }
    if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      return res.status(400).json({ error: "Session capacity must be between 1 and 500" });
    }

    timeSlots.push({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      capacity,
    });
  }

  const result = await createStudy(user.id, {
    title,
    description,
    category,
    location: isRemote ? "Remote" : location || null,
    isRemote,
    compensation: compensation as number | null,
    status,
    screeningQuestions,
    timeSlots,
  });
  res.status(201).json(result);
}

/** GET /studies?category=&remote=&search=&page=&pageSize= */
export async function listStudies(req: Request, res: Response) {
  const user = req.user as User;

  const filters: StudyFilters = {
    category: typeof req.query.category === "string" ? req.query.category : undefined,
    isRemote:
      req.query.remote === "true" ? true : req.query.remote === "false" ? false : undefined,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 12,
  };

  const result = await listStudiesForParticipant(user.id, filters);
  res.json(result);
}

/** GET /studies/categories — distinct categories for the filter UI */
export async function getCategories(_req: Request, res: Response) {
  const categories = await listDistinctCategories();
  res.json({ categories });
}

/** GET /studies/:id */
export async function getStudy(req: Request, res: Response) {
  const study = await getStudyById(req.params.id as string);
  if (!study) return res.status(404).json({ error: "Study not found" });

  const user = req.user as User;
  try {
    await recordStudyView(study.id, user.id);
  } catch (err) {
    console.error("Failed to record study view", err);
  }

  const screeningQuestions = await getScreeningQuestions(study.id);
  const application = await getApplicationForParticipant(study.id, user.id);
  res.json({ study, screeningQuestions, application });
}

/** POST /studies/:id/check-eligibility */
export async function checkEligibilityHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const { screeningAnswers = [] } = req.body as {
    screeningAnswers?: unknown;
  };

  const study = await getStudyById(studyId);
  if (!study) return res.status(404).json({ error: "Study not found" });
  if (study.status !== "open") {
    return res.status(400).json({ error: "This study is not accepting applications" });
  }

  const existingApplication = await getApplicationForParticipant(studyId, user.id);
  if (
    existingApplication &&
    ["pending", "accepted", "rejected", "withdrawn"].includes(existingApplication.status)
  ) {
    return res.status(409).json({ error: "This application can no longer be rescreened" });
  }

  if (!Array.isArray(screeningAnswers) || screeningAnswers.length > 20) {
    return res.status(400).json({ error: "Invalid screening answers" });
  }

  const answers: { questionId: string; answer: boolean }[] = [];
  for (const item of screeningAnswers) {
    if (!item || typeof item !== "object") {
      return res.status(400).json({ error: "Invalid screening answer" });
    }
    const answer = item as Record<string, unknown>;
    if (typeof answer.questionId !== "string" || typeof answer.answer !== "boolean") {
      return res.status(400).json({ error: "Each screening answer needs a question ID and answer" });
    }
    answers.push({ questionId: answer.questionId, answer: answer.answer });
  }

  const application = await checkStudyEligibility(studyId, user.id, answers);
  res.status(201).json({ application });
}

/** POST /studies/:id/apply — submits an eligible participant for review. */
export async function submitApplicationHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const study = await getStudyById(studyId);

  if (!study) return res.status(404).json({ error: "Study not found" });
  if (study.status !== "open") {
    return res.status(400).json({ error: "This study is not accepting applications" });
  }

  const application = await submitEligibleApplication(studyId, user.id);
  if (!application) {
    return res.status(409).json({ error: "Complete eligibility screening before applying" });
  }
  res.status(201).json({ application });
}

export async function listAvailableTimeSlotsHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const timeSlots = await getAvailableTimeSlots(studyId, user.id);
  const application = await getApplicationForParticipant(studyId, user.id);

  if (application?.status !== "accepted") {
    return res.status(403).json({ error: "Your application must be approved first" });
  }
  res.json({ timeSlots });
}

export async function bookTimeSlotHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const slotId = req.params.slotId as string;
  const result = await bookTimeSlot(studyId, slotId, user.id);

  if (result.error === "not_accepted") {
    return res.status(403).json({ error: "Your application must be approved first" });
  }
  if (result.error === "slot_not_found") {
    return res.status(404).json({ error: "Session not found or already started" });
  }
  if (result.error === "already_booked") {
    return res.status(409).json({ error: "You already booked a session for this study" });
  }
  if (result.error === "slot_full") {
    return res.status(409).json({ error: "This session is full" });
  }
  res.status(201).json({ booking: result.booking });
}

export async function uploadResumeHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const application = await getApplicationForParticipant(studyId, user.id);

  if (!application || application.status !== "eligible") {
    return res.status(409).json({ error: "Complete eligibility screening before uploading" });
  }
  if (!req.file || req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Choose a PDF résumé" });
  }
  if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    return res.status(400).json({ error: "The uploaded file is not a valid PDF" });
  }

  const objectName = `resumes/${studyId}/${user.id}/${randomUUID()}.pdf`;
  const uploadUrl =
    `https://storage.googleapis.com/upload/storage/v1/b/${resumeBucketName}/o` +
    `?uploadType=media&name=${encodeURIComponent(objectName)}`;
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Uint8Array(req.file.buffer),
  });
  if (!uploadResponse.ok) {
    const details = await uploadResponse.text();
    console.error("GCS résumé upload failed", uploadResponse.status, details);
    return res.status(502).json({ error: "Could not upload résumé" });
  }

  const encodedObjectName = objectName.split("/").map(encodeURIComponent).join("/");
  const resumeUrl = `https://storage.googleapis.com/${resumeBucketName}/${encodedObjectName}`;
  const updated = await saveApplicationResume(
    studyId,
    user.id,
    resumeUrl,
    req.file.originalname
  );
  res.status(201).json({ application: updated });
}

export async function getResearcherApplications(req: Request, res: Response) {
  const user = req.user as User;
  const applications = await listApplicationsForResearcher(user.id);
  res.json({ applications });
}

export async function reviewApplicationHandler(req: Request, res: Response) {
  const user = req.user as User;
  const applicationId = req.params.applicationId as string;
  const { status } = req.body as { status?: unknown };

  if (status !== "accepted" && status !== "rejected") {
    return res.status(400).json({ error: "Status must be accepted or rejected" });
  }

  const application = await reviewStudyApplication(applicationId, user.id, status);
  if (!application) {
    return res.status(404).json({ error: "Pending application not found" });
  }
  res.json({ application });
}

export async function listResearcherStudies(req: Request, res: Response){
  const user = req.user as User;
  const studies = await listStudiesForResearcher(user.id);

  res.json({ studies });
}

export async function getCalendar(req: Request, res: Response) {
  const user = req.user as User;
  const events =
    user.role === "researcher"
      ? await listCalendarForResearcher(user.id)
      : await listCalendarForParticipant(user.id);

  res.json({ events });
}
