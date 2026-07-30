import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({onClose}:UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if(!user){
    return null;
  }

  function handleMyProfileClick(){
    onClose();
    navigate("/profile");
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await logout();
      onClose();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out", error);
      setIsSigningOut(false);
    }
  }

  return (
    <div
      role="menu"
      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg 
      border border-slate-200 bg-white py-1 shadow-lg"
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="truncate text-sm font-medium text-slate-900">
          {user.name}
        </p>

        <p className="truncate text-xs text-slate-500">
          {user.email}
        </p>
      </div>

      <button
        type="button"
        onClick={handleMyProfileClick}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left 
        text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <User className="h-4 w-4" />
        User profile
      </button>

      <button
        type="button"
        disabled={isSigningOut}
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left 
        text-sm text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
