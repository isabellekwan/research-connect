export type UserRole = "researcher" | "participant";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole | null;
  profile_bio: string | null;
  school_affiliation: string | null;
  phone_number: string | null;
  total_credits: string;
  created_at: string;
}

export interface UpdateProfileInput {
  profile_bio?: string | null;
  school_affiliation?: string | null;
  phone_number?: string | null;
}

export type StudyStatus = "draft" | "open" | "closed" | "archived";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Study {
  id: string;
  researcher_id: string;
  researcher_name?: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  is_remote: boolean;
  compensation: string | null;
  status: StudyStatus;
  application_status?: ApplicationStatus | null;
  created_at: string;
}

export interface ScreeningQuestion {
  id: string;
  study_id: string;
  question_text: string;
  qualifying_answer: boolean;
  order_index: number;
}

export interface StudyListResponse {
  studies: Study[];
  total: number;
}

export interface StudyFilterState {
  category: string | null;
  isRemote: boolean | null;
  search: string;
  page: number;
}

export const DEFAULT_FILTERS: StudyFilterState = {
  category: null,
  isRemote: null,
  search: "",
  page: 1,
};