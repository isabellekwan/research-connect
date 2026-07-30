import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudies } from "../api/studiesApi";
import { BookingModal } from "../components/BookingModal";
import { RegistrationModal } from "../components/RegistrationModal";
import { ScheduleCalendar } from "../components/ScheduleCalendar";
import { StudyCard } from "../components/StudyCard";
import { StudyFilters } from "../components/StudyFilters";
import type { Study, StudyFilterState } from "../types";
import { DEFAULT_FILTERS } from "../types";

const PAGE_SIZE = 12;

export function ParticipantDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StudyFilterState>(DEFAULT_FILTERS);
  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Study | null>(null);
  const [bookingStudy, setBookingStudy] = useState<Study | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchStudies(filters)
      .then((res) => {
        if (cancelled) return;
        setStudies(res.studies);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load studies. Please try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function refetch() {
    // Re-trigger the effect by shallow-copying filters.
    setFilters((prev) => ({ ...prev }));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const eligibleStudies = studies.filter((study) => study.application_status === "eligible");
  const otherStudies = studies.filter((study) => study.application_status !== "eligible");

  function handleStudyAction(study: Study) {
    if (study.application_status === "eligible") {
      navigate(`/studies/${study.id}/apply`);
      return;
    }
    setApplyingTo(study);
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1]">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <StudyFilters filters={filters} onChange={setFilters} />

            {error && (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {!isLoading && eligibleStudies.length > 0 && (
              <section className="mb-8">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">Eligible studies</h2>
                  <p className="text-sm text-slate-500">
                    You passed screening. Review the details and submit your application.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {eligibleStudies.map((study) => (
                    <StudyCard key={study.id} study={study} onApply={handleStudyAction} onBook={setBookingStudy} />
                  ))}
                </div>
              </section>
            )}

            {!isLoading && otherStudies.length > 0 && (
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Discover studies</h2>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-200/60" />
                ))}
              </div>
            ) : studies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="font-medium text-slate-700">No studies match your filters</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try widening your search or checking back later for new postings.
                </p>
              </div>
            ) : otherStudies.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {otherStudies.map((study) => (
                  <StudyCard key={study.id} study={study} onApply={handleStudyAction} onBook={setBookingStudy} />
                ))}
              </div>
            ) : null}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <aside className="order-first lg:order-none">
            <ScheduleCalendar role="participant" />
          </aside>
        </div>
      </main>

      {applyingTo && (
        <RegistrationModal
          study={applyingTo}
          onClose={() => setApplyingTo(null)}
          onSubmitted={() => {
            setApplyingTo(null);
            refetch();
          }}
        />
      )}

      {bookingStudy && (
        <BookingModal
          study={bookingStudy}
          onClose={() => setBookingStudy(null)}
          onBooked={() => {
            setBookingStudy(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
