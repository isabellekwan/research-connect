import { useEffect, useState } from "react";
import { applyToStudy, fetchStudyDetail } from "../api/studiesApi";
import type { ScreeningQuestion, Study } from "../types";

interface RegistrationModalProps {
  study: Study;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RegistrationModal({ study, onClose, onSubmitted }: RegistrationModalProps) {
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudyDetail(study.id)
      .then((res) => setQuestions(res.screeningQuestions))
      .catch(() => setError("Couldn't load screening questions for this study."))
      .finally(() => setIsLoading(false));
  }, [study.id]);

  const allAnswered = questions.every((q) => q.id in answers);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      await applyToStudy(
        study.id,
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] }))
      );
      onSubmitted();
    } catch (err) {
      setError("Couldn't submit your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Apply to {study.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {questions.length > 0
            ? "Answer the questions below to complete your application."
            : "This study has no screening questions, confirm to submit your application."}
        </p>

        <div className="mt-4 max-h-72 space-y-4 overflow-y-auto">
          {isLoading && <p className="text-sm text-slate-400">Loading questions…</p>}

          {!isLoading &&
            questions.map((q) => (
              <fieldset key={q.id} className="text-sm">
                <legend className="mb-2 font-medium text-slate-700">{q.question_text}</legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === true}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === false}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                    />
                    No
                  </label>
                </div>
              </fieldset>
            ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !allAnswered}
            className="rounded-md bg-[#1F6F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#195954] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </div>
    </div>
  );
}
