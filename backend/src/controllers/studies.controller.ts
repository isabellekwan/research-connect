import type { Request, Response } from "express";
import {
  applyToStudy,
  getScreeningQuestions,
  getStudyById,
  listDistinctCategories,
  listStudiesForParticipant,
} from "../models/study.model.js";
import type { StudyFilters, User } from "../types/index.js";

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