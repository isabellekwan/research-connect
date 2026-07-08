import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const { user, isLoading, loginWithGoogle } = useAuth();

  if (!isLoading && user) {
    return <Navigate to={user.role ? "/dashboard" : "/select-role"} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F5F1] px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#1F6F6B] text-white font-semibold">
            RC
          </div>
          <h1 className="text-xl font-semibold text-slate-900">ResearchConnect</h1>
          <p className="mt-1 text-sm text-slate-500">
            Connecting researchers with participants.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1F6F6B] focus:ring-offset-2"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to ResearchConnect's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.19 7.19 0 0 1 4.9 12c0-.79.14-1.56.37-2.29V6.62H1.29A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
