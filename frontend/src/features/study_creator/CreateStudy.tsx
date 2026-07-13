import { useState } from 'react';
import type { QualificationQuestion } from './types/types.ts';
import CreateQualificationQuestion from './components/QualificationQuestionCreator';
import './CreateStudy.css';

function CreateStudy() {
    const [title, setTitle] = useState('');
    const [rewardAmount, setRewardAmount] = useState('');
    const [areaLocation, setAreaLocation] = useState('');
    const [questions, setQuestions] = useState<QualificationQuestion[]>([]);

    function addQuestion() {
        setQuestions([
            ...questions,
            {
                id: crypto.randomUUID(),
                question: '',
                type: 'text',
                options: [],
                required_answer: '',
            },
        ]);
    }

    function updateQuestion<K extends keyof QualificationQuestion>(
        id: string,
        field: K,
        value: QualificationQuestion[K]
    ) {
        setQuestions(
            questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    }

    function deleteQuestion(id: string) {
        setQuestions(questions.filter((q) => q.id !== id));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log({
            title,
            reward_amount: Number(rewardAmount),
            area_location: areaLocation,
            questions,
        });
    }

    return (
        <div className="create-study">
            <h1>Create a Study</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Study title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Reward amount"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Area / location"
                    value={areaLocation}
                    onChange={(e) => setAreaLocation(e.target.value)}
                />

                <h2>Screening Questions</h2>
                {questions.map((q) => (
                    <CreateQualificationQuestion
                        key={q.id}
                        question={q}
                        onChange={updateQuestion}
                        onDelete={deleteQuestion}
                    />
                ))}
                <button type="button" onClick={addQuestion}>
                    + Add Screening Question
                </button>

                <div className="create-study__submit-row">
                    <button type="submit">Create Study</button>
                </div>
            </form>
        </div>
    );
}

export default CreateStudy;