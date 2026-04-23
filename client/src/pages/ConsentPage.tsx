import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ConsentPage() {
  const navigate = useNavigate();
  const { saveConsent } = useAuth();
  const [selected, setSelected] = useState<boolean | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleContinue() {
    if (selected === null) { setError("Please choose an option to continue."); return; }
    setLoading(true);
    try {
      await saveConsent(selected);
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-80 h-80 rounded-full bg-rose-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-[5%] left-[-5%] w-72 h-72 rounded-full bg-pink-300/20 blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <div className="glass-card-strong p-10 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-black text-gray-800 mb-3">Enable AI-Powered Insights?</h1>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
            MindKare can use your assessment results to personalise your chatbot responses,
            recommendations, and dashboard insights. Your data stays <strong>on your device</strong> and
            is never shared with third parties.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* YES */}
            <button
              id="consent-yes"
              onClick={() => { setSelected(true); setError(""); }}
              className={`relative glass-card p-6 text-left cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02]
                ${selected === true
                  ? "border-rose-400 bg-rose-50/50 shadow-xl shadow-rose-100/50"
                  : "border-white/30 hover:border-rose-300"}`}
            >
              {selected === true && <span className="absolute top-3 right-4 text-rose-500 font-black text-lg">✓</span>}
              <div className="text-3xl mb-3">✨</div>
              <div className="font-bold text-gray-800 mb-2">Yes, enable AI insights</div>
              <div className="text-sm text-gray-500 leading-relaxed">
                Your chatbot will reference your DASS results and mood history to give personalised, context-aware support.
              </div>
            </button>

            {/* NO */}
            <button
              id="consent-no"
              onClick={() => { setSelected(false); setError(""); }}
              className={`relative glass-card p-6 text-left cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02]
                ${selected === false
                  ? "border-green-400 bg-green-50/50 shadow-xl shadow-green-100/50"
                  : "border-white/30 hover:border-green-300"}`}
            >
              {selected === false && <span className="absolute top-3 right-4 text-green-500 font-black text-lg">✓</span>}
              <div className="text-3xl mb-3">🔒</div>
              <div className="font-bold text-gray-800 mb-2">No, keep it private</div>
              <div className="text-sm text-gray-500 leading-relaxed">
                Your chatbot will still work, but without personal assessment context. You can change this anytime from Profile.
              </div>
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

          <button
            id="consent-continue"
            onClick={handleContinue}
            disabled={loading || selected === null}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? "Saving…" : "Continue to Dashboard →"}
          </button>

          <p className="text-xs text-gray-400 mt-4">
            You can change your preference at any time from <strong>Profile → AI Settings</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
