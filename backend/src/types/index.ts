export type UserRole = "researcher" | "participant";

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export type StudyStatus = "draft" | "open" | "closed" | "archived";

export interface Study {
  id: string;
  researcher_id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  is_remote: boolean;
  compensation: string | null;
  status: StudyStatus;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface StudyWithResearcher extends Study {
  researcher_name: string;
  application_status?: ApplicationStatus | null; // populated per-viewer when listing
  [key: string]: unknown;
}

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface StudyApplication {
  id: string;
  study_id: string;
  participant_id: string;
  status: ApplicationStatus;
  screening_answers: { questionId: string; answer: boolean }[];
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface ScreeningQuestion {
  id: string;
  study_id: string;
  question_text: string;
  qualifying_answer: boolean;
  order_index: number;
  [key: string]: unknown;
}

export interface StudyFilters {
  category?: string;
  isRemote?: boolean;
  search?: string;
  status?: StudyStatus;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface CreateStudyInput {
  title: string;
  description: string;
  category: string;
  location: string | null;
  isRemote: boolean;
  compensation: number | null;
  status: "draft" | "open";
  screeningQuestions: {
    questionText: string;
    qualifyingAnswer: boolean;
  }[];
}

// Augment express-session with the fields we actually store.
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
