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
  compensation: string | null; // numeric comes back as string from pg
  status: StudyStatus;
  created_at: string;
  updated_at: string;
}

export interface StudyWithResearcher extends Study {
  researcher_name: string;
  application_status?: ApplicationStatus | null; // populated per-viewer when listing
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
}

export interface ScreeningQuestion {
  id: string;
  study_id: string;
  question_text: string;
  qualifying_answer: boolean;
  order_index: number;
}

export interface StudyFilters {
  category?: string;
  isRemote?: boolean;
  search?: string;
  status?: StudyStatus;
  page?: number;
  pageSize?: number;
}

// Augment express-session with the fields we actually store.
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
