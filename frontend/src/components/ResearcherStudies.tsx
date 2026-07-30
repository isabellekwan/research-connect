import { useEffect, useState } from "react";
import { fetchResearcherStudies } from "../api/studiesApi";
import type { Study } from "../types";

export function ResearcherStudies() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResearcherStudies() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchResearcherStudies();

        setStudies(response.studies);
      } catch (error) {
        console.error(error);
        setError("Could not load your studies.");
      } finally {
        setIsLoading(false);
      }
    }

    loadResearcherStudies();
  }, []);

  return (
    <div>
      {isLoading && (
        <p className="mt-5 text-sm text-slate-500">
          Loading studies...
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && !error && studies.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="mt-2 text-sm text-slate-500">
            You have not created any studies yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first study to start recruiting participants.
          </p>
        </div>
      )}

      {!isLoading && !error && studies.length > 0 && (
        <div className="mt-5 space-y-4">
          {studies.map((study) => (
            <article
              key={study.id}
              className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {study.title}
                  </h3>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                  {study.status}
                </span>
              </div>

            <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-medium text-slate-900">
                    Category:
                </p>

                <p className="text-sm text-slate-500">
                    {study.category}
                </p>
            </div>
        
            <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-medium text-slate-900">
                    Description:
                </p>
                <p className="text-sm text-slate-500">
                    {study.description}
                </p>
            </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  {study.is_remote
                    ? "Remote"
                    : study.location ?? "No location"}
                </span>

                <span>
                  Created{" "}
                  {new Date(
                    study.created_at
                  ).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}