import { useEffect, useState } from "react";
import { fetchCategories } from "../api/studiesApi";
import type { StudyFilterState } from "../types";

interface StudyFiltersProps {
  filters: StudyFilterState;
  onChange: (next: StudyFilterState) => void;
}

export function StudyFilters({ filters, onChange }: StudyFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => setCategories([]));
  }, []);

  // Debounce free-text search so we're not firing a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== filters.search) {
        onChange({ ...filters, search: searchDraft, page: 1 });
      }
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const remoteValue =
    filters.isRemote === null ? "any" : filters.isRemote ? "remote" : "in-person";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <input
        type="text"
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.target.value)}
        placeholder="Search studies by title or description…"
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1F6F6B] focus:outline-none focus:ring-1 focus:ring-[#1F6F6B]"
      />

      <select
        value={filters.category ?? ""}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value || null, page: 1 })
        }
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1F6F6B] focus:outline-none focus:ring-1 focus:ring-[#1F6F6B]"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={remoteValue}
        onChange={(e) => {
          const val = e.target.value;
          onChange({
            ...filters,
            isRemote: val === "any" ? null : val === "remote",
            page: 1,
          });
        }}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1F6F6B] focus:outline-none focus:ring-1 focus:ring-[#1F6F6B]"
      >
        <option value="any">Remote or in-person</option>
        <option value="remote">Remote only</option>
        <option value="in-person">In-person only</option>
      </select>
    </div>
  );
}
