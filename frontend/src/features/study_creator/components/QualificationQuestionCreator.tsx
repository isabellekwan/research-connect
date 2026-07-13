import type { QualificationQuestion } from '../types/types';

interface Props {
  question: QualificationQuestion;
  onChange: <K extends keyof QualificationQuestion>(
    id: string,
    field: K,
    value: QualificationQuestion[K]
  ) => void;
  onDelete: (id: string) => void;
}

function QualificationQuestionCreator({ question, onChange, onDelete }: Props) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Screening question"
          value={question.question}
          onChange={(event) => onChange(question.id, 'question', event.target.value)}
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1F6F6B] focus:ring-2 focus:ring-[#1F6F6B]/20"
          required
        />
        <button type="button" onClick={() => onDelete(question.id)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
          Remove
        </button>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
        Qualifying answer:{' '}
        <select
          value={String(question.qualifyingAnswer)}
          onChange={(event) => onChange(question.id, 'qualifyingAnswer', event.target.value === 'true')}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-normal outline-none focus:border-[#1F6F6B] focus:ring-2 focus:ring-[#1F6F6B]/20"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
    </div>
  );
}

export default QualificationQuestionCreator;
