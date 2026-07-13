import './QualificationOptionsEditor.css';
import type { QualificationQuestion } from '../types/types';

interface QualificationOptionsEditorProps {
    question: QualificationQuestion;
    onChange: <K extends keyof QualificationQuestion>(
        id: string,
        field: K,
        value: QualificationQuestion[K]
    ) => void;
}

function QualificationOptionsEditor({ question, onChange }: QualificationOptionsEditorProps) {
    const { id, type, options, required_answer } = question;

    function updateOptionText(optionId: string, newText: string) {
        const updated = options.map((opt) =>
            opt.id === optionId ? { ...opt, text: newText } : opt
        );
        onChange(id, 'options', updated);
    }

    function addOption() {
        onChange(id, 'options', [...options, { id: crypto.randomUUID(), text: '' }]);
    }

    function removeOption(optionId: string) {
        const updated = options.filter((opt) => opt.id !== optionId);
        onChange(id, 'options', updated);

        // also clean up required_answer if the removed option was selected
        if (type === 'radio' && required_answer === optionId) {
            onChange(id, 'required_answer', '');
        }
        if (type === 'checkbox' && Array.isArray(required_answer)) {
            onChange(
                id,
                'required_answer',
                required_answer.filter((ans) => ans !== optionId)
            );
        }
    }

    function toggleCorrect(optionId: string) {
        if (type === 'radio') {
            onChange(id, 'required_answer', optionId);
        } else {
            const current = Array.isArray(required_answer) ? required_answer : [];
            const updated = current.includes(optionId)
                ? current.filter((ans) => ans !== optionId)
                : [...current, optionId];
            onChange(id, 'required_answer', updated);
        }
    }

    function isChecked(optionId: string) {
        if (type === 'radio') {
            return required_answer === optionId;
        }
        return Array.isArray(required_answer) && required_answer.includes(optionId);
    }

    return (
        <div className="options-editor">
            <p className="options-editor__label">
                Options (check the correct {type === 'radio' ? 'answer' : 'answers'}):
            </p>

            {options.map((option, index) => (
                <div key={index} className="options-editor__row">
                    <input
                        type={type === 'radio' ? 'radio' : 'checkbox'}
                        name={`correct-${id}`}
                        checked={isChecked(option.id)}
                        onChange={() => toggleCorrect(option.id)}
                    />
                    <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOptionText(option.id, e.target.value)}
                        className="options-editor__text-input"
                    />
                    <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="options-editor__remove-btn"
                    >
                        ✕
                    </button>
                </div>
            ))}

            <button type="button" onClick={addOption} className="options-editor__add-btn">
                + Add Option
            </button>
        </div>
    );
}

export default QualificationOptionsEditor;