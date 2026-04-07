import React, { useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";

/* ── Mock Data ── */
type Therapist = {
  id: number;
  name: string;
  credentials: string;
  specialty: string[];
  approach: string[];
  languages: string[];
  experience: number;
  rating: number;
  reviews: number;
  bio: string;
  sessionTypes: string[];
  pricePerSession: number;
  availability: string;
  emoji: string;
  bookingUrl: string;
  badge?: string;
};

const THERAPISTS: Therapist[] = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    credentials: "PhD, Clinical Psychology | Licensed Psychologist",
    specialty: ["Anxiety", "Depression", "Trauma"],
    approach: ["CBT", "Mindfulness-based", "Schema Therapy"],
    languages: ["English", "Hindi"],
    experience: 12,
    rating: 4.9,
    reviews: 214,
    bio: "Dr. Sharma specialises in evidence-based therapies for anxiety, depression, and trauma recovery. With over 12 years of clinical experience, she creates a warm, non-judgemental space for clients to heal and grow.",
    sessionTypes: ["Video", "In-person"],
    pricePerSession: 1800,
    availability: "Mon–Fri, 9 AM–6 PM",
    emoji: "👩‍⚕️",
    bookingUrl: "https://calendly.com",
    badge: "Top Rated",
  },
  {
    id: 2,
    name: "Dr. Arjun Mehta",
    credentials: "MD, Psychiatry | MBBS",
    specialty: ["Stress", "Sleep Disorders", "Burnout"],
    approach: ["ACT", "Psychodynamic", "DBT"],
    languages: ["English", "Marathi"],
    experience: 9,
    rating: 4.8,
    reviews: 176,
    bio: "Dr. Mehta is a psychiatrist focusing on stress management, sleep optimisation, and burnout recovery. He integrates Acceptance and Commitment Therapy with lifestyle medicine for lasting wellbeing.",
    sessionTypes: ["Video", "Chat"],
    pricePerSession: 2200,
    availability: "Tue–Sat, 10 AM–7 PM",
    emoji: "👨‍⚕️",
    bookingUrl: "https://calendly.com",
  },
  {
    id: 3,
    name: "Ms. Kavitha Nair",
    credentials: "M.Sc. Counselling Psychology | RCI Certified",
    specialty: ["Relationships", "Self-esteem", "Grief"],
    approach: ["Person-centred", "EFT", "Narrative Therapy"],
    languages: ["English", "Malayalam", "Tamil"],
    experience: 7,
    rating: 4.9,
    reviews: 132,
    bio: "Kavitha brings compassion and deep listening to help clients navigate relationship challenges, grief, and self-esteem issues. She uses emotionally-focused techniques to help people reconnect with their authentic selves.",
    sessionTypes: ["Video", "Chat", "In-person"],
    pricePerSession: 1200,
    availability: "Mon–Thu, 8 AM–5 PM",
    emoji: "🧑‍⚕️",
    bookingUrl: "https://calendly.com",
    badge: "3 languages",
  },
  {
    id: 4,
    name: "Dr. Rohan Kapoor",
    credentials: "PhD, Neuropsychology | M.Phil Clinical",
    specialty: ["OCD", "Phobias", "ADHD"],
    approach: ["ERP", "CBT", "Behavioural Activation"],
    languages: ["English", "Punjabi"],
    experience: 14,
    rating: 4.7,
    reviews: 89,
    bio: "Dr. Kapoor specialises in OCD, phobias, and ADHD using cutting-edge Exposure and Response Prevention therapy. His structured, data-driven approach consistently delivers measurable results.",
    sessionTypes: ["Video", "In-person"],
    pricePerSession: 2500,
    availability: "Wed–Sun, 11 AM–8 PM",
    emoji: "👨‍🔬",
    bookingUrl: "https://calendly.com",
  },
  {
    id: 5,
    name: "Ms. Ananya Reddy",
    credentials: "MA, Counselling | Certified Mindfulness Instructor",
    specialty: ["Mindfulness", "Young Adults", "Career Stress"],
    approach: ["MBCT", "Solution-focused", "Positive Psychology"],
    languages: ["English", "Telugu"],
    experience: 5,
    rating: 4.8,
    reviews: 98,
    bio: "Ananya works primarily with young adults navigating career stress, life transitions, and identity questions. She blends mindfulness-based cognitive therapy with a strength-based, futures-focused approach.",
    sessionTypes: ["Video", "Chat"],
    pricePerSession: 900,
    availability: "Mon–Fri, 6 PM–10 PM",
    emoji: "👩‍💼",
    bookingUrl: "https://calendly.com",
    badge: "Best for Students",
  },
  {
    id: 6,
    name: "Dr. Sameer Joshi",
    credentials: "PhD, Clinical Psychology | Trauma Specialist",
    specialty: ["PTSD", "Complex Trauma", "Men's Mental Health"],
    approach: ["EMDR", "Trauma-focused CBT", "Somatic Therapy"],
    languages: ["English", "Marathi", "Hindi"],
    experience: 11,
    rating: 4.6,
    reviews: 61,
    bio: "Dr. Joshi is a certified EMDR therapist with a focus on trauma and men's mental health. He provides a culturally aware, non-stigmatising space for men to address emotional challenges they often struggle to verbalise.",
    sessionTypes: ["Video", "In-person"],
    pricePerSession: 2000,
    availability: "Mon, Wed, Fri, 3 PM–9 PM",
    emoji: "🧑‍💼",
    bookingUrl: "https://calendly.com",
    badge: "EMDR Certified",
  },
  {
    id: 7,
    name: "Ms. Pallavi Singh",
    credentials: "M.Sc. Applied Psychology | Child & Family Therapist",
    specialty: ["Children", "Parenting", "Family Conflict"],
    approach: ["Play Therapy", "Family Systems", "CBT"],
    languages: ["English", "Hindi"],
    experience: 8,
    rating: 4.9,
    reviews: 153,
    bio: "Pallavi specialises in child and family therapy, helping families build stronger communication, manage conflict, and support children through emotional and behavioural challenges with warmth and evidence-based play techniques.",
    sessionTypes: ["Video", "In-person"],
    pricePerSession: 1500,
    availability: "Tue–Sat, 9 AM–6 PM",
    emoji: "👩‍🏫",
    bookingUrl: "https://calendly.com",
    badge: "Family Specialist",
  },
  {
    id: 8,
    name: "Dr. Vikram Bose",
    credentials: "MD, Psychiatry | Geriatric Mental Health",
    specialty: ["Elderly Care", "Dementia Support", "Late-life Depression"],
    approach: ["Reminiscence Therapy", "CBT", "Pharmacotherapy"],
    languages: ["English", "Bengali"],
    experience: 16,
    rating: 4.7,
    reviews: 44,
    bio: "Dr. Bose is one of India's few geriatric psychiatrists, helping elderly patients and their caregivers manage dementia, late-life depression, and the emotional toll of ageing. He brings patience, expertise, and dignity to every session.",
    sessionTypes: ["Video", "In-person"],
    pricePerSession: 2800,
    availability: "Mon–Thu, 10 AM–5 PM",
    emoji: "👴",
    bookingUrl: "https://calendly.com",
  },
];

const ALL_SPECIALTIES = [...new Set(THERAPISTS.flatMap(t => t.specialty))].sort();
const ALL_APPROACHES  = [...new Set(THERAPISTS.flatMap(t => t.approach))].sort();
const SESSION_TYPES   = ["Video", "In-person", "Chat"];

const SESSION_ICON: Record<string, string> = {
  Video: "🎥", "In-person": "🏥", Chat: "💬",
};

type Filters = {
  specialty: string;
  approach: string;
  sessionType: string;
  maxPrice: string;
};

export default function TherapistsPage() {
  const [filters, setFilters] = useState<Filters>({
    specialty: "", approach: "", sessionType: "", maxPrice: "",
  });
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Therapist | null>(null);
  const [sortBy, setSortBy]         = useState<"rating" | "price_asc" | "price_desc" | "experience">("rating");

  const filtered = THERAPISTS.filter(t => {
    if (filters.specialty  && !t.specialty.includes(filters.specialty))   return false;
    if (filters.approach   && !t.approach.includes(filters.approach))     return false;
    if (filters.sessionType && !t.sessionTypes.includes(filters.sessionType)) return false;
    if (filters.maxPrice   && t.pricePerSession > Number(filters.maxPrice)) return false;
    if (search && ![t.name, ...t.specialty, ...t.approach].join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "rating")       return b.rating - a.rating;
    if (sortBy === "price_asc")    return a.pricePerSession - b.pricePerSession;
    if (sortBy === "price_desc")   return b.pricePerSession - a.pricePerSession;
    if (sortBy === "experience")   return b.experience - a.experience;
    return 0;
  });

  function stars(rating: number) {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  }

  return (
    <div style={page}>
      <AppNavbar />
      <div style={container}>

        {/* ── Header ── */}
        <div style={pageHeader}>
          <div>
            <h1 style={pageTitle}>🩺 Connect with a Therapist</h1>
            <p style={pageSub}>Browse licensed mental health professionals. All prices in ₹ per 50-min session.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "0.6rem 1rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>⚕️ MindKare does not provide medical services. Sessions are booked directly with therapists.</span>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={filterCard}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, specialty, approach…"
            style={searchInput}
          />
          <select style={selectStyle} value={filters.specialty} onChange={e => setFilters(f => ({ ...f, specialty: e.target.value }))}>
            <option value="">All Specialties</option>
            {ALL_SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={selectStyle} value={filters.approach} onChange={e => setFilters(f => ({ ...f, approach: e.target.value }))}>
            <option value="">All Approaches</option>
            {ALL_APPROACHES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={selectStyle} value={filters.sessionType} onChange={e => setFilters(f => ({ ...f, sessionType: e.target.value }))}>
            <option value="">All Session Types</option>
            {SESSION_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={selectStyle} value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}>
            <option value="">Any Price</option>
            <option value="1000">Under ₹1000</option>
            <option value="1500">Under ₹1500</option>
            <option value="2000">Under ₹2000</option>
            <option value="2500">Under ₹2500</option>
          </select>
          <select style={{ ...selectStyle, borderColor: "#c7d2fe", color: "#4338ca" }} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="rating">Sort: Top Rated</option>
            <option value="price_asc">Sort: Price ↑</option>
            <option value="price_desc">Sort: Price ↓</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "0.83rem" }}>{filtered.length} therapist{filtered.length !== 1 ? "s" : ""} found</p>

        {/* ── Therapist Grid ── */}
        {filtered.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: 44 }}>🔍</div>
            <p>No therapists match your filters. Try adjusting them!</p>
          </div>
        ) : (
          <div style={grid}>
            {filtered.map(t => (
              <div key={t.id} style={therapistCard} onClick={() => setSelected(t)}>
                {/* Badge */}
                {t.badge && <div style={badgePill}>{t.badge}</div>}

                {/* Avatar + name */}
                <div style={cardTop}>
                  <div style={avatar}>{t.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={therapistName}>{t.name}</div>
                    <div style={credText}>{t.credentials}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.4rem" }}>
                      <span style={{ color: "#f59e0b", fontSize: "0.82rem" }}>{stars(t.rating)}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151" }}>{t.rating}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>({t.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div style={tagRow}>
                  {t.specialty.map(s => <span key={s} style={specPill}>{s}</span>)}
                </div>

                {/* Approach */}
                <div style={tagRow}>
                  {t.approach.slice(0, 2).map(a => <span key={a} style={approachPill}>{a}</span>)}
                  {t.approach.length > 2 && <span style={{ ...approachPill, background: "#f3f4f6", color: "#9ca3af" }}>+{t.approach.length - 2}</span>}
                </div>

                {/* Meta row */}
                <div style={metaRow}>
                  <span>🏅 {t.experience} yrs</span>
                  <span>🌐 {t.languages.join(", ")}</span>
                </div>

                {/* Session types */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {t.sessionTypes.map(s => (
                    <span key={s} style={sessionPill}>{SESSION_ICON[s]} {s}</span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div style={cardBottom}>
                  <div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#6366f1" }}>₹{t.pricePerSession.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>per session</div>
                  </div>
                  <button style={bookBtn} onClick={e => { e.stopPropagation(); window.open(t.bookingUrl, "_blank"); }}>
                    Book Session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Therapist Detail Modal ── */}
      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setSelected(null)}>✕</button>

            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <div style={{ ...avatar, width: 70, height: 70, fontSize: 36 }}>{selected.emoji}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>{selected.name}</h2>
                <p style={{ color: "#6b7280", fontSize: "0.84rem", margin: "4px 0" }}>{selected.credentials}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ color: "#f59e0b" }}>{stars(selected.rating)}</span>
                  <span style={{ fontWeight: 700, color: "#374151" }}>{selected.rating}</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>({selected.reviews} reviews)</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#6366f1" }}>₹{selected.pricePerSession.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>per 50-min session</div>
              </div>
            </div>

            <p style={{ color: "#374151", fontSize: "0.92rem", lineHeight: 1.7, margin: "0 0 1.25rem" }}>{selected.bio}</p>

            <div style={detailGrid}>
              <DetailItem icon="🎯" label="Specialisation" value={selected.specialty.join(", ")} />
              <DetailItem icon="🧪" label="Therapeutic Approach" value={selected.approach.join(", ")} />
              <DetailItem icon="🌐" label="Languages" value={selected.languages.join(", ")} />
              <DetailItem icon="🏅" label="Experience" value={`${selected.experience} years`} />
              <DetailItem icon="📅" label="Availability" value={selected.availability} />
              <DetailItem icon="🎥" label="Session Types" value={selected.sessionTypes.join(", ")} />
            </div>

            <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "#fef3c7", borderRadius: 10, fontSize: "0.8rem", color: "#92400e", border: "1px solid #fde68a" }}>
              ⚕️ <strong>Disclaimer:</strong> MindKare is not a medical provider. Clicking "Book Session" will redirect you to the therapist's independent booking page.
            </div>

            <button
              style={{ ...bookBtn, width: "100%", marginTop: "1.1rem", padding: "0.9rem", fontSize: "1rem" }}
              onClick={() => window.open(selected.bookingUrl, "_blank")}
            >
              Book a Session with {selected.name.split(" ")[1]} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 12, padding: "0.85rem 1rem", border: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.88rem" }}>{value}</div>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties    = { minHeight: "100vh", background: "#f8fafc" };
const container: React.CSSProperties = {
  maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gap: "1.25rem",
};
const pageHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem",
};
const pageTitle: React.CSSProperties  = { fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: 0 };
const pageSub: React.CSSProperties    = { color: "#6b7280", marginTop: 6 };

const filterCard: React.CSSProperties = {
  display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "white",
  borderRadius: 16, padding: "1rem 1.25rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
};
const searchInput: React.CSSProperties = {
  flex: "1 1 200px", padding: "0.6rem 0.9rem", borderRadius: 10,
  border: "1.5px solid #e5e7eb", fontSize: "0.88rem", fontFamily: "inherit",
};
const selectStyle: React.CSSProperties = {
  padding: "0.55rem 0.85rem", borderRadius: 10, border: "1.5px solid #e5e7eb",
  fontSize: "0.84rem", fontFamily: "inherit", background: "white", cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem",
};

const therapistCard: React.CSSProperties = {
  background: "white", borderRadius: 20, padding: "1.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)", cursor: "pointer",
  display: "flex", flexDirection: "column", gap: "0.7rem",
  position: "relative", transition: "transform 0.2s, box-shadow 0.2s",
  border: "1px solid #f0f0f0",
};
const badgePill: React.CSSProperties = {
  position: "absolute", top: 14, right: 14,
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  padding: "0.25rem 0.65rem", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700,
};
const cardTop: React.CSSProperties = { display: "flex", gap: "0.9rem", alignItems: "flex-start" };
const avatar: React.CSSProperties  = {
  width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#eef2ff,#fdf4ff)",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0,
};
const therapistName: React.CSSProperties = { fontWeight: 800, color: "#111827", fontSize: "1rem", lineHeight: 1.25 };
const credText: React.CSSProperties     = { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 };

const tagRow: React.CSSProperties = { display: "flex", gap: "0.35rem", flexWrap: "wrap" };
const specPill: React.CSSProperties = {
  padding: "0.2rem 0.55rem", borderRadius: 99,
  background: "#eef2ff", color: "#4338ca", fontSize: "0.72rem", fontWeight: 700,
};
const approachPill: React.CSSProperties = {
  padding: "0.2rem 0.55rem", borderRadius: 99,
  background: "#fdf4ff", color: "#9333ea", fontSize: "0.72rem", fontWeight: 600,
};
const sessionPill: React.CSSProperties = {
  padding: "0.2rem 0.6rem", borderRadius: 99,
  background: "#f0fdf4", color: "#065f46", fontSize: "0.72rem", fontWeight: 600,
};
const metaRow: React.CSSProperties = {
  display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#6b7280", fontWeight: 500,
};
const cardBottom: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginTop: "0.25rem", paddingTop: "0.85rem", borderTop: "1px solid #f5f5f5",
};
const bookBtn: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white", border: "none", borderRadius: 12, fontWeight: 700,
  fontSize: "0.88rem", cursor: "pointer",
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(4px)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
};
const modal: React.CSSProperties = {
  background: "white", borderRadius: 24, width: "100%", maxWidth: 720,
  maxHeight: "90vh", overflowY: "auto", padding: "2rem",
  boxShadow: "0 32px 80px rgba(0,0,0,0.18)", position: "relative",
};
const closeBtn: React.CSSProperties = {
  position: "absolute", top: 16, right: 16,
  background: "#f3f4f6", border: "none", borderRadius: 8,
  width: 32, height: 32, cursor: "pointer", fontWeight: 700, color: "#6b7280",
};
const detailGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.65rem",
};
const emptyState: React.CSSProperties = {
  textAlign: "center", padding: "3rem", background: "white", borderRadius: 20,
  color: "#9ca3af", fontSize: "0.9rem",
  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};
