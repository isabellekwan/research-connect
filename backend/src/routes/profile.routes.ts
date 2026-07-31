import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/profile.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user's profile and credit ledger
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile and ledger entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 ledgerEntries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LedgerEntry'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", isAuthenticated, getMyProfile);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Profile]
 *     summary: Update editable profile fields
 *     description: All fields are optional; only the ones present in the body are validated and updated. At least one must be provided.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_bio:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *               school_affiliation:
 *                 type: string
 *                 nullable: true
 *               phone_number:
 *                 type: string
 *                 nullable: true
 *                 description: 7-15 digits, optionally formatted with +, spaces, parentheses, dots, or dashes
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: A provided field failed validation, or no editable field was provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/me", isAuthenticated, updateMyProfile);

export default router;
