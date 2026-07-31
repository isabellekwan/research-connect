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
  [key: string]: unknown;
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
  booking_status?: Booking["status"] | null;
  [key: string]: unknown;
}

export type ApplicationStatus =
  | "eligible"
  | "ineligible"
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

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
  [key: string]: unknown;
}

export interface ResearcherApplication extends StudyApplication {
  study_title: string;
  participant_name: string;
  participant_email: string;
  booking_start_time: string | null;
  booking_end_time: string | null;
}

export interface ScreeningQuestion {
  id: string;
  study_id: string;
  question_text: string;
  qualifying_answer: boolean;
  order_index: number;
  [key: string]: unknown;
}

export interface TimeSlot {
  id: string;
  study_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  created_at: string;
  [key: string]: unknown;
}

export interface AvailableTimeSlot extends TimeSlot {
  booked_count: number;
}

export interface Booking {
  id: string;
  time_slot_id: string;
  participant_id: string;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
  [key: string]: unknown;
}

export interface BookingInvite {
  booking_id: string;
  study_title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  participant_name: string;
  participant_email: string;
  researcher_name: string;
  researcher_email: string;
}

export interface CalendarBooking {
  booking_id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  status: Booking["status"];
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
  booking_status?: Booking["status"];
  bookings: CalendarBooking[];
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
  timeSlots: {
    startTime: string;
    endTime: string;
    capacity: number;
  }[];
}

export interface AnalyticsOverview {
  studiesPosted: number;
  totalViews: number;
  viewsToday: number;
  totalSignups: number;
  signupsToday: number;
}

export interface ViewStat {
  day: string;
  views: number;
}

export interface EnrollmentStat {
  status: ApplicationStatus;
  count: number;
}

// Augment express-session with the fields we actually store.
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
