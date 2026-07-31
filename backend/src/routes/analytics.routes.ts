import { Router } from "express";
import { getEnrollments, getOverview, getViews } from "../controllers/analytics.controller.js";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * components:
 *   parameters:
 *     studyIdFilter:
 *       in: query
 *       name: studyId
 *       schema: { type: string, format: uuid }
 *       description: Scope to one of the researcher's own studies. Omit to aggregate across all of their studies.
 *     tzParam:
 *       in: query
 *       name: tz
 *       schema: { type: string, example: "America/New_York" }
 *       description: IANA timezone used to compute "today"/day boundaries. Falls back to UTC if omitted or invalid.
 */

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Aggregate recruitment metrics for the current researcher
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/studyIdFilter'
 *       - $ref: '#/components/parameters/tzParam'
 *     responses:
 *       200:
 *         description: Studies posted, total/today views, and total/today sign-ups
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsOverview'
 *       403:
 *         description: Requires researcher role, or the studyId doesn't belong to this researcher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: studyId not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/overview", isAuthenticated, requireRole("researcher"), getOverview);

/**
 * @openapi
 * /analytics/views:
 *   get:
 *     tags: [Analytics]
 *     summary: Views per day for the last 7 days (zero-filled)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/studyIdFilter'
 *       - $ref: '#/components/parameters/tzParam'
 *     responses:
 *       200:
 *         description: One entry per day, oldest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ViewStat'
 *       403:
 *         description: Requires researcher role, or the studyId doesn't belong to this researcher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: studyId not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/views", isAuthenticated, requireRole("researcher"), getViews);

/**
 * @openapi
 * /analytics/enrollments:
 *   get:
 *     tags: [Analytics]
 *     summary: Application counts grouped by status
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/studyIdFilter'
 *     responses:
 *       200:
 *         description: One entry per status that has at least one application
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EnrollmentStat'
 *       403:
 *         description: Requires researcher role, or the studyId doesn't belong to this researcher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: studyId not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/enrollments", isAuthenticated, requireRole("researcher"), getEnrollments);

export default router;
