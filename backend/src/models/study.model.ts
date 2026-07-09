import { query } from "../config/db.js";
import type {
  ApplicationStatus,
  ScreeningQuestion,
  StudyApplication,
  StudyFilters,
  StudyWithResearcher,
} from "../types/index.js";

interface ListResult {
  studies: StudyWithResearcher[];
  total: number;
}

/**
 * Lists open studies with optional category/remote/search filtering,
 * paginated, and annotated with the viewing participant's application
 * status (if any) so the UI can show "Applied" vs "Apply".
 */
export async function listStudiesForParticipant(
  participantId: string,
  filters: StudyFilters
): Promise<ListResult> {
  const {
    category,
    isRemote,
    search,
    status = "open",
    page = 1,
    pageSize = 12,
  } = filters;

  const conditions: string[] = [`s.status = $1`];
  const params: unknown[] = [status];

  if (category) {
    params.push(category);
    conditions.push(`s.category = $${params.length}`);
  }
  if (typeof isRemote === "boolean") {
    params.push(isRemote);
    conditions.push(`s.is_remote = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(s.title ILIKE $${params.length} OR s.description ILIKE $${params.length})`);
  }

  const whereClause = conditions.join(" AND ");
  const offset = (page - 1) * pageSize;

  params.push(participantId);
  const participantIdParamIndex = params.length;

  params.push(pageSize);
  const limitParamIndex = params.length;

  params.push(offset);
  const offsetParamIndex = params.length;

  const { rows } = await query<StudyWithResearcher>(
    `SELECT
        s.*,
        u.name AS researcher_name,
        sa.status AS application_status
     FROM studies s
     JOIN users u ON u.id = s.researcher_id
     LEFT JOIN study_applications sa
        ON sa.study_id = s.id AND sa.participant_id = $${participantIdParamIndex}
     WHERE ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
    params
  );

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM studies s WHERE ${whereClause}`,
    params.slice(0, conditions.length) // reuse only the WHERE params, not pagination/participant
  );

  return { studies: rows, total: Number(countRows[0]?.count ?? 0) };
}

export async function getStudyById(studyId: string): Promise<StudyWithResearcher | null> {
  const { rows } = await query<StudyWithResearcher>(
    `SELECT s.*, u.name AS researcher_name
     FROM studies s
     JOIN users u ON u.id = s.researcher_id
     WHERE s.id = $1`,
    [studyId]
  );
  return rows[0] ?? null;
}

export async function listDistinctCategories(): Promise<string[]> {
  const { rows } = await query<{ category: string }>(
    `SELECT DISTINCT category FROM studies WHERE status = 'open' ORDER BY category`
  );
  return rows.map((r) => r.category);
}

export async function getScreeningQuestions(studyId: string): Promise<ScreeningQuestion[]> {
  const { rows } = await query<ScreeningQuestion>(
    `SELECT * FROM screening_questions WHERE study_id = $1 ORDER BY order_index ASC`,
    [studyId]
  );
  return rows;
}

/**
 * Registers (applies) a participant to a study. Screening answers are
 * checked against each question's qualifying_answer; if every answer
 * qualifies, the application is auto-accepted, otherwise auto-rejected.
 * Researchers can still override status later via a review endpoint.
 */
export async function applyToStudy(
  studyId: string,
  participantId: string,
  screeningAnswers: { questionId: string; answer: boolean }[]
): Promise<StudyApplication> {
  const questions = await getScreeningQuestions(studyId);

  let status: ApplicationStatus = "pending";
  if (questions.length > 0) {
    const answerMap = new Map(screeningAnswers.map((a) => [a.questionId, a.answer]));
    const allQualify = questions.every((q) => answerMap.get(q.id) === q.qualifying_answer);
    status = allQualify ? "accepted" : "rejected";
  }

  const { rows } = await query<StudyApplication>(
    `INSERT INTO study_applications (study_id, participant_id, status, screening_answers)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (study_id, participant_id)
     DO UPDATE SET status = EXCLUDED.status, screening_answers = EXCLUDED.screening_answers, updated_at = now()
     RETURNING *`,
    [studyId, participantId, status, JSON.stringify(screeningAnswers)]
  );
  return rows[0];
}