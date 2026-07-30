import {
  BarChart3,
  ClipboardList,
  Plus,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ResearcherStudies } from "../components/ResearcherStudies";

export function ResearcherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeMessage = (location.state as { message?: string } | null)?.message;
  const [message,setMessage] = useState<string|null>(routeMessage?? null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, 5000);

    return () => clearTimeout(timer);
  },[message,location.pathname, navigate])

  return (
    <main className="min-h-screen bg-[#F6F5F1]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Research overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create studies, manage your existing postings, and review
            recruitment activity.
          </p>
        </section>

        {message && (
          <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-[#1F6F6B]">
              <Plus/>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Create a study
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Publish a new research opportunity and add screening questions.
            </p>

            <Link
              to="/studies/new"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1F6F6B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#195954]"
            >
              <Plus className="h-4 w-4" />
              Create study
            </Link>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BarChart3/>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Study analytics
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review study views, participant enrollment, and recruitment
              performance.
            </p>

            <Link
              to="/analytics"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <BarChart3 className="h-4 w-4" />
              View analytics
            </Link>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <UserCheck />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Review applicants
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review eligible participants and approve or reject their applications.
            </p>

            <Link
              to="/researcher/applications"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UserCheck className="h-4 w-4" />
              View applicants
            </Link>
          </article>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ClipboardList/>
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Your studies
              </h2>

              <p className="text-sm text-slate-500">
                View and manage the studies you have created.
              </p>
            </div>
          </div>

          <ResearcherStudies />
        </section>
      </div>
    </main>
  );
}
