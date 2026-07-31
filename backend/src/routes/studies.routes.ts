import { Router } from "express";
import {
  bookTimeSlotHandler,
  checkEligibilityHandler,
  completeBookingHandler,
  createStudyHandler,
  getCalendar,
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

/**
 * @openapi
 * /studies:
 *   post:
 *     tags: [Studies]
 *     summary: Create a study (researcher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, status, timeSlots]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               location: { type: string, nullable: true }
 *               isRemote: { type: boolean }
 *               compensation: { type: number, nullable: true }
 *               status: { type: string, enum: [draft, open] }
 *               screeningQuestions:
 *                 type: array
 *                 maxItems: 20
 *                 items:
 *                   type: object
 *                   required: [questionText, qualifyingAnswer]
 *                   properties:
 *                     questionText: { type: string }
 *                     qualifyingAnswer: { type: boolean }
 *               timeSlots:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 description: Bookable session times; each must be in the future.
 *                 items:
 *                   type: object
 *                   required: [startTime, endTime, capacity]
 *                   properties:
 *                     startTime: { type: string, format: date-time }
 *                     endTime: { type: string, format: date-time }
 *                     capacity: { type: integer, minimum: 1, maximum: 500 }
 *     responses:
 *       201:
 *         description: Study created, along with its bookable time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 study:
 *                   $ref: '#/components/schemas/Study'
 *                 timeSlots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Requires researcher role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", isAuthenticated, requireRole("researcher"), createStudyHandler);

/**
 * @openapi
 * /studies:
 *   get:
 *     tags: [Studies]
 *     summary: List open studies (participant only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: remote
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Paginated list of open studies, annotated with the caller's application status where applicable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Study'
 *                 total:
 *                   type: integer
 *       403:
 *         description: Requires participant role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", isAuthenticated, requireRole("participant"), listStudies);

/**
 * @openapi
 * /studies/categories:
 *   get:
 *     tags: [Studies]
 *     summary: List distinct categories among open studies (participant only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Distinct category names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items: { type: string }
 */
router.get("/categories", isAuthenticated, requireRole("participant"), getCategories);

/**
 * @openapi
 * /studies/calendar:
 *   get:
 *     tags: [Studies]
 *     summary: List upcoming calendar events for the current user
 *     description: Returns booked sessions for a participant, or sessions across all of a researcher's studies (with attendee info) for a researcher.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Calendar events, one per bookable time slot relevant to the caller
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CalendarEvent'
 */
router.get("/calendar", isAuthenticated, getCalendar);

/**
 * @openapi
 * /studies/researcher:
 *   get:
 *     tags: [Studies]
 *     summary: List studies owned by the current researcher
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The researcher's own studies, most recent first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Study'
 *       403:
 *         description: Requires researcher role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/researcher", isAuthenticated, requireRole("researcher"), listResearcherStudies);

/**
 * @openapi
 * /studies/applications/researcher:
 *   get:
 *     tags: [Studies]
 *     summary: List all applications across the researcher's studies
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Applications with study title and applicant/booking info attached
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ResearcherApplication'
 *       403:
 *         description: Requires researcher role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/applications/researcher", isAuthenticated, requireRole("researcher"), getResearcherApplications);

/**
 * @openapi
 * /studies/applications/{applicationId}:
 *   patch:
 *     tags: [Studies]
 *     summary: Accept or reject a pending application (researcher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [accepted, rejected] }
 *     responses:
 *       200:
 *         description: Application updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   $ref: '#/components/schemas/StudyApplication'
 *       400:
 *         description: Status must be accepted or rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No pending application found with that ID owned by this researcher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/applications/:applicationId", isAuthenticated, requireRole("researcher"), reviewApplicationHandler);

/**
 * @openapi
 * /studies/bookings/{bookingId}/complete:
 *   patch:
 *     tags: [Studies]
 *     summary: Mark a booked session as completed (researcher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking marked completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, enum: [completed] }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Booking is cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/bookings/:bookingId/complete", isAuthenticated, requireRole("researcher"), completeBookingHandler);

/**
 * @openapi
 * /studies/{id}:
 *   get:
 *     tags: [Studies]
 *     summary: Get a study's details, screening questions, and the caller's own application (participant only)
 *     description: Also records a deduped "view" event for analytics (one per participant/study/day).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The study, its screening questions, and the caller's application (if any)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 study:
 *                   $ref: '#/components/schemas/Study'
 *                 screeningQuestions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScreeningQuestion'
 *                 application:
 *                   allOf:
 *                     - $ref: '#/components/schemas/StudyApplication'
 *                   nullable: true
 *       404:
 *         description: Study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", isAuthenticated, requireRole("participant"), getStudy);

/**
 * @openapi
 * /studies/{id}/time-slots:
 *   get:
 *     tags: [Studies]
 *     summary: List bookable time slots for a study (accepted applicants only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Available time slots with current booked counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeSlots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AvailableTimeSlot'
 *       403:
 *         description: The caller's application must be accepted first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/time-slots", isAuthenticated, requireRole("participant"), listAvailableTimeSlotsHandler);

/**
 * @openapi
 * /studies/{id}/time-slots/{slotId}/book:
 *   post:
 *     tags: [Studies]
 *     summary: Book a time slot (accepted applicants only)
 *     description: On success, a confirmation email is sent to the participant asynchronously (failures are logged, not returned to the caller).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Booking confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       403:
 *         description: The caller's application must be accepted first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found or already started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Already booked a session for this study, or the session is full
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/time-slots/:slotId/book", isAuthenticated, requireRole("participant"), bookTimeSlotHandler);

/**
 * @openapi
 * /studies/{id}/check-eligibility:
 *   post:
 *     tags: [Studies]
 *     summary: Submit screening answers to check eligibility (participant only)
 *     description: Answers are graded against each question's qualifying answer; the resulting application is created with status "eligible" or "ineligible". Cannot be resubmitted once an application has moved past screening (pending/accepted/rejected/withdrawn).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screeningAnswers:
 *                 type: array
 *                 maxItems: 20
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: string, format: uuid }
 *                     answer: { type: boolean }
 *     responses:
 *       201:
 *         description: Eligibility result recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   $ref: '#/components/schemas/StudyApplication'
 *       400:
 *         description: Study is not accepting applications, or screening answers are invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: This application can no longer be rescreened
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/check-eligibility", isAuthenticated, requireRole("participant"), checkEligibilityHandler);

/**
 * @openapi
 * /studies/{id}/resume:
 *   post:
 *     tags: [Studies]
 *     summary: Upload a résumé for an eligible application (participant only)
 *     description: Requires the application to be in "eligible" status. The file must be a real PDF (validated by content, not just extension) and is stored in Google Cloud Storage.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [resume]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF file, up to 10MB
 *     responses:
 *       201:
 *         description: Résumé attached to the application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   $ref: '#/components/schemas/StudyApplication'
 *       400:
 *         description: Missing file, or not a valid PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Complete eligibility screening before uploading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       502:
 *         description: Cloud storage upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/resume", isAuthenticated, requireRole("participant"), resumeUpload, uploadResumeHandler);

/**
 * @openapi
 * /studies/{id}/apply:
 *   post:
 *     tags: [Studies]
 *     summary: Submit an eligible application for researcher review (participant only)
 *     description: Requires the caller to already have an "eligible" application from /check-eligibility. Moves the application to "pending".
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Application submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   $ref: '#/components/schemas/StudyApplication'
 *       400:
 *         description: Study is not currently accepting applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Complete eligibility screening before applying
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/apply", isAuthenticated, requireRole("participant"), submitApplicationHandler);

export default router;
