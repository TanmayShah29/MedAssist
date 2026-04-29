"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

/* ─── DESIGN TOKENS ────────────────────────────────────────────────────── */
const T = {
  page: "#FAFAF7", card: "#F5F4EF", cardHover: "#EFEDE6",
  border: "#E8E6DF", borderMed: "#D9D6CD",
  text: "#1C1917", textSec: "#57534E", textMuted: "#A8A29E",
  brand: "#0EA5E9", brandHover: "#0284C7",
  optimal: "#10B981", warning: "#F59E0B", critical: "#EF4444",
  optimalBg: "#F0FDF4", optimalBorder: "#BBF7D0", optimalText: "#065F46",
  warningBg: "#FFFBEB", warningBorder: "#FDE68A", warningText: "#92400E",
  criticalBg: "#FFF1F2", criticalBorder: "#FECDD3", criticalText: "#991B1B",
};

/* ─── DEMO DATA ─────────────────────────────────────────────────────────── */
const DEMO_PROFILE = {
  first_name: "Tanmay", last_name: "Shah", age: 22, sex: "male", blood_type: "B+",
};

const DEMO_BIOMARKERS = [
  { id: "b1", name: "Glucose", value: 106, unit: "mg/dL", status: "warning", category: "metabolic", ref_min: 70, ref_max: 99, prev: 92, ai_interpretation: "Glucose has risen 15% over the last quarter. This confirms a pre-diabetic trend that warrants dietary review. Focus on reducing simple carbohydrates and increasing fiber intake.", confidence: 0.94 },
  { id: "b2", name: "Vitamin D", value: 42, unit: "ng/mL", status: "optimal", category: "vitamins", ref_min: 30, ref_max: 80, prev: 18, ai_interpretation: "Excellent recovery from critical deficiency. Your D3 supplementation protocol has been highly effective — levels have increased by 133% since your last report.", confidence: 0.97 },
  { id: "b3", name: "LDL Cholesterol", value: 145, unit: "mg/dL", status: "warning", category: "lipids", ref_min: 0, ref_max: 100, prev: null, ai_interpretation: "Borderline high. Recommend increasing soluble fiber intake (oats, beans) and Omega-3 rich foods. Consider discussing statin therapy with your doctor if lifestyle changes don't show results in 3 months.", confidence: 0.91 },
  { id: "b4", name: "HDL Cholesterol", value: 58, unit: "mg/dL", status: "optimal", category: "lipids", ref_min: 40, ref_max: 100, prev: null, ai_interpretation: "Good protective cholesterol level. Regular aerobic exercise is likely contributing to this favorable result. Continue current activity levels.", confidence: 0.95 },
  { id: "b5", name: "Hemoglobin", value: 11.8, unit: "g/dL", status: "warning", category: "hematology", ref_min: 13.5, ref_max: 17.5, prev: 13.5, ai_interpretation: "Downward trend detected — a drop of 12.6% since last report. Monitor for symptoms of fatigue, dizziness, or breathlessness. Dietary iron assessment and follow-up recommended.", confidence: 0.92 },
  { id: "b6", name: "TSH", value: 2.4, unit: "uIU/mL", status: "optimal", category: "thyroid", ref_min: 0.4, ref_max: 4.0, prev: null, ai_interpretation: "Thyroid Stimulating Hormone is well within range. No metabolic impact from thyroid dysfunction detected. Stable thyroid function supports overall energy metabolism.", confidence: 0.96 },
  { id: "b7", name: "Magnesium", value: 2.1, unit: "mg/dL", status: "optimal", category: "metabolic", ref_min: 1.7, ref_max: 2.3, prev: null, ai_interpretation: "Magnesium is in the optimal range. This supports healthy muscle function, nerve conduction, and energy production across 300+ enzymatic reactions.", confidence: 0.93 },
  { id: "b8", name: "C-Reactive Protein", value: 1.2, unit: "mg/L", status: "optimal", category: "inflammation", ref_min: 0, ref_max: 3.0, prev: null, ai_interpretation: "Low CRP indicates minimal systemic inflammation — an excellent prognostic indicator for cardiovascular health. Continue anti-inflammatory dietary habits.", confidence: 0.89 },
];

type DemoBiomarker = typeof DEMO_BIOMARKERS[number];

const TREND_DATA: Record<string, { date: string; score: number }[]> = {
  Glucose: [
    { date: "Oct 23", score: 88 }, { date: "Jan 24", score: 92 }, { date: "Apr 24", score: 95 }, { date: "Jul 24", score: 92 }, { date: "Oct 24", score: 106 }
  ],
  "Vitamin D": [
    { date: "Oct 23", score: 14 }, { date: "Jan 24", score: 18 }, { date: "Apr 24", score: 24 }, { date: "Jul 24", score: 35 }, { date: "Oct 24", score: 42 }
  ],
  Hemoglobin: [
    { date: "Oct 23", score: 14.2 }, { date: "Jan 24", score: 13.8 }, { date: "Apr 24", score: 13.5 }, { date: "Jul 24", score: 12.4 }, { date: "Oct 24", score: 11.8 }
  ],
  "LDL Cholesterol": [
    { date: "Jul 24", score: 138 }, { date: "Oct 24", score: 145 }
  ],
};

const LONGITUDINAL_INSIGHTS = [
  "Metabolic Alert: Glucose has risen 15% over the last 3 months, indicating a transition to pre-diabetic ranges.",
  "Supplement Efficacy: Vitamin D has successfully recovered from a critical level (18) to an optimal maintenance level (42).",
  "Anemic Pattern: Hemoglobin is trending downward; monitor dietary iron intake and consider supplementation.",
  "Thyroid Stability: TSH levels remain ideal, suggesting no metabolic impact from thyroid function.",
];

const DEMO_MESSAGES_INITIAL: DemoMessage[] = [
  { id: "1", role: "assistant", content: "Hello Tanmay! I've reviewed your latest lab results. Your Vitamin D recovery is genuinely impressive — up 133% to optimal range. However, I'm keeping a close eye on your rising Glucose trend and declining Hemoglobin. Would you like me to explain what these mean for you?" }
];

const SYMPTOM_OPTIONS = ["Fatigue", "Brain Fog", "Joint Pain", "Headaches", "Sleep Issues", "Low Energy", "Anxiety", "Digestive Issues"];
const DEMO_SYMPTOMS = ["Fatigue", "Low Energy"];

/* ─── TYPES ────────────────────────────────────────────────────────────── */
type DemoMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const statusColor = (s: string) => s === "optimal" ? T.optimal : s === "warning" ? T.warning : T.critical;
const statusBg = (s: string) => s === "optimal" ? T.optimalBg : s === "warning" ? T.warningBg : T.criticalBg;
const statusBorder = (s: string) => s === "optimal" ? T.optimalBorder : s === "warning" ? T.warningBorder : T.criticalBorder;
const statusText = (s: string) => s === "optimal" ? T.optimalText : s === "warning" ? T.warningText : T.criticalText;
const statusLabel = (s: string) => s === "optimal" ? "Optimal" : s === "warning" ? "Monitor" : "Action Needed";

const getDelta = (curr: number, prev: number | null) => {
  if (!prev) return null;
  const diff = curr - prev;
  const pct = Math.round((diff / prev) * 100);
  return { diff, pct };
};

const Icon = ({ path, size = 20, color = "currentColor", fill = "none", strokeWidth = 2 }: { path: string; size?: number; color?: string; fill?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// Pre-defined icon paths
const Icons = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  fileText: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M5 19l.75 2.25L8 22l-2.25.75L5 25l-.75-2.25L2 22l2.25-.75L5 19z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  settings: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  send: "M22 2L11 13 M22 2L15 22 9 13 2 9l20-7z",
  trendUp: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  trendDown: "M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6",
  alertCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01",
  x: "M18 6L6 18 M6 6l12 12",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  printer: "M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  terminal: "M4 17l6-6-6-6 M12 19h8",
  check: "M20 6L9 17l-5-5",
  chevronRight: "M9 18l6-6-6-6",
  search: "M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M21 21l-4.35-4.35",
  refresh: "M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15",
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01",
  plus: "M12 5v14M5 12h14",
};

/* ─── SMALL UI COMPONENTS ───────────────────────────────────────────────── */
const Badge = ({ status }: { status: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", background: statusBg(status), color: statusText(status), border: `1px solid ${statusBorder(status)}` }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(status), flexShrink: 0 }} />
    {statusLabel(status).toUpperCase()}
  </span>
);

const RangeBar = ({ value, min, max, status }: { value: number; min: number; max: number; status: string }) => {
  const pct = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 50;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginBottom: 4 }}>
        <span>{min}</span><span>{max}</span>
      </div>
      <div style={{ height: 5, background: T.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: statusColor(status), borderRadius: 4, minWidth: 4 }} />
      </div>
    </div>
  );
};

/* ─── SIDEBAR ───────────────────────────────────────────────────────────── */
const Sidebar = ({ className = "", currentPage, onNavigate }: { className?: string; currentPage: string; onNavigate: (page: string) => void }) => {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
    { id: "results", label: "Lab Results", icon: Icons.fileText },
    { id: "assistant", label: "AI Assistant", icon: Icons.sparkles },
    { id: "profile", label: "Profile", icon: Icons.user },
    { id: "settings", label: "Settings", icon: Icons.settings },
  ];

  return (
    <aside className={className} style={{
      width: 240, flexShrink: 0,
      background: "#F0EFE9",
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 18px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }}>
              <Icon path={Icons.shield} size={17} color="white" />
            </div>
            <span className="font-display" style={{ fontSize: 21, color: T.text }}>MedAssist</span>
          </div>
          {/* Live dot */}
          <div style={{ position: "relative", width: 8, height: 8 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981", opacity: 0.5, animation: "pulse 2s ease infinite" }} />
            <div style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
          </div>
        </div>
        <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 100, fontSize: 10, fontWeight: 700, color: "#92400E" }}>
          DEMO MODE
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 10px", flex: 1 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", padding: "6px 12px", marginBottom: 4 }}>Navigation</p>
        {nav.map(item => {
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 11,
              padding: "9px 12px", borderRadius: 10, border: "none",
              cursor: "pointer", marginBottom: 2,
              background: active ? "#E0F2FE" : "transparent",
              color: active ? T.brand : T.textSec,
              fontWeight: active ? 700 : 500,
              fontSize: 14, transition: "all 0.15s",
              textAlign: "left" as const,
              borderLeft: active ? `3px solid ${T.brand}` : "3px solid transparent",
            }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = T.cardHover)}
              onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}>
              <Icon path={item.icon} size={17} color={active ? T.brand : T.textMuted} />
              {item.label}
              {item.id === "assistant" && (
                <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, background: T.brand, color: "white", padding: "1px 6px", borderRadius: 100 }}>AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Status mini-card */}
      <div style={{ margin: "0 10px 10px", padding: "12px 14px", background: "#0F172A", borderRadius: 12, border: "1px solid #1E293B" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>AI Status</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>Groq · Llama 3.3</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#475569" }}>online</span>
        </div>
      </div>

      {/* Profile */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.brand, flexShrink: 0 }}>
            {DEMO_PROFILE.first_name[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DEMO_PROFILE.first_name} {DEMO_PROFILE.last_name}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Demo Patient · Age {DEMO_PROFILE.age}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────────── */
const HealthScoreRing = ({ score }: { score: number }) => {
  const r = 54; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const label = score >= 80 ? "Good" : score >= 60 ? "Fair" : "Poor";

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke={T.border} strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="font-display" style={{ fontSize: 36, fontWeight: 700, color: T.text, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
};

const DashboardPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<DemoBiomarker | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  const optimal = DEMO_BIOMARKERS.filter(b => b.status === "optimal");
  const warning = DEMO_BIOMARKERS.filter(b => b.status === "warning");
  const critical = DEMO_BIOMARKERS.filter(b => b.status === "critical");

  const categories = ["hematology", "metabolic", "vitamins", "inflammation", "lipids", "thyroid"];

  const handleBiomarkerClick = (b: DemoBiomarker) => {
    setSelectedBiomarker(b);
    setShowDetailSheet(true);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, minHeight: "100vh", background: T.page }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 34, color: T.text, lineHeight: 1.1 }}>Clinical Overview</h1>
          <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Last report: October 24, 2024 · Demo Data</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "10px 12px", background: "white", border: `1px solid ${T.border}`, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Print">
            <Icon path={Icons.printer} size={18} color={T.textSec} />
          </button>
          <button onClick={() => onNavigate("results")} style={{ background: T.brand, color: "white", border: "none", borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <Icon path={Icons.fileText} size={16} color="white" />
            View Results
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderLeft: "4px solid #DC2626", borderRadius: 14, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#DC2626", color: "white", padding: 8, borderRadius: 10 }}><Icon path={Icons.alertCircle} size={18} color="white" /></div>
          <div>
            <h4 style={{ color: "#991B1B", fontWeight: 700, fontSize: 15 }}>3 Biomarkers Need Attention</h4>
            <p style={{ color: "#B91C1C", fontSize: 13, marginTop: 2 }}>Glucose (+15%), Hemoglobin (declining), LDL Cholesterol elevated</p>
          </div>
        </div>
        <button onClick={() => document.getElementById("care-plan")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "#DC2626", color: "white", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
          Review Plan
        </button>
      </div>

      {/* Top Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Health Score */}
        <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, cursor: "pointer" }} onClick={() => setShowScoreModal(true)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Health Score</p>
              <p style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>Click to see breakdown →</p>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#065F46" }}>{optimal.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Optimal</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#92400E" }}>{warning.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>Monitor</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#991B1B" }}>{critical.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#DC2626", textTransform: "uppercase" }}>Action</div>
                </div>
              </div>
            </div>
            <HealthScoreRing score={82} />
          </div>
        </div>

        {/* Trend Snapshot */}
        <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Progress Report</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { name: "Vitamin D", from: 18, to: 42, unit: "ng/mL", pct: 133, dir: "up", good: true },
              { name: "Glucose", from: 92, to: 106, unit: "mg/dL", pct: 15, dir: "up", good: false },
              { name: "Hemoglobin", from: 13.5, to: 11.8, unit: "g/dL", pct: 13, dir: "down", good: false },
            ].map((c, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 12, padding: 14, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textSec }}>{c.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.good ? T.optimal : T.critical, display: "flex", alignItems: "center", gap: 2 }}>
                    <Icon path={c.dir === "up" ? Icons.trendUp : Icons.trendDown} size={11} color={c.good ? T.optimal : T.critical} />
                    {c.pct}%
                  </span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{c.to}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>Was {c.from} {c.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Longitudinal Insights */}
      <div style={{ background: "#FBFCFE", border: "1px solid #E0E7FF", borderRadius: 18, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon path={Icons.activity} size={18} color="#6366F1" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Longitudinal Insights</h3>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em" }}>Beta</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {LONGITUDINAL_INSIGHTS.map((insight, i) => (
            <div key={i} style={{ display: "flex", gap: 10, background: "white", padding: 14, borderRadius: 10, border: "1px solid #EEF2FF" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", flexShrink: 0, marginTop: 4 }} />
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Care Plan */}
      <div id="care-plan" style={{ background: "#0F172A", borderRadius: 24, padding: 32, marginBottom: 24, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, padding: 24, opacity: 0.05 }}>
          <Icon path={Icons.sparkles} size={100} color="white" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(14,165,233,0.3)" }}>
            <Icon path={Icons.arrowRight} size={18} color="#38BDF8" />
          </div>
          <h3 className="font-display" style={{ fontSize: 22 }}>Personalized Care Plan</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {warning.map((b, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", color: "#FCD34D" }}>MONITOR</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>PRIORITY {i + 1}</span>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "white" }}>{b.name}</h4>
              <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
                {b.name === "Glucose" ? "Monitor carbohydrate intake and consider a 10-min walk after meals." : b.name === "Hemoglobin" ? "Increase iron-rich foods (spinach, red meat) with Vitamin C for absorption." : "Increase soluble fiber (oats, beans) and Omega-3 rich foods."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Biomarkers by Category */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Latest Clinical Biomarkers</h3>
          <div style={{ display: "flex", gap: 14, fontSize: 10, fontWeight: 700, color: T.textMuted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: T.optimal, display: "inline-block" }} />Optimal: {optimal.length}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: T.warning, display: "inline-block" }} />Monitor: {warning.length}</span>
          </div>
        </div>

        {categories.map(cat => {
          const catBiomarkers = DEMO_BIOMARKERS.filter(b => b.category === cat);
          if (catBiomarkers.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.text, textTransform: "capitalize" }}>{cat}</h4>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {catBiomarkers.map(b => {
                  const delta = b.prev ? getDelta(b.value, b.prev) : null;
                  return (
                    <div key={b.id} onClick={() => handleBiomarkerClick(b)} style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#BAE6FD"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,165,233,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <Badge status={b.status} />
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{b.value} <span style={{ fontSize: 10, fontWeight: 400, color: T.textMuted }}>{b.unit}</span></div>
                          {delta && (
                            <div style={{ fontSize: 10, fontWeight: 700, color: delta.pct > 0 ? (b.status === "optimal" ? T.optimal : T.critical) : (b.status === "optimal" ? T.optimal : T.critical), display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                              <Icon path={delta.diff > 0 ? Icons.trendUp : Icons.trendDown} size={10} color={delta.pct > 0 ? (b.status === "optimal" ? T.optimal : T.critical) : T.optimal} />
                              {Math.abs(delta.pct)}% from last
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{b.name}</div>
                      <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{b.ai_interpretation}</p>
                      <RangeBar value={b.value} min={b.ref_min} max={b.ref_max} status={b.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div onClick={() => setShowScoreModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 420, width: "100%", animation: "scoreCount 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <h3 className="font-display" style={{ fontSize: 26, color: T.text, marginBottom: 8 }}>Score Breakdown</h3>
            <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Your health score is calculated from clinical categories weighted by their systemic impact.</p>
            {[
              { name: "Hematology", weight: 20, markers: DEMO_BIOMARKERS.filter(b => b.category === "hematology") },
              { name: "Metabolic", weight: 25, markers: DEMO_BIOMARKERS.filter(b => b.category === "metabolic") },
              { name: "Inflammation", weight: 20, markers: DEMO_BIOMARKERS.filter(b => b.category === "inflammation") },
              { name: "Vitamins", weight: 15, markers: DEMO_BIOMARKERS.filter(b => b.category === "vitamins") },
              { name: "Lipids", weight: 20, markers: DEMO_BIOMARKERS.filter(b => b.category === "lipids") },
            ].map(cat => {
              const opt = cat.markers.filter(m => m.status === "optimal").length;
              const total = cat.markers.length;
              const pct = total ? (opt / total) * 100 : 0;
              return (
                <div key={cat.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.textSec, textTransform: "uppercase" }}>{cat.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.brand }}>WEIGHT: {cat.weight}%</span>
                  </div>
                  {total > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: T.optimal, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.optimal }}>{opt}/{total} OPT</span>
                    </div>
                  ) : <span style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>Not in latest report</span>}
                </div>
              );
            })}
            <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: 14, marginTop: 4, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}><strong>The Optimism Rule:</strong> If your report has at least one optimal biomarker, your score cannot drop below 50.</p>
            </div>
            <button onClick={() => setShowScoreModal(false)} style={{ width: "100%", padding: 14, background: T.text, color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Close</button>
          </div>
        </div>
      )}

      {/* Biomarker Detail Sheet */}
      {showDetailSheet && selectedBiomarker && (
        <div onClick={() => setShowDetailSheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, background: "white", height: "100vh", overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 20, animation: "slideIn 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{selectedBiomarker.name}</h2>
                <p style={{ fontSize: 12, color: T.textMuted, textTransform: "capitalize" }}>{selectedBiomarker.category}</p>
              </div>
              <button onClick={() => setShowDetailSheet(false)} style={{ background: T.card, border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                <Icon path={Icons.x} size={18} color={T.textSec} />
              </button>
            </div>

            <div style={{ background: statusBg(selectedBiomarker.status), border: `1px solid ${statusBorder(selectedBiomarker.status)}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 44, fontWeight: 700, color: statusText(selectedBiomarker.status), lineHeight: 1 }}>{selectedBiomarker.value}</div>
              <div style={{ fontSize: 14, color: statusText(selectedBiomarker.status), marginTop: 4 }}>{selectedBiomarker.unit}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Reference: {selectedBiomarker.ref_min} – {selectedBiomarker.ref_max}</div>
            </div>

            <Badge status={selectedBiomarker.status} />

            <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>AI Interpretation</h3>
              <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>{selectedBiomarker.ai_interpretation}</p>
            </div>

            {TREND_DATA[selectedBiomarker.name] && (
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Historical Trend</h3>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA[selectedBiomarker.name]}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12 }} />
                      <ReferenceLine y={selectedBiomarker.ref_min} stroke={T.border} strokeDasharray="3 3" />
                      <ReferenceLine y={selectedBiomarker.ref_max} stroke={T.border} strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="score" stroke={statusColor(selectedBiomarker.status)} strokeWidth={2.5} dot={{ fill: statusColor(selectedBiomarker.status), r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <span>AI Confidence</span><span style={{ fontWeight: 700, color: T.text }}>{Math.round(selectedBiomarker.confidence * 100)}%</span>
            </div>

            <button onClick={() => { setShowDetailSheet(false); onNavigate("assistant"); }} style={{ background: T.brand, color: "white", border: "none", borderRadius: 12, padding: 14, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ask AI about this →</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── RESULTS PAGE ──────────────────────────────────────────────────────── */
const ResultsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBiomarker, setSelectedBiomarker] = useState<DemoBiomarker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", "hematology", "metabolic", "inflammation", "vitamins", "lipids", "thyroid"];

  const filtered = DEMO_BIOMARKERS.filter(b => {
    const catMatch = selectedCategory === "all" || b.category === selectedCategory;
    const searchMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const opt = filtered.filter(b => b.status === "optimal").length;
  const warn = filtered.filter(b => b.status === "warning").length;
  const crit = filtered.filter(b => b.status === "critical").length;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: T.page }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 34, color: T.text }}>Lab Results</h1>
          <p style={{ fontSize: 14, color: T.textSec, marginTop: 4 }}>{DEMO_BIOMARKERS.length} biomarkers · Demo Report · October 24, 2024</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.textSec, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon path={Icons.printer} size={15} color={T.textSec} />Export PDF
          </button>
        </div>
      </div>

      {/* Bottom Line */}
      <div style={{ background: "white", border: `1px solid #BAE6FD`, borderRadius: 18, padding: 24, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, padding: 16, opacity: 0.05 }}><Icon path={Icons.sparkles} size={56} color={T.brand} /></div>
        <div style={{ fontSize: 10, fontWeight: 700, background: "#EFF6FF", color: T.brand, padding: "3px 10px", borderRadius: 6, border: "1px solid #BFDBFE", display: "inline-block", marginBottom: 10 }}>THE BOTTOM LINE</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", lineHeight: 1.4 }}>Overall health is good with 5 optimal biomarkers, but rising Glucose and declining Hemoglobin require monitoring over the next quarter.</h2>
        <p style={{ fontSize: 12, color: T.textMuted, marginTop: 12, fontStyle: "italic" }}>* AI-generated interpretation based on your specific biomarkers and reference ranges.</p>
      </div>

      {/* Status Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[{ count: opt, label: "Optimal", bg: T.optimalBg, border: T.optimalBorder, text: T.optimalText }, { count: warn, label: "Monitor", bg: T.warningBg, border: T.warningBorder, text: T.warningText }, { count: crit, label: "Action Needed", bg: T.criticalBg, border: T.criticalBorder, text: T.criticalText }].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 40, fontWeight: 700, color: s.text, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.text, textTransform: "uppercase", marginTop: 4, letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: "8px 16px", borderRadius: 12, border: `1px solid ${selectedCategory === cat ? T.brand : T.border}`, background: selectedCategory === cat ? T.brand : "white", color: selectedCategory === cat ? "white" : T.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon path={Icons.search} size={15} color={T.textMuted} /></div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search biomarkers..." style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, outline: "none", width: 220 }} />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
        {/* List */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          {filtered.map((b, i) => (
            <div key={b.id} onClick={() => setSelectedBiomarker(b)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", borderLeft: selectedBiomarker?.id === b.id ? `3px solid ${T.brand}` : b.status !== "optimal" ? `3px solid ${statusColor(b.status)}` : "3px solid transparent", background: selectedBiomarker?.id === b.id ? T.cardHover : "transparent", transition: "background 0.15s" }}
              onMouseEnter={e => { if (selectedBiomarker?.id !== b.id) e.currentTarget.style.background = T.cardHover; }}
              onMouseLeave={e => { if (selectedBiomarker?.id !== b.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(b.status), flexShrink: 0, marginRight: 12 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{b.name}</span>
                  <span style={{ fontSize: 11, background: "#E0F2FE", color: "#0369A1", padding: "1px 7px", borderRadius: 6 }}>{b.category}</span>
                </div>
                <div style={{ fontSize: 14, color: T.textSec }}>{b.value} {b.unit} <span style={{ fontSize: 11, color: T.textMuted }}>(ref: {b.ref_min}–{b.ref_max})</span></div>
                <RangeBar value={b.value} min={b.ref_min} max={b.ref_max} status={b.status} />
              </div>
              <Badge status={b.status} />
            </div>
          ))}
        </div>

        {/* Detail */}
        <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
          {!selectedBiomarker ? (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 40, textAlign: "center", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: T.textMuted, fontSize: 14 }}>Select a result to see AI interpretation</p>
            </div>
          ) : (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{selectedBiomarker.name}</h2>
                <button onClick={() => setSelectedBiomarker(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon path={Icons.x} size={20} color={T.textMuted} /></button>
              </div>
              <div style={{ textAlign: "center", padding: 20, background: "white", border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 14, color: statusColor(selectedBiomarker.status) }}>
                <div className="font-display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{selectedBiomarker.value} {selectedBiomarker.unit}</div>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>Ref: {selectedBiomarker.ref_min} – {selectedBiomarker.ref_max}</p>
              </div>
              <div style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, background: statusBg(selectedBiomarker.status), color: statusText(selectedBiomarker.status), fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{statusLabel(selectedBiomarker.status)}</div>
              <h3 style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>AI Interpretation</h3>
              <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, marginBottom: 16 }}>{selectedBiomarker.ai_interpretation}</p>
              {TREND_DATA[selectedBiomarker.name] && (
                <div style={{ height: 150, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Historical Trend</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA[selectedBiomarker.name]}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: T.textMuted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: T.textMuted }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
                      <Line type="monotone" dataKey="score" stroke={statusColor(selectedBiomarker.status)} strokeWidth={2} dot={{ fill: statusColor(selectedBiomarker.status), r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, borderTop: `1px solid ${T.border}`, paddingTop: 12, marginBottom: 14 }}>
                <span>AI Confidence</span><span style={{ fontWeight: 700, color: T.text }}>{Math.round(selectedBiomarker.confidence * 100)}%</span>
              </div>
              <button onClick={() => onNavigate("assistant")} style={{ width: "100%", background: T.brand, color: "white", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Ask AI about this →</button>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Questions */}
      <div style={{ marginTop: 32, background: "white", border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
        <h3 className="font-display" style={{ fontSize: 22, color: T.text, marginBottom: 6 }}>Questions to ask your doctor</h3>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Based on your current results</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            "What dietary changes can help lower my Glucose to optimal range?",
            "Should I be concerned about my declining Hemoglobin trend?",
            "What's the best approach to lower my LDL Cholesterol?",
            "How long should I continue Vitamin D supplementation at this dose?",
          ].map((q, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, display: "flex", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: T.brand }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── AI ASSISTANT PAGE ─────────────────────────────────────────────────── */
const AssistantPage = () => {
  const [messages, setMessages] = useState<DemoMessage[]>(DEMO_MESSAGES_INITIAL);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim() || isProcessing) return;
    setInput("");
    const userMsg: DemoMessage = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/demo-ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          symptoms: DEMO_SYMPTOMS,
        })
      });
      const data = await response.json();
      const aiText = data.answer || data.error || "I'm sorry, I couldn't process that request right now.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: aiText, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting. Please try again in a moment.", timestamp: new Date() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedQuestions = [
    "Explain my Glucose trend",
    "Why is my Hemoglobin declining?",
    "Is my Vitamin D recovery good?",
    "What should I ask my doctor?",
    "How can I improve my health score?",
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.page }}>
      {/* Header */}
      <div style={{ padding: "20px 32px", borderBottom: `1px solid ${T.border}`, background: "white", flexShrink: 0 }}>
        <h1 className="font-display" style={{ fontSize: 28, color: T.text }}>AI Health Assistant</h1>
        <p style={{ fontSize: 13, color: T.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon path={Icons.sparkles} size={13} color={T.brand} />
          Context: {DEMO_BIOMARKERS.length} biomarkers loaded · Demo mode active
        </p>
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "3fr 2fr", overflow: "hidden" }}>
        {/* Chat */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "user" ? (
                  <div style={{ background: T.brand, color: "white", borderRadius: "14px 14px 4px 14px", padding: "12px 18px", maxWidth: "80%", fontSize: 14, lineHeight: 1.6 }}>{msg.content}</div>
                ) : (
                  <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: "14px 14px 14px 4px", padding: "12px 18px", maxWidth: "85%", fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>{msg.content}</div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: "14px 14px 14px 4px", padding: "12px 18px", display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.textMuted, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 20, borderTop: `1px solid ${T.border}`, background: T.page, flexShrink: 0 }}>
            {messages.filter(m => m.role === "user").length === 0 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, flexWrap: "wrap" }}>
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} style={{ whiteSpace: "nowrap", padding: "7px 14px", background: "white", border: `1px solid ${T.border}`, borderRadius: 100, fontSize: 13, color: T.textSec, cursor: "pointer" }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !isProcessing && sendMessage()} disabled={isProcessing} placeholder={isProcessing ? "AI is thinking..." : "Ask about your results..."} style={{ flex: 1, padding: "12px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 14, color: T.text, outline: "none" }} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isProcessing} style={{ padding: "12px 18px", background: !input.trim() || isProcessing ? "#94A3B8" : T.brand, color: "white", border: "none", borderRadius: 12, cursor: !input.trim() || isProcessing ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}>
                {isProcessing ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Icon path={Icons.send} size={18} color="white" />}
              </button>
            </div>
            <p style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginTop: 10 }}>AI-generated insights for educational purposes only. Always consult your physician.</p>
          </div>
        </div>

        {/* Context Panel */}
        <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Patient Summary */}
          <div style={{ background: "#E0F2FE", border: "1px solid #BAE6FD", borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Patient Context</p>
            <p className="font-display" style={{ fontSize: 20, color: "#0C4A6E" }}>{DEMO_PROFILE.first_name} {DEMO_PROFILE.last_name}</p>
            <p style={{ fontSize: 13, color: "#0369A1", marginTop: 4 }}>{DEMO_PROFILE.age}yo {DEMO_PROFILE.sex} · Blood type {DEMO_PROFILE.blood_type}</p>
            <p style={{ fontSize: 12, color: "#0284C7", marginTop: 6 }}>Symptoms: Fatigue, Low Energy</p>
          </div>

          {/* Quick Stats */}
          <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Current Status</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <HealthScoreRing score={82} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                {[{ label: "Optimal", count: 5, color: T.optimal }, { label: "Monitor", count: 3, color: T.warning }, { label: "Action", count: 0, color: T.critical }].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 13, color: T.textSec }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, marginLeft: "auto" }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Biomarkers */}
          <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Key Biomarkers</p>
            {DEMO_BIOMARKERS.filter(b => b.status !== "optimal").map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{b.value} {b.unit}</div>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── PROFILE PAGE ──────────────────────────────────────────────────────── */
const ProfilePage = () => {
  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [symptoms, setSymptoms] = useState([...DEMO_SYMPTOMS]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, minHeight: "100vh", background: T.page }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 34, color: T.text }}>Clinical Profile</h1>
        <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{profile.first_name} {profile.last_name} · Demo Patient</p>
      </div>

      {/* Report History Banner */}
      <div style={{ background: "#E0F2FE", border: "1px solid #BAE6FD", borderRadius: 18, padding: 20, marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ padding: 12, background: "#BAE6FD", borderRadius: 12 }}><Icon path={Icons.fileText} size={22} color="#0369A1" /></div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0C4A6E" }}>Report History</h3>
          <p style={{ fontSize: 13, color: "#0369A1", marginTop: 4, lineHeight: 1.6 }}>Great job keeping your health records up to date. Consistent tracking allows for more accurate trend analysis.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Personal Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Personal Information</h3>
              <button onClick={handleSave} style={{ background: saved ? T.optimal : T.brand, color: "white", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}>
                {saved ? <><Icon path={Icons.check} size={13} color="white" />Saved!</> : "Save Changes"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "First Name", key: "first_name" as const, type: "text" },
                { label: "Last Name", key: "last_name" as const, type: "text" },
                { label: "Age", key: "age" as const, type: "number" },
                { label: "Blood Type", key: "blood_type" as const, type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} value={profile[f.key] || ""} onChange={e => setProfile(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "white", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.text, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = T.brand}
                    onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              ))}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, display: "block", marginBottom: 5 }}>Sex</label>
                <select value={profile.sex || ""} onChange={e => setProfile(prev => ({ ...prev, sex: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "white", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.text, outline: "none" }}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Uploaded Reports */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Uploaded Reports</h3>
              <button style={{ fontSize: 12, color: T.brand, fontWeight: 700, background: "white", border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>+ Upload new</button>
            </div>
            {[
              { date: "Oct 24, 2024", name: "Full Blood Panel" },
              { date: "Jul 24, 2024", name: "Routine Checkup Panel" },
              { date: "Jan 24, 2024", name: "Metabolic Panel" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: T.page, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 8, cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon path={Icons.fileText} size={18} color={T.brand} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{r.date}</div>
                </div>
                <span style={{ fontSize: 12, color: T.brand, fontWeight: 600 }}>View <Icon path={Icons.chevronRight} size={13} color={T.brand} /></span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Context */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Health Context</h3>
            <button onClick={handleSave} style={{ background: T.brand, color: "white", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Update Context</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: 10 }}>Active Symptoms</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {symptoms.map(s => (
                <span key={s} style={{ fontSize: 12, fontWeight: 600, background: "white", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", color: T.textSec, display: "flex", alignItems: "center", gap: 7 }}>
                  {s}
                  <button onClick={() => toggleSymptom(s)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0 }}><Icon path={Icons.x} size={12} color={T.textMuted} /></button>
                </span>
              ))}
              {symptoms.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>No symptoms selected.</p>}
            </div>

            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: 8 }}>Quick Add</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SYMPTOM_OPTIONS.map(opt => (
                <button key={opt} onClick={() => toggleSymptom(opt)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: `1px solid ${symptoms.includes(opt) ? T.brand : T.border}`, background: symptoms.includes(opt) ? T.brand : "white", color: symptoms.includes(opt) ? "white" : T.textSec, cursor: "pointer", fontWeight: 500, transition: "all 0.15s" }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Health Summary Stats */}
          <div style={{ marginTop: 24, padding: 16, background: "white", border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Clinical Summary</p>
            {[
              { label: "Health Score", value: "82 / 100", color: T.optimal },
              { label: "Reports Uploaded", value: "3 reports", color: T.brand },
              { label: "Biomarkers Tracked", value: "8 values", color: "#8B5CF6" },
              { label: "Last Report", value: "Oct 24, 2024", color: T.textSec },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ fontSize: 13, color: T.textSec }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── SETTINGS PAGE ─────────────────────────────────────────────────────── */
const SettingsPage = () => {
  const [password, setPassword] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 680, minHeight: "100vh", background: T.page }}>
      {toastMsg && (
        <div style={{ position: "fixed", top: 20, right: 20, background: T.text, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, animation: "fadeUp 0.4s ease both" }}>
          {toastMsg}
        </div>
      )}

      <h1 className="font-display" style={{ fontSize: 34, color: T.text, marginBottom: 32 }}>Account Settings</h1>

      {/* Change Password */}
      <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Icon path={Icons.key} size={20} color={T.brand} />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Change Password</h2>
        </div>
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "11px 14px", background: T.page, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.text, outline: "none", marginBottom: 12 }} />
        <button onClick={() => { showToast("Demo: Password update simulated ✓"); setPassword(""); }} style={{ background: T.brand, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Update Password</button>
      </div>

      {/* Data Protection */}
      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#065F46", marginBottom: 8 }}>Data Protection & Portability</h2>
        <p style={{ fontSize: 14, color: "#047857", lineHeight: 1.7 }}>Your data belongs to you. Export or permanently delete your entire health record at any time. We do not hold your data hostage.</p>
      </div>

      {/* Export */}
      <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Icon path={Icons.download} size={20} color={T.optimal} />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Export Health Data</h2>
        </div>
        <p style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>Download a CSV spreadsheet of all your extracted biomarkers and health scores.</p>
        <button onClick={() => showToast("Demo: CSV export would download here")} style={{ background: T.page, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Export to CSV</button>
      </div>

      {/* Developer Settings */}
      <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Icon path={Icons.terminal} size={20} color="#8B5CF6" />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Developer Settings</h2>
        </div>
        <p style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>Enable extra diagnostic information and view raw AI/OCR data. Useful for project presentations.</p>
        <button onClick={() => { setDebugMode(d => !d); showToast(`Debug mode ${debugMode ? "disabled" : "enabled"}`); }} style={{ background: debugMode ? "#8B5CF6" : T.page, border: `1px solid ${debugMode ? "#8B5CF6" : T.border}`, color: debugMode ? "white" : T.text, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {debugMode ? "Debug Mode: ON" : "Debug Mode: OFF"}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ background: "white", border: "2px solid #FCA5A5", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 16, top: 16, opacity: 0.05 }}><Icon path={Icons.trash} size={60} color={T.critical} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Icon path={Icons.trash} size={20} color={T.critical} />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Danger Zone</h2>
        </div>
        <p style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>Permanently delete your account and all associated health data. This cannot be reversed.</p>
        <button onClick={() => showToast("Demo: Account deletion disabled in demo mode")} style={{ background: "white", border: "1px solid #FCA5A5", color: T.critical, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Delete Account</button>
      </div>
    </div>
  );
};

/* ─── APP SHELL ─────────────────────────────────────────────────────────── */
export default function DemoPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pageLabels: Record<string, string> = {
    dashboard: "Clinical Overview",
    results: "Lab Results",
    assistant: "AI Assistant",
    profile: "Clinical Profile",
    settings: "Account Settings",
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage onNavigate={setCurrentPage} />;
      case "results": return <ResultsPage onNavigate={setCurrentPage} />;
      case "assistant": return <AssistantPage />;
      case "profile": return <ProfilePage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes scoreCount { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @media (max-width: 768px) {
          .demo-sidebar { display: none !important; }
          .demo-main { margin-left: 0 !important; width: 100% !important; }
          .demo-detail-sheet { width: 100% !important; max-width: 100% !important; left: 0 !important; right: 0 !important; }
          .demo-bottom-nav { display: flex !important; }
          .demo-hero-title { font-size: 36px !important; }
          .demo-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .demo-bottom-nav { display: none !important; }
        }
      `}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar className="demo-sidebar" currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="demo-main" style={{ flex: 1, overflowY: "auto", background: T.page }}>

          {/* ── Demo banner ── */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(250,250,247,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${T.border}`,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            {/* Left: breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, animation: "pulse 2s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo</span>
              <Icon path={Icons.chevronRight} size={12} color={T.textMuted} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{pageLabels[currentPage]}</span>
            </div>

            {/* Right: demo pill + back */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", color: "#92400E",
                background: "#FEF3C7", border: "1px solid #FDE68A",
                padding: "3px 10px", borderRadius: 100,
              }}>
                ✦ Interactive Demo — no account needed
              </span>
              <Link href="/" style={{
                background: T.card, border: `1px solid ${T.border}`,
                color: T.textSec, borderRadius: 10, padding: "7px 16px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                textDecoration: "none",
              }}>
                <Icon path={Icons.arrowLeft} size={13} color={T.textSec} />
                Exit demo
              </Link>
            </div>
          </div>

          {renderPage()}
          </main>
          
          {/* Mobile Bottom Nav */}
          <nav className="demo-bottom-nav" style={{
            display: 'none',
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#FFF', borderTop: '1px solid #E8E6DF',
            padding: '8px 16px',
            justifyContent: 'space-around', zIndex: 50,
          }}>
            {["dashboard", "results", "assistant", "profile", "settings"].map(id => {
              const active = currentPage === id;
              const labels: Record<string, string> = { dashboard: "Home", results: "Labs", assistant: "AI", profile: "Profile", settings: "Settings" };
              const iconPaths: Record<string, string> = { dashboard: Icons.dashboard as string, results: Icons.fileText as string, assistant: Icons.sparkles as string, profile: Icons.user as string, settings: Icons.settings as string };
              const iconPath = iconPaths[id];
              return (
                <button key={id} onClick={() => setCurrentPage(id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 12px', border: 'none', background: 'transparent',
                  cursor: 'pointer', minWidth: 44, minHeight: 44,
                }}>
                  <Icon path={iconPath} size={22} color={active ? T.brand : '#A8A29E'} />
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? T.brand : '#A8A29E' }}>{labels[id]}</span>
                </button>
              );
            })}
          </nav>
      </div>
    </>
  );
}
