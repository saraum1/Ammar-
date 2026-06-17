import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function calcProgress(phases) {
  if (!phases?.length) return 0;
  return Math.round(phases.reduce((a, p) => a + (p.progress || 0), 0) / phases.length);
}
function currentPhase(phases) {
  if (!phases?.length) return null;
  return phases.find(p => (p.progress || 0) < 100) || phases[phases.length - 1];
}
const STATUS_MAP = {
  active:    { label: "جارٍ",   color: "#16a34a", bg: "#dcfce7", dot: "#22c55e" },
  completed: { label: "مكتمل", color: "#2563eb", bg: "#dbeafe", dot: "#3b82f6" },
  paused:    { label: "متوقف", color: "#d97706", bg: "#fef3c7", dot: "#f59e0b" }
};
export default function MyProjects() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/projects/client", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.data) setProjects(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);
  const active    = projects.filter(p => p.status === "active").length;
  const completed = projects.filter(p => p.status === "completed").length;
  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh", direction: "rtl" }}>
      {}
      <div style={{ background: "white", padding: "36px 40px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", color: "#111827", letterSpacing: -0.5 }}>مشاريعي</h1>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>تابع تقدم مشاريعك مع الشركات</p>
          </div>
          {!loading && projects.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <StatChip label="إجمالي المشاريع" value={projects.length} color="#C4956A" bg="#F0E4D0" />
              <StatChip label="جارية" value={active} color="#16a34a" bg="#dcfce7" />
              <StatChip label="مكتملة" value={completed} color="#2563eb" bg="#dbeafe" />
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onSearch={() => navigate("/engineering")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onClick={() => navigate(`/my-projects/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function StatChip({ label, value, color, bg }) {
  return (
    <div style={{ borderRadius: 8, padding: "5px 16px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #EDE3D8", background: "white" }}>
      <span style={{ fontSize: 17, fontWeight: 900, color }}>{value}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{label}</span>
    </div>
  );
}
function ProjectCard({ project, onClick }) {
  const progress = calcProgress(project.phases);
  const phase    = currentPhase(project.phases);
  const status   = STATUS_MAP[project.status] || STATUS_MAP.active;
  const company  = project.Company;
  const donePhases = project.phases?.filter(p => p.progress === 100).length || 0;
  const totalPhases = project.phases?.length || 0;
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 12,
        padding: "22px 26px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "border-color 0.2s",
        border: "1px solid #EDE3D8",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C4956A"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#EDE3D8"; }}
    >
      {}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ textAlign: "right" }}>
          <h3 style={{ fontSize: 19, fontWeight: 900, margin: 0, color: "#111827" }}>{project.type}</h3>
          {company && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-start", marginTop: 4 }}>
              <span style={{ color: "#C4956A", fontSize: 13, fontWeight: 700 }}>{company.ownerName}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {project.unreadByClient && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 999, padding: "2px 10px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>تحديث جديد</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.dot }} />
            <span style={{ background: status.bg, color: status.color, fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
      {}
      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-start", color: "#6b7280", fontSize: 13 }}>
        <MapPin size={13} color="#C4956A" />
        <span>{project.location}</span>
      </div>
      {}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: progress === 100 ? "#22c55e" : "#C4956A" }}>{progress}%</span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>الإنجاز</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
            <span>{donePhases}/{totalPhases} مراحل مكتملة</span>
            <TrendingUp size={13} />
          </div>
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 999, height: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            borderRadius: 999,
            background: progress === 100
              ? "linear-gradient(90deg,#22c55e,#16a34a)"
              : "linear-gradient(90deg,#A67C52,#C4956A)",
            width: `${progress}%`,
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>
      {}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8, background: "#fafafa", borderRadius: 12, padding: "10px 14px", border: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>المرحلة الحالية:</span>
        {progress === 100
          ? <CheckCircle2 size={16} color="#22c55e" />
          : <Clock size={16} color="#f59e0b" />}
        <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{phase ? phase.name : "—"}</span>
      </div>
    </div>
  );
}
function EmptyState({ onSearch }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px", color: "#111827" }}>لا توجد مشاريع بعد</h2>
      <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 32px", lineHeight: 1.8 }}>
        أرسل طلبك لأي شركة وستظهر مشاريعك هنا
      </p>
      <button
        onClick={onSearch}
        style={{
          background: "#1B3A2D",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "12px 28px",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ابحث عن شركة
      </button>
    </div>
  );
}
function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "22px 26px", border: "1px solid #EDE3D8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 60, height: 22, background: "#f3f4f6", borderRadius: 8 }} />
        <div style={{ width: 120, height: 22, background: "#f3f4f6", borderRadius: 8 }} />
      </div>
      <div style={{ width: 100, height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 16, marginLeft: "auto" }} />
      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, marginBottom: 14 }} />
      <div style={{ height: 40, background: "#f9fafb", borderRadius: 12 }} />
    </div>
  );
}