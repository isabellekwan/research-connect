import { query } from "../config/db.js";
import type { AnalyticsOverview, EnrollmentStat, ViewStat } from "../types/index.js";

/**
 * Aggregate recruitment metrics for a researcher, optionally scoped to one of their studies. 
 * Passing studyId as null aggregates across all studies owned by the researcher.
 */
export async function getOverviewStats(
  researcherId: string,
  studyId: string | null,
  timezone: string
): Promise<AnalyticsOverview> {
  const { rows } = await query<{
    studies_posted: string;
    total_views: string;
    views_today: string;
    total_signups: string;
    signups_today: string;
  }>(
    `SELECT
        (SELECT COUNT(*) FROM studies s
          WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)) AS studies_posted,
        (SELECT COUNT(*) FROM study_views v JOIN studies s ON s.id = v.study_id
          WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)) AS total_views,
        (SELECT COUNT(*) FROM study_views v JOIN studies s ON s.id = v.study_id
          WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)
            AND (v.created_at AT TIME ZONE $3)::date = (now() AT TIME ZONE $3)::date) AS views_today,
        (SELECT COUNT(*) FROM study_applications a JOIN studies s ON s.id = a.study_id
          WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)) AS total_signups,
        (SELECT COUNT(*) FROM study_applications a JOIN studies s ON s.id = a.study_id
          WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)
            AND (a.created_at AT TIME ZONE $3)::date = (now() AT TIME ZONE $3)::date) AS signups_today`,
    [researcherId, studyId, timezone]
  );

  const row = rows[0];
  return {
    studiesPosted: Number(row?.studies_posted ?? 0),
    totalViews: Number(row?.total_views ?? 0),
    viewsToday: Number(row?.views_today ?? 0),
    totalSignups: Number(row?.total_signups ?? 0),
    signupsToday: Number(row?.signups_today ?? 0),
  };
}

/** Views per day for the last 7 days (zero-filled), scoped to the researcher's studies. */
export async function getViewsTimeSeries(
  researcherId: string,
  studyId: string | null,
  timezone: string
): Promise<ViewStat[]> {
  const { rows } = await query<{ day: string; views: string }>(
    `SELECT to_char(d.day, 'Dy') AS day, COALESCE(COUNT(v.id), 0)::int AS views
     FROM generate_series(
            (now() AT TIME ZONE $3)::date - INTERVAL '6 days',
            (now() AT TIME ZONE $3)::date,
            INTERVAL '1 day'
          ) AS d(day)
     LEFT JOIN study_views v
        ON (v.created_at AT TIME ZONE $3)::date = d.day::date
       AND v.study_id IN (
             SELECT id FROM studies
             WHERE researcher_id = $1 AND ($2::uuid IS NULL OR id = $2::uuid)
           )
     GROUP BY d.day
     ORDER BY d.day`,
    [researcherId, studyId, timezone]
  );

  return rows.map((r) => ({ day: r.day, views: Number(r.views) }));
}

/** Application counts grouped by status, scoped to the researcher's studies. */
export async function getEnrollmentBreakdown(
  researcherId: string,
  studyId: string | null
): Promise<EnrollmentStat[]> {
  const { rows } = await query<{ status: EnrollmentStat["status"]; count: string }>(
    `SELECT a.status, COUNT(*)::int AS count
     FROM study_applications a
     JOIN studies s ON s.id = a.study_id
     WHERE s.researcher_id = $1 AND ($2::uuid IS NULL OR s.id = $2::uuid)
     GROUP BY a.status`,
    [researcherId, studyId]
  );

  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}
