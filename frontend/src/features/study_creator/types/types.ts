export interface Study {
    id: string;
    researcher_id: string;
    title: string;
    reward_amount: number;
    area_location: string;
    view_count: number;
}

export interface QualificationQuestion {
    id: string;
    question: string;
    type: 'text' | 'radio' | 'checkbox';
    options: string[];
    required_answer: string | string[];
}