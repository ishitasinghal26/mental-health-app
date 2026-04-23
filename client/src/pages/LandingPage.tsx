import { Link } from "react-router-dom";
import AppLogo from "../components/common/AppLogo";

const FEATURES = [
  { icon: "🧠", title: "DASS-21 Assessment", desc: "Clinically validated depression, anxiety & stress screening personalised to you." },
  { icon: "💭", title: "Daily Mood Tracking", desc: "Log your emotions and visualise how your mood shifts over time." },
  { icon: "📓", title: "Guided Journaling", desc: "Thoughtful prompts that help you process feelings and reflect clearly." },
  { icon: "🎯", title: "Wellness Activities", desc: "Breathing, meditation, grounding, and focus exercises — on demand." },
  { icon: "🤖", title: "AI Companion", desc: "A warm, personalised chatbot that listens and responds to your unique context." },
  { icon: "🩺", title: "Find Therapists", desc: "Browse local mental health professionals when you're ready for extra support." },
];

const STEPS = [
  { n: "01", title: "Create your account", desc: "Sign up in seconds — no credit card needed." },
  { n: "02", title: "Take the assessment", desc: "Complete the DASS-21 to get your personalised wellness baseline." },
  { n: "03", title: "Start your journey", desc: "Track moods, journal, do activities and chat with your AI companion." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">

      {/* Floating background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-rose-200/35 blur-3xl animate-float" />
        <div className="absolute top-[30%] right-[-8%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl animate-float-2" />
        <div className="absolute bottom-[10%] left-[20%] w-72 h-72 rounded-full bg-orange-100/30 blur-3xl animate-float-3" />
        <div className="absolute bottom-[-5%] right-[10%] w-64 h-64 rounded-full bg-peach/30 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/25 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center">
            <AppLogo height={32} />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm px-5 py-2 no-underline">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2 no-underline">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center gap-6 animate-fade-in">
        <span className="badge text-sm px-4 py-1.5 bg-rose-50/60 text-rose-600 border-rose-200/50">
          Your mental wellness companion
        </span>
        <h1 className="text-5xl md:text-6xl font-black text-gray-800 leading-tight max-w-3xl">
          A softer place to{" "}
          <span className="gradient-text">take care of your mind</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
          Track your mood, journal your thoughts, and get personalised guidance — all in a calm, private space built around you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link to="/register" className="btn-primary px-8 py-3 text-base no-underline">Begin your journey →</Link>
          <Link to="/login"    className="btn-secondary px-8 py-3 text-base no-underline">Sign in</Link>
        </div>
        {/* Hero cards preview */}
        <div className="grid grid-cols-3 gap-3 mt-10 max-w-lg w-full">
          {[
            { icon: "💭", label: "Mood tracked", val: "Today" },
            { icon: "🔥", label: "Day streak",   val: "7" },
            { icon: "📊", label: "Wellness",      val: "82%" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex flex-col items-center gap-1">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-black text-gray-800 text-lg">{s.val}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-800">Everything you need to feel better</h2>
          <p className="text-gray-500 mt-2">Science-backed tools wrapped in a warm, intuitive experience.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card p-6 flex flex-col gap-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-gray-800 text-base">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-800">Simple to start, meaningful every day</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(s => (
            <div key={s.n} className="glass-card p-7 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {s.n}
              </div>
              <h3 className="font-bold text-gray-800">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy section ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Your privacy, always protected</h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            MindKare never sells or shares your data. All AI features are opt-in, and you can use the app in fully private mode at any time.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-gray-800 mb-4">
          Ready to start feeling <span className="gradient-text">better?</span>
        </h2>
        <p className="text-gray-500 mb-8 text-lg">Join thousands of people on their mental wellness journey.</p>
        <Link to="/register" className="btn-primary px-10 py-4 text-base no-underline">Start for free →</Link>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/25 bg-white/10 backdrop-blur-md py-8 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AppLogo height={28} />
        </div>
        <p>© 2025 MindKare — Your mental wellness companion</p>
      </footer>
    </div>
  );
}
