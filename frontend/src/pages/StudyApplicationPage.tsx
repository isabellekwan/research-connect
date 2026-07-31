import { FileText, MapPin, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchStudyDetail,
  submitStudyApplication,
  uploadStudyResume,
} from "../api/studiesApi";
import { ApiError } from "../api/client";
import type { Study, StudyApplication } from "../types";

export function StudyApplicationPage() {
  const { studyId = "" } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState<Study | null>(null);
  const [application, setApplication] = useState<StudyApplication | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudyDetail(studyId)
      .then((response) => {
        setStudy(response.study);
        setApplication(response.application);
      })
      .catch(() => setError("Could not load this study."))
      .finally(() => setIsLoading(false));
  }, [studyId]);

  function handleResume(file: File | undefined) {
    setError(null);
    if (!file) {
      setResume(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Choose a PDF résumé.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("The résumé must be smaller than 10 MB.");
      return;
    }
    setResume(file);
  }

  async function submitApplication() {
    setIsSubmitting(true);
    setError(null);
    try {
      if (resume) await uploadStudyResume(studyId, resume);
      await submitStudyApplication(studyId);
      navigate("/dashboard", {
        replace: true,
        state: { message: "Application submitted for researcher review." },
      });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not submit your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-slate-500">Loading study…</main>;
  }

  if (!study) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-red-600">{error ?? "Study not found."}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-[#1F6F6B]">
          ← Back to studies
        </Link>
      </main>
    );
  }

  const isEligible = application?.status === "eligible";

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="text-sm font-medium text-[#1F6F6B] hover:text-[#195954]">
          ← Back to eligible studies
        </Link>

        <article className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-[#1F6F6B]/10 px-3 py-1 text-[#1F6F6B]">
                {study.category}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Screening passed
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">{study.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Researcher: {study.researcher_name}
            </p>
          </header>

          <div className="space-y-7 p-6 sm:p-8">
            <section>
              <h2 className="font-semibold text-slate-900">About this study</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {study.description}
              </p>
            </section>

            <dl className="grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-800">Location</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {study.is_remote ? "Remote" : study.location ?? "To be confirmed"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-800">Compensation</dt>
                <dd className="mt-1 text-slate-600">
                  {study.compensation ? `${study.compensation} credits` : "Not specified"}
                </dd>
              </div>
            </dl>

            <section className="border-t border-slate-200 pt-7">
              <h2 className="font-semibold text-slate-900">Optional resume</h2>
              <p className="mt-1 text-sm text-slate-500">
                Attach a PDF up to 10 MB. This is optional.
              </p>
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600 transition hover:border-[#1F6F6B] hover:bg-teal-50/40">
                {resume ? <FileText className="h-5 w-5 text-[#1F6F6B]" /> : <Upload className="h-5 w-5" />}
                <span>{resume ? resume.name : "Choose a PDF resume"}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(event) => handleResume(event.target.files?.[0])}
                />
              </label>
              {resume && (
                <p className="mt-2 text-xs text-emerald-700">
                  This PDF will be securely uploaded when you submit.
                </p>
              )}
            </section>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {!isEligible && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This application is not currently eligible for submission.
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitApplication}
                disabled={!isEligible || isSubmitting}
                className="rounded-md bg-[#1F6F6B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#195954] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit for researcher review"}
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
