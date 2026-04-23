import { useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";

type Therapist = {
  id:number; name:string; credentials:string; specialty:string[]; approach:string[];
  languages:string[]; experience:number; rating:number; reviews:number; bio:string;
  sessionTypes:string[]; pricePerSession:number; availability:string; emoji:string;
  bookingUrl:string; badge?:string;
};

const THERAPISTS: Therapist[] = [
  { id:1, name:"Dr. Priya Sharma", credentials:"PhD, Clinical Psychology | Licensed Psychologist", specialty:["Anxiety","Depression","Trauma"], approach:["CBT","Mindfulness-based","Schema Therapy"], languages:["English","Hindi"], experience:12, rating:4.9, reviews:214, bio:"Dr. Sharma specialises in evidence-based therapies for anxiety, depression, and trauma recovery. With over 12 years of clinical experience, she creates a warm, non-judgemental space for clients to heal and grow.", sessionTypes:["Video","In-person"], pricePerSession:1800, availability:"Mon–Fri, 9 AM–6 PM", emoji:"👩‍⚕️", bookingUrl:"https://calendly.com", badge:"Top Rated" },
  { id:2, name:"Dr. Arjun Mehta", credentials:"MD, Psychiatry | MBBS", specialty:["Stress","Sleep Disorders","Burnout"], approach:["ACT","Psychodynamic","DBT"], languages:["English","Marathi"], experience:9, rating:4.8, reviews:176, bio:"Dr. Mehta is a psychiatrist focusing on stress management, sleep optimisation, and burnout recovery. He integrates Acceptance and Commitment Therapy with lifestyle medicine for lasting wellbeing.", sessionTypes:["Video","Chat"], pricePerSession:2200, availability:"Tue–Sat, 10 AM–7 PM", emoji:"👨‍⚕️", bookingUrl:"https://calendly.com" },
  { id:3, name:"Ms. Kavitha Nair", credentials:"M.Sc. Counselling Psychology | RCI Certified", specialty:["Relationships","Self-esteem","Grief"], approach:["Person-centred","EFT","Narrative Therapy"], languages:["English","Malayalam","Tamil"], experience:7, rating:4.9, reviews:132, bio:"Kavitha brings compassion and deep listening to help clients navigate relationship challenges, grief, and self-esteem issues.", sessionTypes:["Video","Chat","In-person"], pricePerSession:1200, availability:"Mon–Thu, 8 AM–5 PM", emoji:"🧑‍⚕️", bookingUrl:"https://calendly.com", badge:"3 languages" },
  { id:4, name:"Dr. Rohan Kapoor", credentials:"PhD, Neuropsychology | M.Phil Clinical", specialty:["OCD","Phobias","ADHD"], approach:["ERP","CBT","Behavioural Activation"], languages:["English","Punjabi"], experience:14, rating:4.7, reviews:89, bio:"Dr. Kapoor specialises in OCD, phobias, and ADHD using cutting-edge Exposure and Response Prevention therapy.", sessionTypes:["Video","In-person"], pricePerSession:2500, availability:"Wed–Sun, 11 AM–8 PM", emoji:"👨‍🔬", bookingUrl:"https://calendly.com" },
  { id:5, name:"Ms. Ananya Reddy", credentials:"MA, Counselling | Certified Mindfulness Instructor", specialty:["Mindfulness","Young Adults","Career Stress"], approach:["MBCT","Solution-focused","Positive Psychology"], languages:["English","Telugu"], experience:5, rating:4.8, reviews:98, bio:"Ananya works primarily with young adults navigating career stress, life transitions, and identity questions.", sessionTypes:["Video","Chat"], pricePerSession:900, availability:"Mon–Fri, 6 PM–10 PM", emoji:"👩‍💼", bookingUrl:"https://calendly.com", badge:"Best for Students" },
  { id:6, name:"Dr. Sameer Joshi", credentials:"PhD, Clinical Psychology | Trauma Specialist", specialty:["PTSD","Complex Trauma","Men's Mental Health"], approach:["EMDR","Trauma-focused CBT","Somatic Therapy"], languages:["English","Marathi","Hindi"], experience:11, rating:4.6, reviews:61, bio:"Dr. Joshi is a certified EMDR therapist with a focus on trauma and men's mental health.", sessionTypes:["Video","In-person"], pricePerSession:2000, availability:"Mon, Wed, Fri, 3 PM–9 PM", emoji:"🧑‍💼", bookingUrl:"https://calendly.com", badge:"EMDR Certified" },
  { id:7, name:"Ms. Pallavi Singh", credentials:"M.Sc. Applied Psychology | Child & Family Therapist", specialty:["Children","Parenting","Family Conflict"], approach:["Play Therapy","Family Systems","CBT"], languages:["English","Hindi"], experience:8, rating:4.9, reviews:153, bio:"Pallavi specialises in child and family therapy, helping families build stronger communication and manage conflict.", sessionTypes:["Video","In-person"], pricePerSession:1500, availability:"Tue–Sat, 9 AM–6 PM", emoji:"👩‍🏫", bookingUrl:"https://calendly.com", badge:"Family Specialist" },
  { id:8, name:"Dr. Vikram Bose", credentials:"MD, Psychiatry | Geriatric Mental Health", specialty:["Elderly Care","Dementia Support","Late-life Depression"], approach:["Reminiscence Therapy","CBT","Pharmacotherapy"], languages:["English","Bengali"], experience:16, rating:4.7, reviews:44, bio:"Dr. Bose is one of India's few geriatric psychiatrists, helping elderly patients manage dementia, late-life depression, and the emotional toll of ageing.", sessionTypes:["Video","In-person"], pricePerSession:2800, availability:"Mon–Thu, 10 AM–5 PM", emoji:"👴", bookingUrl:"https://calendly.com" },
];

const ALL_SPECIALTIES = [...new Set(THERAPISTS.flatMap(t=>t.specialty))].sort();
const ALL_APPROACHES  = [...new Set(THERAPISTS.flatMap(t=>t.approach))].sort();
const SESSION_TYPES   = ["Video","In-person","Chat"];
const SESSION_ICON: Record<string,string> = { Video:"🎥", "In-person":"🏥", Chat:"💬" };

type Filters = { specialty:string; approach:string; sessionType:string; maxPrice:string };

export default function TherapistsPage() {
  const [filters,  setFilters]  = useState<Filters>({ specialty:"", approach:"", sessionType:"", maxPrice:"" });
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Therapist|null>(null);
  const [sortBy,   setSortBy]   = useState<"rating"|"price_asc"|"price_desc"|"experience">("rating");

  const filtered = THERAPISTS.filter(t => {
    if(filters.specialty  && !t.specialty.includes(filters.specialty))    return false;
    if(filters.approach   && !t.approach.includes(filters.approach))      return false;
    if(filters.sessionType && !t.sessionTypes.includes(filters.sessionType)) return false;
    if(filters.maxPrice   && t.pricePerSession>Number(filters.maxPrice))  return false;
    if(search && ![t.name,...t.specialty,...t.approach].join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b) => {
    if(sortBy==="rating")      return b.rating-a.rating;
    if(sortBy==="price_asc")   return a.pricePerSession-b.pricePerSession;
    if(sortBy==="price_desc")  return b.pricePerSession-a.pricePerSession;
    if(sortBy==="experience")  return b.experience-a.experience;
    return 0;
  });

  const stars = (r:number) => "★".repeat(Math.round(r))+"☆".repeat(5-Math.round(r));

  const selectCls = "glass-input text-sm py-2 px-3 cursor-pointer";

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">🩺 Connect with a Therapist</h1>
            <p className="text-gray-500 mt-1">Browse licensed mental health professionals. All prices in ₹ per 50-min session.</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-semibold max-w-xs">
            ⚕️ MindKare does not provide medical services. Sessions are booked directly with therapists.
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-5 flex flex-wrap gap-3 items-center">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, specialty, approach…" className="glass-input text-sm flex-1 min-w-40"/>
          <select className={selectCls} value={filters.specialty} onChange={e=>setFilters(f=>({...f,specialty:e.target.value}))}>
            <option value="">All Specialties</option>
            {ALL_SPECIALTIES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={filters.approach} onChange={e=>setFilters(f=>({...f,approach:e.target.value}))}>
            <option value="">All Approaches</option>
            {ALL_APPROACHES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={filters.sessionType} onChange={e=>setFilters(f=>({...f,sessionType:e.target.value}))}>
            <option value="">All Session Types</option>
            {SESSION_TYPES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={filters.maxPrice} onChange={e=>setFilters(f=>({...f,maxPrice:e.target.value}))}>
            <option value="">Any Price</option>
            <option value="1000">Under ₹1000</option>
            <option value="1500">Under ₹1500</option>
            <option value="2000">Under ₹2000</option>
            <option value="2500">Under ₹2500</option>
          </select>
          <select className={selectCls} value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="experience">Experience</option>
          </select>
        </div>

        <p className="text-sm text-gray-400">{filtered.length} therapist{filtered.length!==1?"s":""} found</p>

        {/* Grid */}
        {filtered.length===0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-2 text-gray-400">
            <span className="text-5xl">🔍</span><p>No therapists match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(t => (
              <div key={t.id} onClick={()=>setSelected(t)}
                className="glass-card p-6 flex flex-col gap-3 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative">
                {t.badge && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-300 to-pink-300 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{t.badge}</div>
                )}
                <div className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-3xl shrink-0">{t.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-800 text-sm leading-snug">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{t.credentials}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-amber-400 text-xs">{stars(t.rating)}</span>
                      <span className="font-bold text-xs text-gray-700">{t.rating}</span>
                      <span className="text-xs text-gray-400">({t.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {t.specialty.map(s=><span key={s} className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100/60 text-rose-600">{s}</span>)}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {t.approach.slice(0,2).map(a=><span key={a} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100/60 text-pink-700">{a}</span>)}
                  {t.approach.length>2 && <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 text-gray-400">+{t.approach.length-2}</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>🏅 {t.experience} yrs</span>
                  <span>🌐 {t.languages.join(", ")}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {t.sessionTypes.map(s=><span key={s} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100/60 text-green-700">{SESSION_ICON[s]} {s}</span>)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <div>
                    <div className="text-lg font-black gradient-text">₹{t.pricePerSession.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-gray-400">per session</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();window.open(t.bookingUrl,"_blank");}} className="btn-primary text-xs px-4 py-2">Book →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="glass-card-strong p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 text-gray-500 text-sm font-bold border border-white/30 cursor-pointer hover:bg-white/60">✕</button>
            <div className="flex gap-5 items-start flex-wrap mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-4xl shrink-0">{selected.emoji}</div>
              <div className="flex-1">
                <h2 className="font-black text-gray-800 text-xl">{selected.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selected.credentials}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-amber-400">{stars(selected.rating)}</span>
                  <span className="font-bold text-gray-700 text-sm">{selected.rating}</span>
                  <span className="text-xs text-gray-400">({selected.reviews} reviews)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black gradient-text">₹{selected.pricePerSession.toLocaleString("en-IN")}</div>
                <div className="text-xs text-gray-400">per 50-min session</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{selected.bio}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[["🎯","Specialisation",selected.specialty.join(", ")],["🧪","Approach",selected.approach.join(", ")],["🌐","Languages",selected.languages.join(", ")],["🏅","Experience",`${selected.experience} years`],["📅","Availability",selected.availability],["🎥","Session Types",selected.sessionTypes.join(", ")]].map(([icon,label,val])=>(
                <div key={label as string} className="bg-white/30 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{icon} {label}</div>
                  <div className="font-semibold text-gray-800 text-xs">{val}</div>
                </div>
              ))}
            </div>
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 mb-4">
              ⚕️ <strong>Disclaimer:</strong> MindKare is not a medical provider. Clicking "Book Session" redirects to the therapist's independent booking page.
            </div>
            <button onClick={()=>window.open(selected.bookingUrl,"_blank")} className="btn-primary w-full py-3 text-base">
              Book a Session with {selected.name.split(" ")[1]} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
