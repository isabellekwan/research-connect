import './QualificationOptionsEditor.css';
import type { QualificationQuestion } from '../types/types';

interface QualificationOptionsEditorProps {
    question: QualificationQuestion;
    onChange: (id: string, field: keyof QualificationQuestion, value: string | string[]) => void;
}

function QualificationOptionsEditor({ question, onChange }: QualificationOptionsEditorProps) {
    const { id, type, options, required_answer } = question;

    function updateOptionText(index: number, newText: string) {
        const updated = [...options];
        updated[index] = newText;
        onChange(id, 'options', updated);
    }

    function addOption() {
        onChange(id, 'options', [...options, '']);
    }

    function removeOption(index: number) {
        const updated = options.filter((_, i) => i !== index);
        onChange(id, 'options', updated);

        // also clean up required_answer if the removed option was selected
        if (type === 'radio' && required_answer === options[index]) {
            onChange(id, 'required_answer', '');
        }
        if (type === 'checkbox' && Array.isArray(required_answer)) {
            onChange(
                id,
                'required_answer',
                required_answer.filter((ans) => ans !== options[index])
            );
        }
    }

    function toggleCorrect(optionText: string) {
        if (type === 'radio') {
            onChange(id, 'required_answer', optionText);
        } else {
            const current = Array.isArray(required_answer) ? required_answer : [];
            const updated = current.includes(optionText)
                ? current.filter((ans) => ans !== optionText)
                : [...current, optionText];
            onChange(id, 'required_answer', updated);
        }
    }

    function isChecked(optionText: string) {
        if (type === 'radio') {
            return required_answer === optionText;
        }
        return Array.isArray(required_answer) && required_answer.includes(optionText);
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
                        checked={isChecked(option)}
                        onChange={() => toggleCorrect(option)}
                    />
                    <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOptionText(index, e.target.value)}
                        className="options-editor__text-input"
                    />
                    <button
                        type="button"
                        onClick={() => removeOption(index)}
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