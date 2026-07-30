import type { Request, Response } from "express";
import {
  getEnrollmentBreakdown,
  getOverviewStats,
  getViewsTimeSeries,
} from "../models/analytics.model.js";
import { getStudyById } from "../models/study.model.js";
import type { User } from "../types/index.js";

const VALID_TIMEZONES = new Set(Intl.supportedValuesOf("timeZone"));

/** Reads `?tz=` (an IANA zone name, e.g. "America/New_York") sent by the browser, falling back to UTC. */
function resolveTimezone(req: Request): string {
  const raw = req.query.tz;
  return typeof raw === "string" && VALID_TIMEZONES.has(raw) ? raw : "UTC";
}

/**
 * Resolves the `?studyId=` query param for the current researcher, verifying
 * ownership. Returns `{ studyId: null }` when the param is absent (meaning
 * "aggregate across all of this researcher's studies"), or `{ error }` when
 * the study doesn't exist or belongs to someone else.
 */
async function resolveScopedStudyId(
  req: Request
): Promise<{ studyId: string | null } | { error: { status: number; message: string } }> {
  const raw = req.query.studyId;
  if (typeof raw !== "string" || raw.length === 0) {
    return { studyId: null };
  }

  const user = req.user as User;
  const study = await getStudyById(raw);
  if (!study) {
    return { error: { status: 404, message: "Study not found" } };
  }
  if (study.researcher_id !== user.id) {
    return { error: { status: 403, message: "You do not own this study" } };
  }
  return { studyId: raw };
}

/** GET /analytics/overview?studyId=&tz= */
export async function getOverview(req: Request, res: Response) {
  const user = req.user as User;
  const scoped = await resolveScopedStudyId(req);
  if ("error" in scoped) return res.status(scoped.error.status).json({ error: scoped.error.message });

  const overview = await getOverviewStats(user.id, scoped.studyId, resolveTimezone(req));
  res.json(overview);
}

/** GET /analytics/views?studyId=&tz= */
export async function getViews(req: Request, res: Response) {
  const user = req.user as User;
  const scoped = await resolveScopedStudyId(req);
  if ("error" in scoped) return res.status(scoped.error.status).json({ error: scoped.error.message });

  const views = await getViewsTimeSeries(user.id, scoped.studyId, resolveTimezone(req));
  res.json(views);
}

/** GET /analytics/enrollments?studyId= */
export async function getEnrollments(req: Request, res: Response) {
  const user = req.user as User;
  const scoped = await resolveScopedStudyId(req);
  if ("error" in scoped) return res.status(scoped.error.status).json({ error: scoped.error.message });

  const enrollments = await getEnrollmentBreakdown(user.id, scoped.studyId);
  res.json(enrollments);
}
