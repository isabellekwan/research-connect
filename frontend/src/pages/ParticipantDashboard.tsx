import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
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
type StudyTab = "eligible" | "booked" | "completed" | "rejected";

const STUDY_TABS: { value: StudyTab; label: string }[] = [
  { value: "eligible", label: "Eligible" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export function ParticipantDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StudyFilterState>(DEFAULT_FILTERS);
  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Study | null>(null);
  const [bookingStudy, setBookingStudy] = useState<Study | null>(null);
  const [studyTab, setStudyTab] = useState<StudyTab>("completed");

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
  const tabStudies = studies.filter((study) => {
    if (studyTab === "booked") return study.booking_status === "confirmed";
    if (studyTab === "completed") return study.booking_status === "completed";
    if (studyTab === "eligible") return study.application_status === "eligible";
    return study.application_status === "ineligible" || study.application_status === "rejected";
  });
  const discoverStudies = studies.filter(
    (study) =>
      !study.booking_status &&
      study.application_status !== "eligible" &&
      study.application_status !== "ineligible" &&
      study.application_status !== "rejected"
  );

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

            {!isLoading && (
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Discover studies</h2>
                <p className="text-sm text-slate-500">
                  Find a new study that matches your interests.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-200/60" />
                ))}
              </div>
            ) : discoverStudies.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {discoverStudies.map((study) => (
                  <StudyCard key={study.id} study={study} onApply={handleStudyAction} onBook={setBookingStudy} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F6F6B]/10 text-[#1F6F6B]">
                    <Compass className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-800">
                    No new studies to discover
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Adjust the filters above or check back later. Your existing studies are organized beside the calendar.
                  </p>
                </div>
              </div>
            )}

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

          <aside className="order-first space-y-4 lg:order-none">
            <ScheduleCalendar role="participant" />
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-slate-900">My studies</h2>
                <p className="text-xs text-slate-500">Track your participation</p>
              </div>
              <div className="grid grid-cols-4 border-b border-slate-200">
                {STUDY_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStudyTab(tab.value)}
                    className={`border-b-2 px-1 pb-2 text-xs font-medium ${
                      studyTab === tab.value
                        ? "border-[#1F6F6B] text-[#1F6F6B]"
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {tabStudies.length ? (
                  tabStudies.map((study) => (
                    <button
                      key={study.id}
                      type="button"
                      disabled={studyTab !== "eligible"}
                      onClick={() => handleStudyAction(study)}
                      className="w-full rounded-md bg-slate-50 px-3 py-2 text-left disabled:cursor-default"
                    >
                      <p className="text-sm font-medium text-slate-800">{study.title}</p>
                      {study.compensation && (
                        <p className="text-xs text-slate-500">{study.compensation} credits</p>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                      No {studyTab} studies
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      They will appear here when their status changes.
                    </p>
                  </div>
                )}
              </div>
            </section>
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
