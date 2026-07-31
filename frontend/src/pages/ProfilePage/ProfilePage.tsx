import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../../api/profileApi";
import type { LedgerEntry, UserProfile } from "../../types";
import UserDetail from "./components/UserDetail";

function ProfilePage() {
  const [profile, setProfile] =
    useState<UserProfile>();
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    getMyProfile()
      .then(({ user, ledgerEntries }) => {
        setProfile(user);
        setLedgerEntries(ledgerEntries);
      })
      .catch((error) => {
        console.error("Failed to load profile", error);
      });
  }, []);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F5F1] px-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#1F6F6B]" />

          <p className="text-sm font-medium text-slate-600">
            Loading profile…
          </p>
        </div>
      </main>
    );
  }

  const dashboardPath = 
    profile.role === "researcher"
    ? "/researcher"
    : "/dashboard";

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Link 
            to={dashboardPath}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#1F6F6B] 
            transition hover:text-[#195954]"
          >
            ← Back to dashboard
          </Link>
          <UserDetail profile={profile} ledgerEntries={ledgerEntries} onProfileUpdate={setProfile}/>
        {/* <Ratings/> */}
        {/* <AttendanceHistory/> */}
    </div>
    </main>
  )
}

export default ProfilePage
