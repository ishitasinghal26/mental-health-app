import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

type FullReport = {
  depression_score:number; anxiety_score:number; stress_score:number;
  depression_level:string; anxiety_level:string; stress_level:string;
  sleep_risk:string; screen_risk:string; stress_self:string;
  overall_severity:string; created_at:string;
};

const SEVERITY_COLOR: Record<string,string> = { normal:"#10b981",mild:"#f59e0b",moderate:"#f97316",severe:"#ef4444",extremely_severe:"#7c3aed" };
const SEVERITY_LABEL: Record<string,string> = { normal:"Normal",mild:"Mild",moderate:"Moderate",severe:"Severe",extremely_severe:"Extremely Severe" };
const DASS_THRESHOLDS = {
  depression:[{max:9,label:"Normal",info:"Minimal or no depressive symptoms."},{max:13,label:"Mild",info:"Some low mood; may benefit from self-care strategies."},{max:20,label:"Moderate",info:"Persistent low mood; professional support is recommended."},{max:27,label:"Severe",info:"Significant depression; please seek professional help."},{max:Infinity,label:"Extremely Severe",info:"Very high depression. Urgent professional care is advised."}],
  anxiety:   [{max:7,label:"Normal",info:"Minimal anxiety symptoms."},{max:9,label:"Mild",info:"Slight anxious feelings; manageable with self-care."},{max:14,label:"Moderate",info:"Noticeable anxiety; consider speaking with a therapist."},{max:19,label:"Severe",info:"High anxiety; professional support is recommended."},{max:Infinity,label:"Extremely Severe",info:"Very high anxiety. Please seek professional help promptly."}],
  stress:    [{max:14,label:"Normal",info:"Your stress is within a healthy range."},{max:18,label:"Mild",info:"Elevated stress; prioritize rest and relaxation."},{max:25,label:"Moderate",info:"Notable stress levels; stress management techniques recommended."},{max:33,label:"Severe",info:"High stress; consider professional support."},{max:Infinity,label:"Extremely Severe",info:"Very high stress. Seek immediate support."}],
};
function getThresholdInfo(domain:keyof typeof DASS_THRESHOLDS,score:number){ for(const t of DASS_THRESHOLDS[domain]){if(score<=t.max)return t;} return DASS_THRESHOLDS[domain][DASS_THRESHOLDS[domain].length-1]; }
const MAX_SCORES = { depression:42,anxiety:42,stress:42 };

export default function DassReportModal({onClose}:{onClose:()=>void}) {
  const {refreshUser} = useAuth();
  const navigate = useNavigate();
  const [report,    setReport]    = useState<FullReport|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [resetting, setResetting] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(()=>{
    apiClient.get("/assessment/full").then(r=>setReport(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  async function handleRetake(){
    if(!window.confirm("This will reset your current DASS report and let you retake the assessment. Continue?"))return;
    setResetting(true);
    try{await apiClient.post("/assessment/reset");await refreshUser();onClose();navigate("/assessment");}
    catch{alert("Failed to reset assessment. Please try again.");}
    finally{setResetting(false);}
  }

  const modal = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={e=>e.target===e.currentTarget&&onClose()}
      role="dialog" aria-modal="true" aria-label="DASS-21 Full Report"
    >
      <div className="glass-card-strong w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" style={{ boxShadow:"0 32px 80px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/20 gap-3 flex-wrap shrink-0">
          <div>
            <h2 className="font-black text-gray-800 text-lg">📊 Full DASS-21 Report</h2>
            {report && <p className="text-xs text-gray-400 mt-0.5">Taken on {new Date(report.created_at).toLocaleDateString("en",{day:"numeric",month:"long",year:"numeric"})}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleRetake} disabled={resetting}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-rose-300/50 bg-rose-100/50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">
              {resetting?"Resetting…":"🔄 Retake Survey"}
            </button>
            <button onClick={onClose} aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/40 border border-white/30 text-gray-500 font-bold text-sm hover:bg-white/60 transition-colors cursor-pointer flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading your report…</div>
          ) : !report ? (
            <div className="text-center py-12 flex flex-col items-center gap-3 text-gray-400">
              <span className="text-5xl">📋</span>
              <p>No assessment data found.</p>
              <button onClick={()=>{onClose();navigate("/assessment");}} className="btn-primary px-5 py-2 text-sm">Take Assessment Now</button>
            </div>
          ) : (
            <>
              {/* Overall severity badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2"
                style={{ background:`${SEVERITY_COLOR[report.overall_severity]||"#6b7280"}12`, borderColor:`${SEVERITY_COLOR[report.overall_severity]||"#6b7280"}40` }}>
                <span className="text-3xl shrink-0">{report.overall_severity==="normal"?"🌟":report.overall_severity==="mild"?"🌤️":report.overall_severity==="moderate"?"⚠️":"🚨"}</span>
                <div>
                  <div className="font-black text-gray-800">Overall: {SEVERITY_LABEL[report.overall_severity]||report.overall_severity}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Based on your Depression, Anxiety &amp; Stress scores combined.</div>
                </div>
              </div>

              {/* Three domain cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["depression","anxiety","stress"] as const).map(domain=>{
                  const score = report[`${domain}_score` as keyof FullReport] as number;
                  const level = report[`${domain}_level` as keyof FullReport] as string;
                  const color = SEVERITY_COLOR[level]||"#6b7280";
                  const pct   = Math.round((score/MAX_SCORES[domain])*100);
                  const info  = getThresholdInfo(domain,score);
                  return (
                    <div key={domain} className="bg-white/30 rounded-2xl p-5 border-t-4" style={{ borderColor:color }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-700 text-sm capitalize">{domain}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background:`${color}18`, color }}>{SEVERITY_LABEL[level]||level}</span>
                      </div>
                      <div className="text-3xl font-black mb-1" style={{color}}>{score}<span className="text-base font-normal text-gray-400">/{MAX_SCORES[domain]}</span></div>
                      <div className="h-2 bg-white/40 rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:color}}/>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{info.info}</p>
                      <div className="flex gap-1 flex-wrap">
                        {DASS_THRESHOLDS[domain].slice(0,-1).map((t,ti)=>{
                          const prev = DASS_THRESHOLDS[domain][ti-1]?.max??-1;
                          const isActive = score<=t.max && score>prev;
                          return <span key={t.label} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:isActive?`${color}20`:"rgba(255,255,255,0.3)", color:isActive?color:"#9ca3af", border:isActive?`1px solid ${color}40`:"1px solid transparent" }}>{t.label}</span>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lifestyle Factors */}
              <div className="bg-white/20 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">🌙 Lifestyle Risk Factors</h3>
                <div className="grid grid-cols-3 gap-3">
                  {([["😴","Sleep Risk",report.sleep_risk],["📱","Screen Time Risk",report.screen_risk],["🧠","Self-Rated Stress",report.stress_self]] as [string,string,string][]).map(([icon,label,value])=>{
                    const isHigh = value==="high"||value==="severe"||value==="extremely_severe";
                    const color = isHigh?"#ef4444":value==="moderate"?"#f59e0b":"#10b981";
                    return (
                      <div key={label} className="bg-white/30 rounded-xl p-3">
                        <span className="text-xl">{icon}</span>
                        <div className="text-xs text-gray-400 mt-1 mb-0.5">{label}</div>
                        <div className="font-bold text-sm capitalize" style={{color}}>{value||"—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                <strong>⚕️ Important:</strong> This assessment is for educational purposes only and does not replace professional medical advice. If you are experiencing severe distress, please consult a licensed mental health professional.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render via portal to avoid stacking context issues
  return createPortal(modal, document.body);
}
