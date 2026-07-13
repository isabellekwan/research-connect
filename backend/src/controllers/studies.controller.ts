import type { Request, Response } from "express";
import {
  applyToStudy,
  getScreeningQuestions,
  getStudyById,
  listDistinctCategories,
  listStudiesForParticipant,
  createStudy,
} from "../models/study.model.js";
import type { StudyFilters, User } from "../types/index.js";

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

  const study = await createStudy(user.id, {
    title,
    description,
    category,
    location: isRemote ? "Remote" : location || null,
    isRemote,
    compensation: compensation as number | null,
    status,
    screeningQuestions,
  });
  res.status(201).json({ study });
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

  const screeningQuestions = await getScreeningQuestions(study.id);
  res.json({ study, screeningQuestions });
}

/** POST /studies/:id/apply — body: { screeningAnswers: { questionId, answer }[] } */
export async function applyToStudyHandler(req: Request, res: Response) {
  const user = req.user as User;
  const studyId = req.params.id as string;
  const { screeningAnswers = [] } = req.body as {
    screeningAnswers?: { questionId: string; answer: boolean }[];
  };

  const study = await getStudyById(studyId);
  if (!study) return res.status(404).json({ error: "Study not found" });
  if (study.status !== "open") {
    return res.status(400).json({ error: "This study is not accepting applications" });
  }

  const application = await applyToStudy(studyId, user.id, screeningAnswers);
  res.status(201).json({ application });
}
