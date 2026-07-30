import { Check, Clock3, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchResearcherApplications,
  reviewStudyApplication,
} from "../api/studiesApi";
import type { ResearcherApplication } from "../types";

export function ResearcherApplications() {
  const [applications, setApplications] = useState<ResearcherApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResearcherApplications()
      .then((response) => setApplications(response.applications))
      .catch(() => setError("Could not load applications."))
      .finally(() => setIsLoading(false));
  }, []);

  async function review(applicationId: string, status: "accepted" | "rejected") {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const response = await reviewStudyApplication(applicationId, status);
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? response.application : application
        )
      );
    } catch {
      setError("Could not update this application. It may have already been reviewed.");
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = applications.filter((application) => application.status === "pending");
  const reviewed = applications.filter((application) => application.status !== "pending");

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/researcher" className="text-sm font-medium text-[#1F6F6B] hover:text-[#195954]">
          ← Researcher dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Study applicants</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review eligible participants who submitted an application.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            {pending.length} awaiting review
          </span>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="mt-8 text-sm text-slate-500">Loading applications…</p>
        ) : pending.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Clock3 className="mx-auto h-7 w-7 text-slate-400" />
            <h2 className="mt-3 font-medium text-slate-800">No applications waiting</h2>
            <p className="mt-1 text-sm text-slate-500">New eligible applicants will appear here.</p>
          </div>
        ) : (
          <section className="mt-8 space-y-4" aria-label="Pending applications">
            {pending.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                updating={updatingId === application.id}
                onReview={review}
              />
            ))}
          </section>
        )}

        {reviewed.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">Reviewed</h2>
            <div className="mt-4 space-y-3">
              {reviewed.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  updating={false}
                  onReview={review}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

interface ApplicationCardProps {
  application: ResearcherApplication;
  updating: boolean;
  onReview: (id: string, status: "accepted" | "rejected") => void;
}

function ApplicationCard({ application, updating, onReview }: ApplicationCardProps) {
  const isPending = application.status === "pending";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#1F6F6B]">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-slate-900">
                {application.participant_name}
              </h2>
              <p className="truncate text-sm text-slate-500">{application.participant_email}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 sm:gap-x-8">
            <div>
              <dt className="inline font-medium text-slate-700">Study: </dt>
              <dd className="inline text-slate-600">{application.study_title}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Submitted: </dt>
              <dd className="inline text-slate-600">
                {new Date(application.updated_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Screening: </dt>
              <dd className="inline text-emerald-700">Eligible</dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Résumé: </dt>
              <dd className="inline text-slate-500">
                {application.resume_url ? (
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#1F6F6B] hover:underline"
                  >
                    View PDF
                  </a>
                ) : (
                  "Not attached"
                )}
              </dd>
            </div>
          </dl>
          {application.status === "accepted" && (
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="font-medium">Booked session: </span>
              {application.booking_start_time
                ? `${new Date(application.booking_start_time).toLocaleString()}`
                : "Waiting for participant to choose a time"}
            </p>
          )}
        </div>

        {isPending ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={() => onReview(application.id, "rejected")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => onReview(application.id, "accepted")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1F6F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#195954] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
          </div>
        ) : (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
              application.status === "accepted"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {application.status === "accepted" ? "Approved" : "Rejected"}
          </span>
        )}
      </div>
    </article>
  );
}
