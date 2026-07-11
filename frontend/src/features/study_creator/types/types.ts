export interface Study {
    id: string;
    researcher_id: string;
    title: string;
    reward_amount: number;
    area_location: string;
    view_count: number;
}

export interface QuestionOption {
    id: string;
    text: string;
}

export type QuestionType = 'text' | 'radio' | 'checkbox';

export interface QualificationQuestion {
    id: string;
    question: string;
    type: QuestionType;
    options: QuestionOption[];
    required_answer: string | string[];
}