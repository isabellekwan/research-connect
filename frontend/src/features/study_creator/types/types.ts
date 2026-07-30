export interface QualificationQuestion {
  id: string;
  question: string;
  qualifyingAnswer: boolean;
}

export interface CreateStudyPayload {
  title: string;
  description: string;
  category: string;
  location: string;
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
