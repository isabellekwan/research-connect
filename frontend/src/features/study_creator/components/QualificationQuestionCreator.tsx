import './QualificationQuestionCreator.css';
import QualificationOptionsEditor from './QualificationOptionsEditor';
import type { QualificationQuestion, QuestionType } from '../types/types';

interface CreateQualificationQuestionProps {
    question: QualificationQuestion;
    onChange: <K extends keyof QualificationQuestion>(
        id: string,
        field: K,
        value: QualificationQuestion[K]
    ) => void;
    onDelete: (id: string) => void;
}

function QualificationQuestionCreator({ question, onChange, onDelete }: CreateQualificationQuestionProps) {
    return (
        <div className="qual-question">
            <div className="qual-question__header">
                <input
                    type="text"
                    placeholder="Question text"
                    value={question.question}
                    onChange={(e) => onChange(question.id, 'question', e.target.value)}
                    className="qual-question__text-input"
                />

                <select
                    value={question.type}
                    onChange={(e) => onChange(question.id, 'type', e.target.value as QuestionType)}
                    className="qual-question__type-select"
                >
                    <option value="text">Text</option>
                    <option value="radio">Radio (single choice)</option>
                    <option value="checkbox">Checkbox (multi choice)</option>
                </select>

                <button
                    type="button"
                    onClick={() => onDelete(question.id)}
                    className="qual-question__delete-btn"
                >
                    Remove
                </button>
            </div>

            {question.type === 'text' && (
                <input
                    type="text"
                    placeholder="Required answer"
                    value={question.required_answer}
                    onChange={(e) => onChange(question.id, 'required_answer', e.target.value)}
                    className="qual-question__answer-input"
                />
            )}

            {(question.type === 'radio' || question.type === 'checkbox') && (
                <QualificationOptionsEditor question={question} onChange={onChange} />
            )}
        </div>
    );
}

export default QualificationQuestionCreator;