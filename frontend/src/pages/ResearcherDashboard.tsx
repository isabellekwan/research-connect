import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ResearcherDashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#F6F5F1] p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Researcher dashboard</h1>
            <p className="mt-1 text-slate-500">Welcome back, {user?.name}.</p>
          </div>
          <button onClick={() => logout()} className="text-sm font-medium text-slate-500 hover:text-slate-700">Sign out</button>
        </div>
         <section className="rounded-lg border border-slate-200 p-6 mt-5">
          <h2 className="font-semibold text-slate-900">Create Study</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and publish a new research study for participants.
          </p>

          <Link
            to="/studies/new"
            className="mt-4 inline-block rounded-md bg-[#1F6F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#195954]"
          >
            Create Study
          </Link>
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Study analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Review views and enrollment activity for your posted studies.</p>
          <Link to="/analytics" className="mt-4 inline-block rounded-md bg-[#1F6F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#195954]">View analytics</Link>
        </section>
      </div>
    </main>
  );
}
