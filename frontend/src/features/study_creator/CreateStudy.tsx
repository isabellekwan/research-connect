import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStudy } from '../../api/studiesApi';
import { ApiError } from '../../api/client';
import type { QualificationQuestion } from './types/types';
import CreateQualificationQuestion from './components/QualificationQuestionCreator';

const inputClasses = 'mt-1 rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-[#1F6F6B] focus:ring-2 focus:ring-[#1F6F6B]/20';

interface SessionDraft {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

function emptySession(): SessionDraft {
  return {
    id: crypto.randomUUID(),
    startTime: '',
    endTime: '',
    capacity: 1,
  };
}

function CreateStudy() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [questions, setQuestions] = useState<QualificationQuestion[]>([]);
  const [sessions, setSessions] = useState<SessionDraft[]>([emptySession()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      { id: crypto.randomUUID(), question: '', qualifyingAnswer: true },
    ]);
  }

  function updateQuestion<K extends keyof QualificationQuestion>(
    id: string,
    field: K,
    value: QualificationQuestion[K]
  ) {
    setQuestions((current) => current.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function updateSession<K extends keyof Omit<SessionDraft, 'id'>>(
    id: string,
    field: K,
    value: SessionDraft[K]
  ) {
    setSessions((current) =>
      current.map((session) => (session.id === id ? { ...session, [field]: value } : session))
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const amount = compensation === '' ? null : Number(compensation);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      setError('Compensation must be zero or greater.');
      return;
    }

    for (const session of sessions) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      if (!session.startTime || !session.endTime || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setError('Add a valid start and end time for every session.');
        return;
      }
      if (start <= new Date()) {
        setError('Session start times must be in the future.');
        return;
      }
      if (end <= start) {
        setError('Each session must end after it starts.');
        return;
      }
      if (!Number.isInteger(session.capacity) || session.capacity < 1 || session.capacity > 500) {
        setError('Session capacity must be between 1 and 500.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createStudy({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        isRemote,
        compensation: amount,
        status: 'open',
        screeningQuestions: questions.map((question) => ({
          questionText: question.question.trim(),
          qualifyingAnswer: question.qualifyingAnswer,
        })),
        timeSlots: sessions.map((session) => ({
          startTime: new Date(session.startTime).toISOString(),
          endTime: new Date(session.endTime).toISOString(),
          capacity: session.capacity,
        })),
      });
      navigate('/researcher', { replace: true, state: { message: 'Study created successfully.' } });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not create the study. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:p-8">
      <Link to="/researcher" className="text-sm font-medium text-[#1F6F6B] hover:text-[#195954]">← Researcher dashboard</Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Create a Study</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Study details</h2>
          <p className="mt-1 text-sm text-slate-500">Help participants understand the study before they apply.</p>
        </div>
        <label className="flex flex-col text-sm font-medium text-slate-700">Title<input className={inputClasses} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Description<textarea className={`${inputClasses} min-h-32 resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Category<input className={inputClasses} type="text" value={category} onChange={(e) => setCategory(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Compensation ($)<input className={inputClasses} type="number" min="0" step="0.01" value={compensation} onChange={(e) => setCompensation(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input className="h-4 w-4 accent-[#1F6F6B]" type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} /> Remote study</label>
        {!isRemote && <label className="flex flex-col text-sm font-medium text-slate-700">Location<input className={inputClasses} type="text" value={location} onChange={(e) => setLocation(e.target.value)} /></label>}

        <div className="mt-5 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Screening Questions</h2>
          <p className="mt-1 text-sm text-slate-500">Optional Yes/No questions automatically determine eligibility.</p>
        </div>
        {questions.map((question) => (
          <CreateQualificationQuestion key={question.id} question={question} onChange={updateQuestion} onDelete={(id) => setQuestions((current) => current.filter((q) => q.id !== id))} />
        ))}
        <button className="self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={addQuestion}>+ Add Screening Question</button>

        <div className="mt-5 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Available sessions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add the times participants will be able to choose after approval. Times are shown in {timeZone}.
          </p>
        </div>

        <div className="space-y-3">
          {sessions.map((session, index) => (
            <fieldset key={session.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800">Session {index + 1}</span>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSessions((current) => current.filter((item) => item.id !== session.id))}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-slate-700">
                  Starts
                  <input
                    className={inputClasses}
                    type="datetime-local"
                    value={session.startTime}
                    onChange={(event) => updateSession(session.id, 'startTime', event.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-slate-700">
                  Ends
                  <input
                    className={inputClasses}
                    type="datetime-local"
                    value={session.endTime}
                    onChange={(event) => updateSession(session.id, 'endTime', event.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-slate-700 sm:max-w-40">
                  Participant capacity
                  <input
                    className={inputClasses}
                    type="number"
                    min="1"
                    max="500"
                    step="1"
                    value={session.capacity}
                    onChange={(event) => updateSession(session.id, 'capacity', Number(event.target.value))}
                    required
                  />
                </label>
              </div>
            </fieldset>
          ))}
        </div>
        <button
          className="self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={() => setSessions((current) => [...current, emptySession()])}
        >
          + Add another session
        </button>

        {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-3 flex justify-end">
          <button className="rounded-md bg-[#1F6F6B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#195954] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create and publish study'}</button>
        </div>
      </form>
      </div>
    </main>
  );
}

export default CreateStudy;
