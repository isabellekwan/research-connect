import type { Study } from "../types";

interface StudyCardProps {
  study: Study;
  onApply: (study: Study) => void;
  onBook: (study: Study) => void;
}

const STATUS_STYLES: Record<string, string> = {
  eligible: "bg-teal-50 text-teal-700 border-teal-200",
  ineligible: "bg-slate-100 text-slate-500 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-slate-100 text-slate-500 border-slate-200",
  withdrawn: "bg-slate-100 text-slate-500 border-slate-200",
};

export function StudyCard({ study, onApply, onBook }: StudyCardProps) {
  const hasStatus = Boolean(study.application_status);
  const canContinue = study.application_status === "eligible";

  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="rounded-full bg-[#1F6F6B]/10 px-2.5 py-0.5 text-xs font-medium text-[#1F6F6B]">
            {study.category}
          </span>
          {study.is_remote && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Remote
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900">{study.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-500">{study.description}</p>

        <dl className="mt-3 space-y-1 text-xs text-slate-500">
          <div>
            <dt className="inline font-medium text-slate-600">Researcher: </dt>
            <dd className="inline">{study.researcher_name}</dd>
          </div>
          {study.location && (
            <div>
              <dt className="inline font-medium text-slate-600">Location: </dt>
              <dd className="inline">{study.location}</dd>
            </div>
          )}
          {study.compensation && (
            <div>
              <dt className="inline font-medium text-slate-600">Compensation: </dt>
              <dd className="inline">{study.compensation} credits</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-4">
        {study.application_status === "accepted" && !study.booking_status ? (
          <button
            onClick={() => onBook(study)}
            className="w-full rounded-md bg-[#1F6F6B] px-3 py-2 text-sm font-medium text-white hover:bg-[#195954]"
          >
            Choose a time
          </button>
        ) : study.application_status === "accepted" && study.booking_status ? (
          <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            {study.booking_status === "completed" ? "Completed" : "Session booked"}
          </span>
        ) : canContinue ? (
          <button
            onClick={() => onApply(study)}
            className="w-full rounded-md bg-[#1F6F6B] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#195954] focus:outline-none focus:ring-2 focus:ring-[#1F6F6B] focus:ring-offset-2"
          >
            View details and apply
          </button>
        ) : hasStatus ? (
          <span
            className={`inline-block rounded-md border px-3 py-1.5 text-xs font-medium ${
              STATUS_STYLES[study.application_status as string] ?? STATUS_STYLES.pending
            }`}
          >
            {labelForStatus(study.application_status)}
          </span>
        ) : (
          <button
            onClick={() => onApply(study)}
            className="w-full rounded-md bg-[#1F6F6B] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#195954] focus:outline-none focus:ring-2 focus:ring-[#1F6F6B] focus:ring-offset-2"
          >
            Check eligibility
          </button>
        )}
      </div>
    </div>
  );
}

function labelForStatus(status: Study["application_status"]) {
  switch (status) {
    case "eligible":
      return "Eligible and ready to apply";
    case "ineligible":
      return "Not eligible";
    case "pending":
      return "Waiting for researcher review";
    case "accepted":
      return "Application approved";
    case "rejected":
      return "Application not approved";
    case "withdrawn":
      return "Application withdrawn";
    default:
      return "Applied";
  }
}
