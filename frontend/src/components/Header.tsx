import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../hooks/useAuth";

export default function Header() {

  const { user,isLoading } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading || !user) {
    return null;
  }

  const dashboardTitle =
    user.role === "researcher"
      ? "Manage Your Research"
      : "Discover Studies";


  return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* <div>
            <h1 className="text-lg font-semibold text-slate-900">{dashboardTitle}</h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
          </div> */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1F6F6B] text-sm font-bold text-white shadow-sm">
                RC
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight">
                  <span className="text-slate-900">Research</span>
                  <span className="text-[#1F6F6B]">Connect</span>
                </p>

                <p className="text-xs font-medium text-slate-500">
                  {dashboardTitle}
                </p>
              </div>
            </div>

            <p className="hidden text-sm text-slate-500 sm:block">
              Welcome back,{" "}
              <span className="font-medium text-slate-700">
                {user.name}
              </span>
            </p>
          </div>
          <div ref={menuContainerRef} className="relative">
            <button
              type="button"
              onClick={()=> setIsUserMenuOpen((current) => !current)}
              >
              <Menu/>
            </button>
            {isUserMenuOpen && (
              <UserMenu onClose={() => setIsUserMenuOpen(false)} />
            )}
          </div>
        </div>
      </header>
  );
}