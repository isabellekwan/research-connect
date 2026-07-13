import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStudy } from '../../api/studiesApi';
import { ApiError } from '../../api/client';
import type { QualificationQuestion } from './types/types';
import CreateQualificationQuestion from './components/QualificationQuestionCreator';

const inputClasses = 'mt-1 rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-[#1F6F6B] focus:ring-2 focus:ring-[#1F6F6B]/20';

function CreateStudy() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [questions, setQuestions] = useState<QualificationQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const amount = compensation === '' ? null : Number(compensation);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      setError('Compensation must be zero or greater.');
      return;
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
        <label className="flex flex-col text-sm font-medium text-slate-700">Title<input className={inputClasses} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Description<textarea className={`${inputClasses} min-h-32 resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Category<input className={inputClasses} type="text" value={category} onChange={(e) => setCategory(e.target.value)} required /></label>
        <label className="flex flex-col text-sm font-medium text-slate-700">Compensation ($)<input className={inputClasses} type="number" min="0" step="0.01" value={compensation} onChange={(e) => setCompensation(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input className="h-4 w-4 accent-[#1F6F6B]" type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} /> Remote study</label>
        {!isRemote && <label className="flex flex-col text-sm font-medium text-slate-700">Location<input className={inputClasses} type="text" value={location} onChange={(e) => setLocation(e.target.value)} /></label>}

        <div className="mt-3">
          <h2 className="text-lg font-semibold text-slate-900">Screening Questions</h2>
          <p className="mt-1 text-sm text-slate-500">Optional Yes/No questions automatically determine eligibility.</p>
        </div>
        {questions.map((question) => (
          <CreateQualificationQuestion key={question.id} question={question} onChange={updateQuestion} onDelete={(id) => setQuestions((current) => current.filter((q) => q.id !== id))} />
        ))}
        <button className="self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={addQuestion}>+ Add Screening Question</button>

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
