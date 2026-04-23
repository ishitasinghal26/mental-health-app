import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resendOtpApi } from "../services/authApi";
import AppLogo from "../components/common/AppLogo";

export default function OtpVerifyPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { verifyOtp } = useAuth();

  // Email passed via state from RegisterPage
  const email = (location.state as any)?.email || "";

  const [digits,    setDigits]  = useState<string[]>(["","","","","",""]);
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState("");
  const [success,   setSuccess] = useState("");
  const [cooldown,  setCooldown]= useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email (accessed directly)
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function handleDigit(idx: number, val: string) {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError("");
    // Auto-advance
    if (clean && idx < 5) inputRefs.current[idx + 1]?.focus();
    // Auto-submit when all 6 filled
    if (clean && idx === 5) {
      const code = [...next].join("");
      if (code.length === 6) submit(code);
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (text.length === 6) {
      const arr = text.split("");
      setDigits(arr);
      inputRefs.current[5]?.focus();
      submit(text);
    }
  }

  async function submit(code?: string) {
    const otp = code || digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true); setError("");
    try {
      await verifyOtp(email, otp);
      navigate("/assessment", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Incorrect OTP. Please try again.";
      setError(msg);
      setDigits(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(""); setSuccess("");
    try {
      await resendOtpApi(email);
      setSuccess("A new OTP has been sent to your email.");
      setCooldown(60);
      setDigits(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-80 h-80 rounded-full bg-rose-200/35 blur-3xl animate-float" />
        <div className="absolute bottom-[5%] right-[-5%] w-72 h-72 rounded-full bg-pink-200/30 blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass-card-strong p-8">

          {/* Logo */}
          <div className="mb-7">
            <AppLogo height={40} />
          </div>

          <div className="text-center mb-7">
            <div className="text-5xl mb-3 emoji-bounce">📩</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">Check your email</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          {/* OTP Boxes */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm
                  ${d ? "border-rose-400 text-rose-600" : "border-white/40 text-gray-800"}
                  focus:border-rose-400 focus:ring-2 focus:ring-rose-200`}
                style={{ WebkitAppearance: "none" }}
              />
            ))}
          </div>

          {/* Errors / Success */}
          {error   && <p className="text-center text-sm text-red-500 font-medium mb-4 animate-fade-in">{error}</p>}
          {success && <p className="text-center text-sm text-emerald-600 font-medium mb-4 animate-fade-in">{success}</p>}

          {/* Verify button */}
          <button
            id="otp-verify-btn"
            onClick={() => submit()}
            disabled={loading || digits.join("").length < 6}
            className="btn-primary w-full py-3 text-sm font-semibold mb-4"
          >
            {loading ? "Verifying…" : "Verify Email"}
          </button>

          {/* Resend */}
          <div className="text-center text-sm text-gray-500">
            Didn't receive it?{" "}
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`font-bold no-underline cursor-pointer bg-transparent border-none transition-colors
                ${cooldown > 0 ? "text-gray-400" : "text-rose-500 hover:underline"}`}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-5">
            Wrong email?{" "}
            <Link to="/register" className="text-rose-500 font-bold no-underline hover:underline">
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
