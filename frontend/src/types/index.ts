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

export interface LedgerEntry {
  id: string;
  type: "credit" | "debit";
  amount: string;
  description: string | null;
  created_at: string;
}

export type StudyStatus = "draft" | "open" | "closed" | "archived";
export type ApplicationStatus =
  | "eligible"
  | "ineligible"
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

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
  booking_status?: "confirmed" | "completed" | null;
  created_at: string;
}

export interface ScreeningQuestion {
  id: string;
  study_id: string;
  question_text: string;
  qualifying_answer: boolean;
  order_index: number;
}

export interface StudyApplication {
  id: string;
  study_id: string;
  participant_id: string;
  status: ApplicationStatus;
  screening_answers: { questionId: string; answer: boolean }[];
  resume_url: string | null;
  resume_original_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearcherApplication extends StudyApplication {
  study_title: string;
  participant_name: string;
  participant_email: string;
  booking_start_time: string | null;
  booking_end_time: string | null;
}

export interface TimeSlot {
  id: string;
  study_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count?: number;
  created_at: string;
}

export interface CalendarBooking {
  booking_id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  status: "confirmed" | "completed";
}

export interface CalendarEvent {
  time_slot_id: string;
  study_id: string;
  study_title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  is_remote: boolean;
  capacity: number;
  booked_count: number;
  booking_status?: "confirmed" | "completed";
  bookings: CalendarBooking[];
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
