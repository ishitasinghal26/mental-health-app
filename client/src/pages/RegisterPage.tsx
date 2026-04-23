import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { googleAuthApi } from "../services/authApi";
import AppLogo from "../components/common/AppLogo";

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Email/password form
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Google signup — password setup phase
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [googleProfile,    setGoogleProfile]    = useState<{ name: string; email: string } | null>(null);
  const [googlePw,         setGooglePw]         = useState("");
  const [googlePwConfirm,  setGooglePwConfirm]  = useState("");
  const [gLoading,         setGLoading]         = useState(false);

  function validate() {
    if (!name.trim() || name.trim().length < 2) return "Enter your full name (at least 2 characters).";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const { email: verifyEmail } = await registerUser(name.trim(), email.trim(), password);
      navigate("/verify-otp", { state: { email: verifyEmail } });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  }

  // Step 1: Google button clicked → get credential
  async function handleGoogleSuccess(response: any) {
    if (!response?.credential) return;
    setGLoading(true); setError("");
    try {
      const data = await googleAuthApi(response.credential, { fromRegister: true });
      if (data.needsPassword) {
        // New user — show password setup form
        setGoogleCredential(response.credential);
        setGoogleProfile(data.profile ?? null);

      } else if (data.token) {
        // Edge case: user already existed but backend returned token anyway
        await loginWithGoogle(response.credential);
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Google sign-in failed.";
      setError(msg);
    } finally { setGLoading(false); }
  }

  // Step 2: User submits password for Google account
  async function handleGooglePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!googlePw || googlePw.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (googlePw !== googlePwConfirm) { setError("Passwords do not match."); return; }
    setGLoading(true); setError("");
    try {
      // Single call — creates user in DB only now, with the password
      await loginWithGoogle(googleCredential!, { password: googlePw, fromRegister: true });
      navigate("/assessment", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Account creation failed.");
    } finally { setGLoading(false); }
  }

  // ── Google password setup phase ──
  if (googleProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl animate-float" />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="glass-card-strong p-8">
            <div className="mb-6">
              <AppLogo height={40} />
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{googleProfile.name}</p>
                <p className="text-xs text-gray-500">{googleProfile.email}</p>
              </div>
            </div>

            <h1 className="text-xl font-black text-gray-800 mb-1">Set a profile password</h1>
            <p className="text-sm text-gray-500 mb-6">This lets you also sign in with email + password as a backup.</p>

            {error && <div className="bg-red-50/70 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleGooglePasswordSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input id="google-pw" type="password" value={googlePw} onChange={e => setGooglePw(e.target.value)}
                  placeholder="Min. 6 characters" className="glass-input" autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input id="google-pw-confirm" type="password" value={googlePwConfirm} onChange={e => setGooglePwConfirm(e.target.value)}
                  placeholder="Re-enter password" className="glass-input" autoComplete="new-password" />
              </div>
              <button id="google-pw-submit" type="submit" disabled={gLoading}
                className="btn-primary py-3 text-sm font-semibold mt-1">
                {gLoading ? "Creating account…" : "Complete Sign Up →"}
              </button>
              <button type="button" onClick={() => { setGoogleProfile(null); setGoogleCredential(null); setError(""); }}
                className="text-center text-sm text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none">
                ← Go back
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Main registration form ──
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] left-[-5%] w-72 h-72 rounded-full bg-rose-200/30 blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass-card-strong p-8">
          <div className="mb-7">
            <AppLogo height={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-800 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-7">Start your mental wellness journey today.</p>

          {error && <div className="bg-red-50/70 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 animate-fade-in">{error}</div>}

          {/* Google Sign-Up */}
          <div className="flex justify-center mb-5">
            {gLoading ? (
              <div className="w-full py-3 rounded-2xl border-2 border-white/40 bg-white/50 text-gray-500 text-sm text-center font-semibold">Connecting to Google…</div>
            ) : (
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google sign-in was cancelled or failed.")}
                theme="outline" size="large" text="signup_with" shape="rectangular" width="400" />
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200/70" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200/70" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input id="register-name" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" className="glass-input" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="glass-input" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input id="register-password" type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="glass-input pr-16" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-400 hover:text-rose-600 bg-transparent border-none cursor-pointer">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input id="register-confirm" type={showPass ? "text" : "password"} value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
                className="glass-input" autoComplete="new-password" />
            </div>
            <button id="register-submit" type="submit" disabled={loading}
              className="btn-primary py-3 text-sm font-semibold mt-1">
              {loading ? "Sending OTP…" : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 font-bold no-underline hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
