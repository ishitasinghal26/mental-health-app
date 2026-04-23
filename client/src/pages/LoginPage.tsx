import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import AppLogo from "../components/common/AppLogo";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [gLoading,   setGLoading]   = useState(false);
  const [error,      setError]      = useState("");
  const [unverified, setUnverified] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setUnverified(null);
    if (!email || !password) { setError("Both fields are required."); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.unverified) {
        setUnverified(data.email || email.trim());
      } else {
        setError(data?.message || "Login failed. Please check your credentials.");
      }
    } finally { setLoading(false); }
  }

  async function handleGoogleSuccess(response: any) {
    if (!response?.credential) return;
    setGLoading(true); setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally { setGLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-80 h-80 rounded-full bg-rose-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-[5%] right-[-5%] w-72 h-72 rounded-full bg-pink-200/25 blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass-card-strong p-8">

          {/* Logo */}
          <div className="mb-7">
            <AppLogo height={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-800 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-7">Sign in to continue your wellness journey.</p>

          {/* Unverified email banner */}
          {unverified && (
            <div className="bg-amber-50/80 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-5 animate-fade-in">
              <p className="font-semibold mb-1">📧 Email not verified</p>
              <p className="mb-2">Please verify your email before logging in.</p>
              <button
                onClick={() => navigate("/verify-otp", { state: { email: unverified } })}
                className="text-rose-500 font-bold underline cursor-pointer bg-transparent border-none text-sm p-0"
              >
                Enter verification code →
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50/70 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 animate-fade-in">
              {error}
            </div>
          )}

          {/* Google Sign-In via GoogleLogin component (provides ID token) */}
          <div className="flex justify-center mb-5">
            {gLoading ? (
              <div className="w-full py-3 rounded-2xl border-2 border-white/40 bg-white/50 text-gray-500 text-sm text-center font-semibold">
                Signing in with Google…
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed or was cancelled.")}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="400"
              />
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200/70" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200/70" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="glass-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="glass-input pr-16"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-400 hover:text-rose-600 bg-transparent border-none cursor-pointer"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary py-3 text-sm font-semibold mt-1"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-rose-500 font-bold no-underline hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
