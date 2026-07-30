import type { CreateStudyPayload } from "../features/study_creator/types/types";
import type {
  ResearcherApplication,
  ScreeningQuestion,
  Study,
  StudyApplication,
  StudyFilterState,
  StudyListResponse,
  TimeSlot,
} from "../types";
import { API_BASE_URL, ApiError, apiRequest } from "./client";

function buildQuery(filters: StudyFilterState): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.isRemote !== null) params.set("remote", String(filters.isRemote));
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page));
  return params.toString();
}

export function fetchStudies(filters: StudyFilterState) {
  return apiRequest<StudyListResponse>(`/studies?${buildQuery(filters)}`);
}

export function fetchResearcherStudies() {
  return apiRequest<{ studies: Study[] }>(
    "/studies/researcher"
  );
}

export function createStudy(payload: CreateStudyPayload) {
  return apiRequest<{ study: Study; timeSlots: TimeSlot[] }>("/studies", {
    method: "POST",
    body: payload,
  });
}

export function fetchCategories() {
  return apiRequest<{ categories: string[] }>("/studies/categories");
}

export function fetchStudyDetail(studyId: string) {
  return apiRequest<{
    study: Study;
    screeningQuestions: ScreeningQuestion[];
    application: StudyApplication | null;
  }>(
    `/studies/${studyId}`
  );
}

export function checkStudyEligibility(
  studyId: string,
  screeningAnswers: { questionId: string; answer: boolean }[]
) {
  return apiRequest<{ application: StudyApplication }>(`/studies/${studyId}/check-eligibility`, {
    method: "POST",
    body: { screeningAnswers },
  });
}

export function submitStudyApplication(studyId: string) {
  return apiRequest<{ application: StudyApplication }>(`/studies/${studyId}/apply`, {
    method: "POST",
  });
}

export async function uploadStudyResume(studyId: string, resume: File) {
  const body = new FormData();
  body.append("resume", resume);
  const response = await fetch(`${API_BASE_URL}/studies/${studyId}/resume`, {
    method: "POST",
    credentials: "include",
    body,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, payload.error ?? "Résumé upload failed");
  }
  return response.json() as Promise<{ application: StudyApplication }>;
}

export function fetchAvailableTimeSlots(studyId: string) {
  return apiRequest<{ timeSlots: TimeSlot[] }>(`/studies/${studyId}/time-slots`);
}

export function bookTimeSlot(studyId: string, slotId: string) {
  return apiRequest(`/studies/${studyId}/time-slots/${slotId}/book`, {
    method: "POST",
  });
}

export function fetchResearcherApplications() {
  return apiRequest<{ applications: ResearcherApplication[] }>("/studies/applications/researcher");
}

export function reviewStudyApplication(
  applicationId: string,
  status: "accepted" | "rejected"
) {
  return apiRequest<{ application: ResearcherApplication }>(
    `/studies/applications/${applicationId}`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}
