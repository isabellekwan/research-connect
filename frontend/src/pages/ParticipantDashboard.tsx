import { useEffect, useState } from "react";
import { fetchStudies } from "../api/studiesApi";
import { RegistrationModal } from "../components/RegistrationModal";
import { StudyCard } from "../components/StudyCard";
import { StudyFilters } from "../components/StudyFilters";
import type { Study, StudyFilterState } from "../types";
import { DEFAULT_FILTERS } from "../types";

const PAGE_SIZE = 12;

export function ParticipantDashboard() {
  const [filters, setFilters] = useState<StudyFilterState>(DEFAULT_FILTERS);
  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Study | null>(null);

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

  return (
    <div className="min-h-screen bg-[#F6F5F1]">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <StudyFilters filters={filters} onChange={setFilters} />

        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <StudyCard key={study.id} study={study} onApply={setApplyingTo} />
            ))}
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
    </div>
  );
}
