import { pool, query } from "../config/db.js";
import type {
  ApplicationStatus,
  AvailableTimeSlot,
  Booking,
  BookingInvite,
  CalendarEvent,
  CreateStudyInput,
  ResearcherApplication,
  ScreeningQuestion,
  Study,
  StudyApplication,
  StudyFilters,
  StudyWithResearcher,
  TimeSlot,
} from "../types/index.js";

interface ListResult {
  studies: StudyWithResearcher[];
  total: number;
}

interface CreatedStudyResult {
  study: Study;
  timeSlots: TimeSlot[];
}

export async function createStudy(
  researcherId: string,
  input: CreateStudyInput
): Promise<CreatedStudyResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<Study>(
      `INSERT INTO studies
        (researcher_id, title, description, category, location, is_remote, compensation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        researcherId,
        input.title,
        input.description,
        input.category,
        input.location,
        input.isRemote,
        input.compensation,
        input.status,
      ]
    );
    const study = rows[0];

    for (const [index, question] of input.screeningQuestions.entries()) {
      await client.query(
        `INSERT INTO screening_questions
          (study_id, question_text, qualifying_answer, order_index)
         VALUES ($1, $2, $3, $4)`,
        [study.id, question.questionText, question.qualifyingAnswer, index]
      );
    }

    const timeSlots: TimeSlot[] = [];
    for (const slot of input.timeSlots) {
      const { rows: slotRows } = await client.query<TimeSlot>(
        `INSERT INTO time_slots (study_id, start_time, end_time, capacity)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [study.id, slot.startTime, slot.endTime, slot.capacity]
      );
      timeSlots.push(slotRows[0]);
    }

    await client.query("COMMIT");
    return { study, timeSlots };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
        sa.status AS application_status,
        (
          SELECT b.status
          FROM bookings b
          JOIN time_slots booked_slot ON booked_slot.id = b.time_slot_id
          WHERE booked_slot.study_id = s.id
            AND b.participant_id = $${participantIdParamIndex}
            AND b.status <> 'cancelled'
          ORDER BY b.status = 'completed' DESC
          LIMIT 1
        ) AS booking_status
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

export async function getTimeSlotsForStudy(studyId: string): Promise<TimeSlot[]> {
  const { rows } = await query<TimeSlot>(
    `SELECT *
     FROM time_slots
     WHERE study_id = $1 AND end_time > now()
     ORDER BY start_time ASC`,
    [studyId]
  );
  return rows;
}

export async function getAvailableTimeSlots(
  studyId: string,
  participantId: string
): Promise<AvailableTimeSlot[]> {
  const { rows } = await query<AvailableTimeSlot>(
    `SELECT
       ts.*,
       COUNT(b.id) FILTER (WHERE b.status = 'confirmed')::int AS booked_count
     FROM time_slots ts
     LEFT JOIN bookings b ON b.time_slot_id = ts.id
     WHERE ts.study_id = $1
       AND ts.start_time > now()
       AND EXISTS (
         SELECT 1
         FROM study_applications sa
         WHERE sa.study_id = $1
           AND sa.participant_id = $2
           AND sa.status = 'accepted'
       )
     GROUP BY ts.id
     ORDER BY ts.start_time`,
    [studyId, participantId]
  );
  return rows;
}

interface BookingResult {
  booking?: Booking;
  invite?: BookingInvite;
  error?: "not_accepted" | "slot_not_found" | "already_booked" | "slot_full";
}

export async function bookTimeSlot(
  studyId: string,
  slotId: string,
  participantId: string
): Promise<BookingResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const application = await client.query(
      `SELECT id
       FROM study_applications
       WHERE study_id = $1 AND participant_id = $2 AND status = 'accepted'
       FOR UPDATE`,
      [studyId, participantId]
    );
    if (!application.rows[0]) {
      await client.query("ROLLBACK");
      return { error: "not_accepted" };
    }

    const slot = await client.query<{ id: string; capacity: number }>(
      `SELECT id, capacity
       FROM time_slots
       WHERE id = $1 AND study_id = $2 AND start_time > now()
       FOR UPDATE`,
      [slotId, studyId]
    );
    if (!slot.rows[0]) {
      await client.query("ROLLBACK");
      return { error: "slot_not_found" };
    }

    const existing = await client.query(
      `SELECT 1
       FROM bookings b
       JOIN time_slots ts ON ts.id = b.time_slot_id
       WHERE ts.study_id = $1
         AND b.participant_id = $2
         AND b.status <> 'cancelled'`,
      [studyId, participantId]
    );
    if (existing.rows[0]) {
      await client.query("ROLLBACK");
      return { error: "already_booked" };
    }

    const count = await client.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM bookings
       WHERE time_slot_id = $1 AND status = 'confirmed'`,
      [slotId]
    );
    if (count.rows[0].count >= slot.rows[0].capacity) {
      await client.query("ROLLBACK");
      return { error: "slot_full" };
    }

    const { rows } = await client.query<Booking>(
      `INSERT INTO bookings (time_slot_id, participant_id)
       VALUES ($1, $2)
       RETURNING *`,
      [slotId, participantId]
    );
    const { rows: inviteRows } = await client.query<BookingInvite>(
      `SELECT
         b.id AS booking_id,
         s.title AS study_title,
         ts.start_time,
         ts.end_time,
         s.location,
         participant.name AS participant_name,
         participant.email AS participant_email,
         researcher.name AS researcher_name,
         researcher.email AS researcher_email
       FROM bookings b
       JOIN time_slots ts ON ts.id = b.time_slot_id
       JOIN studies s ON s.id = ts.study_id
       JOIN users participant ON participant.id = b.participant_id
       JOIN users researcher ON researcher.id = s.researcher_id
       WHERE b.id = $1`,
      [rows[0].id]
    );
    await client.query("COMMIT");
    return { booking: rows[0], invite: inviteRows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Checks a participant's screening answers. Qualifying participants can
 * continue to the full application; this never accepts them into the study.
 */
export async function checkStudyEligibility(
  studyId: string,
  participantId: string,
  screeningAnswers: { questionId: string; answer: boolean }[]
): Promise<StudyApplication> {
  const questions = await getScreeningQuestions(studyId);
  const answerMap = new Map(screeningAnswers.map((answer) => [answer.questionId, answer.answer]));
  const allAnswered = questions.every((question) => answerMap.has(question.id));
  const allQualify =
    allAnswered &&
    questions.every((question) => answerMap.get(question.id) === question.qualifying_answer);
  const status: ApplicationStatus = allQualify ? "eligible" : "ineligible";

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

export async function getApplicationForParticipant(
  studyId: string,
  participantId: string
): Promise<StudyApplication | null> {
  const { rows } = await query<StudyApplication>(
    `SELECT *
     FROM study_applications
     WHERE study_id = $1 AND participant_id = $2`,
    [studyId, participantId]
  );
  return rows[0] ?? null;
}

export async function submitEligibleApplication(
  studyId: string,
  participantId: string
): Promise<StudyApplication | null> {
  const { rows } = await query<StudyApplication>(
    `UPDATE study_applications
     SET status = 'pending', updated_at = now()
     WHERE study_id = $1 AND participant_id = $2 AND status = 'eligible'
     RETURNING *`,
    [studyId, participantId]
  );
  return rows[0] ?? null;
}

export async function saveApplicationResume(
  studyId: string,
  participantId: string,
  resumeUrl: string,
  originalName: string
): Promise<StudyApplication | null> {
  const { rows } = await query<StudyApplication>(
    `UPDATE study_applications
     SET resume_url = $3, resume_original_name = $4, updated_at = now()
     WHERE study_id = $1 AND participant_id = $2 AND status = 'eligible'
     RETURNING *`,
    [studyId, participantId, resumeUrl, originalName]
  );
  return rows[0] ?? null;
}

export async function listApplicationsForResearcher(
  researcherId: string
): Promise<ResearcherApplication[]> {
  const { rows } = await query<ResearcherApplication>(
    `SELECT
       sa.*,
       s.title AS study_title,
       participant.name AS participant_name,
       participant.email AS participant_email,
       booked_slot.start_time AS booking_start_time,
       booked_slot.end_time AS booking_end_time
     FROM study_applications sa
     JOIN studies s ON s.id = sa.study_id
     JOIN users participant ON participant.id = sa.participant_id
     LEFT JOIN bookings booked
       ON booked.participant_id = sa.participant_id
       AND booked.status = 'confirmed'
     LEFT JOIN time_slots booked_slot
       ON booked_slot.id = booked.time_slot_id
       AND booked_slot.study_id = sa.study_id
     WHERE s.researcher_id = $1
       AND sa.status IN ('pending', 'accepted', 'rejected')
     ORDER BY
       CASE WHEN sa.status = 'pending' THEN 0 ELSE 1 END,
       sa.updated_at DESC`,
    [researcherId]
  );
  return rows;
}

export async function reviewStudyApplication(
  applicationId: string,
  researcherId: string,
  status: "accepted" | "rejected"
): Promise<ResearcherApplication | null> {
  const { rows } = await query<ResearcherApplication>(
    `UPDATE study_applications sa
     SET status = $3, updated_at = now()
     FROM studies s, users participant
     WHERE sa.id = $1
       AND s.id = sa.study_id
       AND s.researcher_id = $2
       AND participant.id = sa.participant_id
       AND sa.status = 'pending'
     RETURNING
       sa.*,
       s.title AS study_title,
       participant.name AS participant_name,
       participant.email AS participant_email,
       NULL::timestamptz AS booking_start_time,
       NULL::timestamptz AS booking_end_time`,
    [applicationId, researcherId, status]
  );
  return rows[0] ?? null;
}

export async function completeBooking(bookingId: string, researcherId: string) {
  const { rows } = await query<{ status: Booking["status"] }>(
    `WITH target AS (
       SELECT b.id, b.participant_id, b.status, s.title,
              COALESCE(s.compensation, 0) AS compensation
       FROM bookings b
       JOIN time_slots ts ON ts.id = b.time_slot_id
       JOIN studies s ON s.id = ts.study_id
       WHERE b.id = $1 AND s.researcher_id = $2
     ),
     completed AS (
       UPDATE bookings b SET status = 'completed'
       FROM target t
       WHERE b.id = t.id AND b.status = 'confirmed'
     ),
     credited AS (
       INSERT INTO ledger_entries (user_id, booking_id, type, amount, description)
       SELECT participant_id, id, 'credit', compensation, 'Completed ' || title
       FROM target
       WHERE status IN ('confirmed', 'completed')
       ON CONFLICT (booking_id) DO NOTHING
     )
     SELECT status FROM target`,
    [bookingId, researcherId]
  );
  return rows[0]?.status ?? null;
}

/**
 * Records that a participant viewed a study's detail page. Deduped per study/participant/day 
 * at the DB level, so repeated visits the same day don't inflate the count.
 */
export async function recordStudyView(studyId: string, viewerId: string): Promise<void> {
  await query(
    `INSERT INTO study_views (study_id, viewer_id)
     VALUES ($1, $2)
     ON CONFLICT (study_id, viewer_id, view_date) DO NOTHING`,
    [studyId, viewerId]
  );
}

export async function listStudiesForResearcher(
  researcher_id:string
){
  const { rows } = await query<Study>(
    `SELECT *
     FROM studies
     WHERE researcher_id = $1
     ORDER BY created_at DESC`,
    [researcher_id]
  );

  return rows;
}

export async function listCalendarForParticipant(
  participantId: string
): Promise<CalendarEvent[]> {
  const { rows } = await query<CalendarEvent>(
    `SELECT
       ts.id AS time_slot_id,
       s.id AS study_id,
       s.title AS study_title,
       ts.start_time,
       ts.end_time,
       s.location,
       s.is_remote,
       b.status AS booking_status,
       ts.capacity,
       1 AS booked_count,
       '[]'::json AS bookings
     FROM bookings b
     JOIN time_slots ts ON ts.id = b.time_slot_id
     JOIN studies s ON s.id = ts.study_id
     WHERE b.participant_id = $1
       AND b.status <> 'cancelled'
     ORDER BY ts.start_time`,
    [participantId]
  );
  return rows;
}

export async function listCalendarForResearcher(
  researcherId: string
): Promise<CalendarEvent[]> {
  const { rows } = await query<CalendarEvent>(
    `SELECT
       ts.id AS time_slot_id,
       s.id AS study_id,
       s.title AS study_title,
       ts.start_time,
       ts.end_time,
       s.location,
       s.is_remote,
       ts.capacity,
       COUNT(b.id) FILTER (WHERE b.status <> 'cancelled')::int AS booked_count,
       COALESCE(
         json_agg(
           json_build_object(
             'participant_id', participant.id,
             'booking_id', b.id,
             'participant_name', participant.name,
             'participant_email', participant.email,
             'status', b.status
           )
           ORDER BY participant.name
         ) FILTER (WHERE b.id IS NOT NULL AND b.status <> 'cancelled'),
         '[]'::json
       ) AS bookings
     FROM time_slots ts
     JOIN studies s ON s.id = ts.study_id
     LEFT JOIN bookings b ON b.time_slot_id = ts.id
     LEFT JOIN users participant ON participant.id = b.participant_id
     WHERE s.researcher_id = $1
     GROUP BY ts.id, s.id
     ORDER BY ts.start_time`,
    [researcherId]
  );
  return rows;
}
