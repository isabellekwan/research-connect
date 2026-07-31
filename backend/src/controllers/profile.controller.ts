import type { Request, Response } from "express";
import {
    getLedgerEntries,
    getUserProfile,
    updateUserProfile
} from "../models/profile.model.js";
import type { UpdateProfileInput } from "../types/index.js";

export async function getMyProfile(
  req: Request,
  res: Response
) {
  const [profile, ledgerEntries] = await Promise.all([
    getUserProfile(req.user!.id),
    getLedgerEntries(req.user!.id),
  ]);

  if (!profile) {
    return res.status(404).json({
      error: "User profile not found",
    });
  }

  return res.json({ user: profile, ledgerEntries });
}

export async function updateMyProfile(
  req: Request,
  res: Response
) {
  const body = req.body as Record<string, unknown>;
  const input: UpdateProfileInput = {};

  if ("profile_bio" in body) {
    const value = body.profile_bio;

    if (value !== null && typeof value !=="string"){
        return res.status(400).json({
            error: "Biography must be text or null",
        });
    }

    if(value && value.length > 1000){
        return res.status(400).json({
            error: "Biography cannot exceed 1000 characters",
        });
    }
    input.profile_bio = value?.trim() || null;
  }

  if ("school_affiliation" in body) {
    const value = body.school_affiliation;

    if (value !== null && typeof value !=="string"){
        return res.status(400).json({
        error: "School affiliation must be text or null",
      });
    }

    input.school_affiliation = value?.trim() || null;
  }

  if ("phone_number" in body) {
    const value = body.phone_number;

    if (value !== null && typeof value !== "string") {
      return res.status(400).json({
        error: "Phone number must be text or null",
      });
    }
    const trimmedPhoneNumber = value?.trim() || null;

    if(trimmedPhoneNumber){
        const allowedChars = /^\+?[0-9\s().-]+$/;
        const digitCount = trimmedPhoneNumber.replace(/\D/g, "").length;

        if(!allowedChars.test(trimmedPhoneNumber) || 
        digitCount < 7 || 
        digitCount > 15){
            return res.status(400).json({
                error:"Enter a valid phone number containing 7 to 15 digits",
            });
        }
    }

    input.phone_number = trimmedPhoneNumber;
  }

  if (Object.keys(input).length === 0) {
    return res.status(400).json({
      error: "No editable profile field was provided",
    });
  }

  const profile = await updateUserProfile(
    req.user!.id,
    input
  );

  if (!profile) {
    return res.status(404).json({
      error: "User profile not found",
    });
  }

  return res.json({ user: profile });
}
