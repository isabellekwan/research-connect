import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  FlaskConical,
  Menu,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const participantBenefits = [
  "Browse studies that match your interests",
  "Apply and book without long email threads",
  "Track sessions in one clear calendar",
];

const researcherBenefits = [
  "Publish opportunities in minutes",
  "Screen and review applicants in one place",
  "Keep recruitment and attendance organized",
];

const linkStyles =
  "inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-[#1F6F6B] focus:outline-none focus:ring-2 focus:ring-[#1F6F6B] focus:ring-offset-2";

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-slate-900">
      <header className="border-b border-slate-200 bg-[#F6F5F1]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a className="text-sm font-medium text-slate-500 hover:text-[#1F6F6B]" href="#how-it-works">
              How it works
            </a>
            <a className="text-sm font-medium text-slate-500 hover:text-[#1F6F6B]" href="#for-everyone">
              For everyone
            </a>
            <a className="text-sm font-medium text-slate-500 hover:text-[#1F6F6B]" href="#why-research-connect">
              Why Research Connect
            </a>
          </nav>

          <Link
            className="hidden items-center gap-2 rounded-md bg-[#1F6F6B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#195954] md:inline-flex"
            to="/login"
          >
            Sign in
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 md:hidden"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {isMenuOpen && (
          <nav className="grid border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile navigation">
            {[
              ["How it works", "#how-it-works"],
              ["For everyone", "#for-everyone"],
              ["Why Research Connect", "#why-research-connect"],
            ].map(([label, href]) => (
              <a
                key={href}
                className="py-2.5 text-sm font-medium text-slate-700"
                href={href}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <Link className="py-2.5 text-sm font-semibold text-[#1F6F6B]" to="/login">
              Sign in
            </Link>
          </nav>
        )}
      </header>

      <main>
        <section>
          <div className="mx-auto grid min-h-[calc(100dvh-65px)] max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Discover research. Find participants.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
                One place to discover studies, recruit participants, and keep every session organized.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-[#1F6F6B] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#195954]"
                  to="/login"
                >
                  Explore studies
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className={linkStyles} to="/login">
                  Recruit participants
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <img
                className="aspect-[4/5] w-full rounded-xl object-cover object-center shadow-lg"
                src="/images/hero.png"
                alt="University students collaborating during a research session"
                width="1003"
                height="1568"
                fetchPriority="high"
              />
              <div className="absolute -bottom-4 right-3 flex max-w-[17rem] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-md sm:-right-5 sm:bottom-8">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#1F6F6B]">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-xs leading-5 text-slate-500">
                  <strong className="block font-semibold text-slate-900">Built for campus research</strong>
                  Clear expectations for every participant.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28" id="how-it-works">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              From discovery to study day.
            </h2>
            <p className="mt-4 text-base text-slate-500">
              A simple path for participants, with less admin for researchers.
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
              <ProcessItem
                icon={<Search className="h-5 w-5" />}
                title="Discover"
                copy="Find relevant studies with clear details about eligibility, location, and compensation."
              />
              <ProcessItem
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="Apply"
                copy="Answer screening questions and share the information researchers actually need."
                divided
              />
              <ProcessItem
                icon={<CalendarDays className="h-5 w-5" />}
                title="Participate"
                copy="Book a session, keep track of commitments, and arrive prepared."
                divided
              />
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28" id="for-everyone">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2">
            <PathCard
              dark
              icon={<UsersRound className="h-6 w-6" />}
              label="For participants"
              title="Turn curiosity into experience."
              copy="Find opportunities that fit your schedule, interests, and eligibility."
              benefits={participantBenefits}
              action="Find a study"
            />
            <PathCard
              icon={<FlaskConical className="h-6 w-6" />}
              label="For researchers"
              title="Recruit with less busywork."
              copy="Reach qualified participants and manage the full recruitment workflow."
              benefits={researcherBenefits}
              action="Post a study"
            />
          </div>
        </section>

        <section className="bg-[#F6F5F1] py-20 sm:py-28" id="why-research-connect">
          <div className="mx-auto grid max-w-6xl gap-16 px-4 md:grid-cols-[1fr_0.8fr] md:items-start">
            <div>
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Leave the poster boards and inbox searches behind.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-500">
                Research Connect gives academic communities a shared place to build trust, coordinate sessions, and move good studies forward.
              </p>
              <Link
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#1F6F6B] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#195954]"
                to="/login"
              >
                Join Research Connect
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              <Reason
                icon={<Search className="h-5 w-5" />}
                title="Relevant opportunities"
                copy="Search and filters help participants focus on studies that fit."
              />
              <Reason
                icon={<CalendarDays className="h-5 w-5" />}
                title="Clear scheduling"
                copy="Upcoming sessions and commitments stay easy to find."
              />
              <Reason
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Shared accountability"
                copy="Profiles and attendance history create better expectations."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#F6F5F1]">
        <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-7 sm:grid-cols-[1fr_auto_1fr]">
          <Brand />
          <p className="text-xs text-slate-500">
            Connecting academic research with the people who make it possible.
          </p>
          <Link className="text-sm font-medium text-slate-500 sm:justify-self-end" to="/login">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Brand() {
  return (
    <Link className="inline-flex w-fit items-center gap-2.5" to="/" aria-label="Research Connect home">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1F6F6B] text-xs font-bold text-white">
        RC
      </span>
      <span className="font-bold tracking-tight text-slate-900">
        Research<span className="text-[#1F6F6B]">Connect</span>
      </span>
    </Link>
  );
}

function ProcessItem({
  icon,
  title,
  copy,
  divided = false,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  divided?: boolean;
}) {
  return (
    <article className={divided ? "md:border-l md:border-slate-200 md:pl-10" : "md:pr-10"}>
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-[#1F6F6B]">
        {icon}
      </span>
      <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{copy}</p>
    </article>
  );
}

function PathCard({
  dark = false,
  icon,
  label,
  title,
  copy,
  benefits,
  action,
}: {
  dark?: boolean;
  icon: ReactNode;
  label: string;
  title: string;
  copy: string;
  benefits: string[];
  action: string;
}) {
  return (
    <article
      className={`flex min-h-[34rem] flex-col rounded-xl border p-8 shadow-sm sm:p-12 ${
        dark
          ? "border-[#174845] bg-[#174845] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          dark ? "bg-white/10 text-teal-100" : "bg-teal-50 text-[#1F6F6B]"
        }`}
      >
        {icon}
      </span>
      <p className={`mt-8 text-sm font-semibold ${dark ? "text-teal-100" : "text-[#1F6F6B]"}`}>
        {label}
      </p>
      <h2 className="mt-3 max-w-sm text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      <p className={`mt-5 max-w-md leading-7 ${dark ? "text-slate-200" : "text-slate-500"}`}>
        {copy}
      </p>
      <ul className={`mt-8 space-y-3 text-sm ${dark ? "text-slate-200" : "text-slate-600"}`}>
        {benefits.map((benefit) => (
          <li className="flex items-center gap-3" key={benefit}>
            <Check className={`h-4 w-4 shrink-0 ${dark ? "text-teal-100" : "text-[#1F6F6B]"}`} />
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        className={`mt-auto inline-flex w-fit items-center gap-2 pt-10 text-sm font-semibold ${
          dark ? "text-white" : "text-slate-900"
        }`}
        to="/login"
      >
        {action}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}

function Reason({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-4 py-6 first:pt-0">
      <span className="shrink-0 text-[#1F6F6B]">{icon}</span>
      <span>
        <strong className="block text-sm font-semibold text-slate-900">{title}</strong>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{copy}</span>
      </span>
    </div>
  );
}
