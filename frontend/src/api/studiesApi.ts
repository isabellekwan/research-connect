import { apiRequest } from "./client";
import type { ScreeningQuestion, Study, StudyFilterState, StudyListResponse } from "../types";
import type { CreateStudyPayload } from "../features/study_creator/types/types";

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

export function createStudy(payload: CreateStudyPayload) {
  return apiRequest<{ study: Study }>("/studies", {
    method: "POST",
    body: payload,
  });
}

export function fetchCategories() {
  return apiRequest<{ categories: string[] }>("/studies/categories");
}

export function fetchStudyDetail(studyId: string) {
  return apiRequest<{ study: Study; screeningQuestions: ScreeningQuestion[] }>(
    `/studies/${studyId}`
  );
}

export function applyToStudy(
  studyId: string,
  screeningAnswers: { questionId: string; answer: boolean }[]
) {
  return apiRequest(`/studies/${studyId}/apply`, {
    method: "POST",
    body: { screeningAnswers },
  });
}
