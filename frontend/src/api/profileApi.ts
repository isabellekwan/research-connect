import type {
    UpdateProfileInput,
    LedgerEntry,
    UserProfile,
} from "../types";
import { apiRequest } from "./client";

export function getMyProfile() {
  return apiRequest<{ user: UserProfile; ledgerEntries: LedgerEntry[] }>("/users/me");
}

export function updateMyProfile(input: UpdateProfileInput){
    return apiRequest<{user: UserProfile}>("/users/me",{
        method: "PATCH",
        body: input,
    });
}
