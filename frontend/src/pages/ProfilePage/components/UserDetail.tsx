import {
  CalendarDays,
  Check,
  Coins,
  GraduationCap,
  LogOut,
  Mail,
  Pencil,
  Phone,
  UserRound,
  X
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMyProfile } from "../../../api/profileApi";
import { useAuth } from "../../../hooks/useAuth";
import type { LedgerEntry, UserProfile } from "../../../types";

interface userDetailProp{
  profile: UserProfile;
  ledgerEntries: LedgerEntry[];
  onProfileUpdate : (profile: UserProfile) => void;
}

function UserDetail({profile, ledgerEntries, onProfileUpdate}: userDetailProp) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [profileBio, setProfileBio] = useState(profile.profile_bio?? "");

  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolValue, setSchoolValue] = useState(profile.school_affiliation?? "");

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number?? "");

  const initials = profile.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out", error);
      setIsSigningOut(false);
    }
  }

  async function handleSaveBiography() {
    setIsSaving(true);
    setEditError(null);

    try {
      const { user: updatedProfile } =
        await updateMyProfile({
          profile_bio: profileBio.trim() || null,
        });

      onProfileUpdate(updatedProfile);
      setProfileBio(updatedProfile.profile_bio ?? "");
      setIsEditingBio(false);
    } catch (error) {
      console.error("Failed to update biography", error);
      setEditError("Could not update your biography.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSchool() {
    setIsSaving(true);
    setEditError(null);

    try {
      const { user: updatedProfile } =
        await updateMyProfile({
          school_affiliation:
            schoolValue.trim() || null,
        });

      onProfileUpdate(updatedProfile);
      setSchoolValue(updatedProfile.school_affiliation ?? "");
      setIsEditingSchool(false);
    } catch (error) {
      console.error("Failed to update school affiliation",error);
      setEditError("Could not update your school affiliation.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePhone() {
    setIsSaving(true);
    setEditError(null);

    try {
      const { user: updatedProfile } =
        await updateMyProfile({
          phone_number: phoneNumber.trim() || null,
        });

      onProfileUpdate(updatedProfile);
      setPhoneNumber(updatedProfile.phone_number ?? "");
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Failed to update phone number", error);
      setEditError("Could not update your phone number.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelBiography() {
    setProfileBio(profile.profile_bio ?? "");
    setIsEditingBio(false);
    setEditError(null);
  }

  function handleCancelSchool() {
    setSchoolValue(profile.school_affiliation ?? "");
    setIsEditingSchool(false);
    setEditError(null);
  }

  function handleCancelPhone() {
    setPhoneNumber(profile.phone_number ?? "");
    setIsEditingPhone(false);
    setEditError(null);
  }

  return (
   <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    {/* Profile Heading & */}
      <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center">
        {profile.avatar_url ? (
          <img
              src={profile.avatar_url}
              alt={`${profile.name}'s profile`}
              className="h-24 w-24 rounded-full border border-slate-200"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1F6F6B] text-2xl font-semibold text-white">
              {initials}
            </div>
          )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">
            {profile.name}
          </h1>

          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Mail className="h-4 w-4" />
            {profile.email}
          </p>

          {profile.role && (
            <span className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-medium capitalize text-[#1F6F6B]">
              {profile.role}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="flex ml-auto w-max items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {editError && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {editError}
          </p>
      )}
        
      {/* Biography Section */}
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 text-slate-400">
            <UserRound/>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700">
              Biography
            </p>

            {isEditingBio ? (
              <div>
                <textarea
                  value={profileBio}
                  maxLength={1000}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 
                  text-sm text-slate-700 outline-none focus:border-[#1F6F6B]"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {profileBio.length}/1000
                </p>
              </div>
              
            ):(
            <p
              className={
                profile.profile_bio
                  ? "mt-1 whitespace-pre-wrap break-words text-sm text-slate-600"
                  : "mt-1 text-sm italic text-slate-400"
              }
            >
              {profile.profile_bio || "No biography added"}
            </p>
              
            )}
          </div>
      </div>
      {isEditingBio?(
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleCancelBiography}
            className="rounded-md border border-slate-300 p-2 text-slate-600 
            transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
             <X className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveBiography}
            className="rounded-md bg-[#1F6F6B] p-2 text-white transition 
            hover:bg-[#195954] disabled:cursor-not-allowed disabled:opacity-50"
          >
             <Check className="h-4 w-4" />
          </button>
        </div>
      ):(
      <button
        type="button"
        onClick={()=>{
          setIsEditingBio(true);
          setEditError(null);
        }}
        className="inline-flex items-center gap-1.5 
        rounded-md border border-slate-300 px-3 py-1.5 text-xs 
        font-medium text-slate-700 transition 
        hover:border-[#1F6F6B] hover:text-[#1F6F6B]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      )}
      </div>

      {/* School Affiliation Section */}
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 text-slate-400">
            <GraduationCap/>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700">
              School affiliation
            </p>

            {isEditingSchool ? (
              <input
                type="text"
                value={schoolValue}
                onChange={(event) =>
                  setSchoolValue(event.target.value)
                }
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 
                text-sm text-slate-700 outline-none focus:border-[#1F6F6B]"
              />
            ) : (
              <p
                className={
                  profile.school_affiliation
                    ? "mt-1 break-words text-sm text-slate-600"
                    : "mt-1 text-sm italic text-slate-400"
                }
              >
                {profile.school_affiliation ||
                  "No school affiliation added"}
              </p>
            )}
          </div>
        </div>
        {isEditingSchool ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCancelSchool}
              className="rounded-md border border-slate-300 p-2 text-slate-600 transition 
              hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveSchool}
              className="rounded-md bg-[#1F6F6B] p-2 text-white transition 
              hover:bg-[#195954] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditingSchool(true);
              setEditError(null);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#1F6F6B] hover:text-[#1F6F6B]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* Phone Number Section */}
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 text-slate-400">
            <Phone/>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700">
              Phone number
            </p>

          {isEditingPhone ? (
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value)
                }
                className="mt-2 w-full rounded-md border border-slate-300 px-3 
                py-2 text-sm text-slate-700 outline-none focus:border-[#1F6F6B]"
              />
            ) : (
              <p
                className={
                  profile.phone_number
                    ? "mt-1 break-words text-sm text-slate-600"
                    : "mt-1 text-sm italic text-slate-400"
                }
              >
                {profile.phone_number ||
                  "No phone number added"}
              </p>
            )}
          </div>
      </div>
      {isEditingPhone ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCancelPhone}
              className="rounded-md border border-slate-300 p-2 text-slate-600 transition 
              hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePhone}
              className="rounded-md bg-[#1F6F6B] p-2 text-white transition hover:bg-[#195954] 
              disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditingPhone(true);
              setEditError(null);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border 
            border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 
            transition hover:border-[#1F6F6B] hover:text-[#1F6F6B]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      
      {/* Total Credits Section */}
      <div className="flex items-start gap-3 px-6 py-5">
        <div className="mt-0.5 text-slate-400">
          <Coins/>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            Total Credits
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {profile.total_credits}
          </p>
        </div>
      </div>

      {profile.role === "participant" && (
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-700">Credit history</p>
          {ledgerEntries.length ? (
            <div className="mt-3 divide-y divide-slate-100">
              {ledgerEntries.map((entry) => (
                <div key={entry.id} className="flex justify-between gap-4 py-2 text-sm">
                  <div>
                    <p className="text-slate-700">{entry.description || "Ledger entry"}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={entry.type === "credit" ? "text-emerald-700" : "text-red-600"}>
                    {entry.type === "credit" ? "+" : "-"}{entry.amount} credits
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm italic text-slate-400">No transactions yet</p>
          )}
        </div>
      )}

      {/* Member since Section */}
      <div className="flex items-start gap-3 px-6 py-5">
        <div className="mt-0.5 text-slate-400">
          <CalendarDays/>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            Member Since
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
   </section>
  );
}

export default UserDetail
