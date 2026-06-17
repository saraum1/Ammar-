import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronRight, MapPin, CheckCircle, Star, Send,
  Phone, Mail, MessageCircle, Bell, StickyNote,
  TrendingUp, Calculator, Image, X, Plus, Trash2,
  ChevronDown, ChevronUp, Calendar
} from "lucide-react";

const PHASE_ICONS = ["01","02","03","04","05","06","07","08","09","10"];

function phaseColor(p) {
  if (p === 100) return "#22c55e";
  if (p > 0)    return "#C4956A";
  return "#d1d5db";
}

const STATUS_CFG = {
  active:    { label: "جارٍ",   color: "#16a34a", bg: "#dcfce7", bar: "linear-gradient(90deg,#A67C52,#C4956A)" },
  completed: { label: "مكتمل", color: "#2563eb", bg: "#dbeafe", bar: "linear-gradient(90deg,#22c55e,#16a34a)" },
  paused:    { label: "متوقف", color: "#d97706", bg: "#fef3c7", bar: "linear-gradient(90deg,#f59e0b,#d97706)" },
};

const TABS = [
  { key: "overview",  label: "نظرة عامة" },
  { key: "calc",      label: "الحاسبة" },
  { key: "updates",   label: "التحديثات" },
  { key: "notes",     label: "ملاحظاتي" },
];

function fmtNum(n) {
  return Number(n || 0).toLocaleString("ar-SA");
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function ProjectDetail() {
  const { id }    = useParams();
  const { token } = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [project,     setProject]   = useState(null);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState("");
  const [tab,         setTab]       = useState("overview");

  /* ---- ملاحظات ---- */
  const [noteText,    setNoteText]    = useState("");
  const [noteImage,   setNoteImage]   = useState(null);
  const [notePreview, setNotePreview] = useState(null);
  const [sendingNote, setSendingNote] = useState(false);
  const [noteOk,      setNoteOk]      = useState(false);
  const [noteErr,     setNoteErr]     = useState("");

  /* ---- حاسبة ---- */
  const [calcItems,   setCalcItems]   = useState({});  // { phaseIdx: [{id,name,price}] }
  const [openPhase,   setOpenPhase]   = useState(null);
  const [newName,     setNewName]     = useState("");
  const [newPrice,    setNewPrice]    = useState("");
  const [savingCalc,  setSavingCalc]  = useState(false);

  /* ---- حجز اجتماع ---- */
  const [meetModal,   setMeetModal]   = useState(false);
  const [meetDate,    setMeetDate]    = useState("");
  const [meetTime,    setMeetTime]    = useState("");
  const [meetTopic,   setMeetTopic]   = useState("");
  const [sendingMeet, setSendingMeet] = useState(false);
  const [meetOk,      setMeetOk]      = useState(false);
  const [meetErr,     setMeetErr]     = useState("");

  /* ---- تقييم ---- */
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  /* ---- تحميل المشروع ---- */
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(`/api/projects/client/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setProject(d.data);
          setCalcItems(d.data.calculatorItems || {});
        } else {
          setError(d.message || "حدث خطأ");
        }
      })
      .catch(() => setError("تعذر الاتصال بالسيرفر"))
      .finally(() => setLoading(false));
    fetch(`/api/projects/${id}/mark-read`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  }, [id, token]);

  /* ---- صورة الملاحظة ---- */
  const handlePickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNoteImage(file);
    const reader = new FileReader();
    reader.onload = ev => setNotePreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const clearImage = () => {
    setNoteImage(null); setNotePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ---- إرسال ملاحظة ---- */
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSendingNote(true); setNoteErr("");
    try {
      const fd = new FormData();
      fd.append("text", noteText.trim());
      if (noteImage) fd.append("noteImage", noteImage);

      const res = await fetch(`/api/projects/client/${id}/note`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const d = await res.json();
      if (res.ok) {
        setProject(d.data);
        setNoteText(""); clearImage();
        setNoteOk(true); setTimeout(() => setNoteOk(false), 2500);
      } else {
        setNoteErr(d.message || "فشل الإرسال");
      }
    } catch { setNoteErr("تعذر الاتصال"); }
    finally  { setSendingNote(false); }
  };

  /* ---- حاسبة: حفظ مرحلة ---- */
  const savePhaseCalc = useCallback(async (phaseIdx, items) => {
    setSavingCalc(true);
    try {
      await fetch(`/api/projects/client/${id}/calculator`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phaseIndex: phaseIdx, items }),
      });
    } catch {}
    finally { setSavingCalc(false); }
  }, [id, token]);

  const addCalcItem = () => {
    if (!newName.trim() || !newPrice) return;
    const item = { id: uid(), name: newName.trim(), price: parseFloat(newPrice) || 0 };
    const updated = [...(calcItems[openPhase] || []), item];
    const next = { ...calcItems, [openPhase]: updated };
    setCalcItems(next);
    savePhaseCalc(openPhase, updated);
    setNewName(""); setNewPrice("");
  };

  const removeCalcItem = (phaseIdx, itemId) => {
    const updated = (calcItems[phaseIdx] || []).filter(i => i.id !== itemId);
    const next = { ...calcItems, [phaseIdx]: updated };
    setCalcItems(next);
    savePhaseCalc(phaseIdx, updated);
  };

  /* ---- حجز اجتماع ---- */
  const handleProposeMeeting = async () => {
    if (!meetDate || !meetTime || !meetTopic.trim()) return;
    setSendingMeet(true); setMeetErr("");
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: parseInt(id), proposedDate: meetDate, proposedTime: meetTime, topic: meetTopic.trim() })
      });
      const d = await res.json();
      if (res.ok) {
        setMeetOk(true);
        setMeetDate(""); setMeetTime(""); setMeetTopic("");
        setTimeout(() => { setMeetOk(false); setMeetModal(false); }, 2500);
      } else {
        setMeetErr(d.message || "فشل الإرسال");
      }
    } catch { setMeetErr("تعذر الاتصال"); }
    finally { setSendingMeet(false); }
  };

  /* ---- تقييم ---- */
  const handleReview = async () => {
    if (!myRating || !company) return;
    setReviewing(true); setReviewMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: company.id, projectId: project.id, rating: myRating, comment: myComment || null }),
      });
      const d = await res.json();
      if (res.status === 409) { setReviewMsg("قيّمت هذه الشركة مسبقاً"); return; }
      if (!res.ok) { setReviewMsg(d.message || "حدث خطأ"); return; }
      setReviewMsg("شكراً، تم إرسال تقييمك");
      setMyRating(0); setMyComment("");
    } catch { setReviewMsg("تعذر الاتصال"); }
    finally  { setReviewing(false); }
  };

  /* ---- Loading / Error ---- */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F0" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#9ca3af" }}>جاري التحميل...</p>
      </div>
    </div>
  );
  if (error || !project) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F0", direction: "rtl" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#ef4444", marginBottom: 16 }}>{error || "المشروع غير موجود"}</p>
        <Link to="/my-projects" style={{ color: "#C4956A", fontWeight: 700 }}>← العودة لمشاريعي</Link>
      </div>
    </div>
  );

  const company      = project.Company;
  const st           = STATUS_CFG[project.status] || STATUS_CFG.active;
  const totalProgress = project.phases?.length
    ? Math.round(project.phases.reduce((s, p) => s + p.progress, 0) / project.phases.length) : 0;
  const donePhases   = project.phases?.filter(p => p.progress === 100).length || 0;
  const grandTotal   = Object.values(calcItems).flat().reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F0", direction: "rtl" }}>

      {/* Breadcrumb */}
      <div style={{ background: "white", borderBottom: "1px solid #f0e8df", padding: "13px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <Link to="/my-projects" style={{ color: "#C4956A", fontWeight: 700, textDecoration: "none" }}>مشاريعي</Link>
          <ChevronRight size={14} color="#d1d5db" />
          <span style={{ color: "#374151", fontWeight: 600 }}>{project.type}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px 80px" }}>

        {/* ===== بطاقة الملخص ===== */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ background: "white", padding: "18px 24px 12px", borderBottom: "1px solid #EDE3D8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#111827" }}>{project.type}</h1>
                {company && <p style={{ color: "#C4956A", fontWeight: 700, margin: "4px 0 0", fontSize: 13 }}>{company.ownerName}</p>}
              </div>
              <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
                {st.label}
              </span>
            </div>
          </div>
          <div style={{ padding: "10px 24px 16px" }}>
            <div style={{ display: "flex", justifyContent: "flex-start", gap: 16, fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
              {project.location && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} color="#C4956A" /> {project.location}
                </span>
              )}
              {project.budget && <span>{project.budget}</span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: totalProgress === 100 ? "#22c55e" : "#C4956A", lineHeight: 1 }}>{totalProgress}</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>% إنجاز كلي</span>
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{donePhases} / {project.phases?.length} مراحل مكتملة</span>
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalProgress}%`, background: st.bar, borderRadius: 999, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* ===== التابات ===== */}
        <div style={{ display: "flex", gap: 6, background: "white", borderRadius: 16, padding: 6, marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 6px", border: "none", cursor: "pointer",
                borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                transition: "all 0.15s",
                background: tab === t.key ? "#C4956A" : "transparent",
                color:      tab === t.key ? "white"   : "#6b7280",
                boxShadow:  tab === t.key ? "0 4px 12px rgba(196,149,106,0.3)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: نظرة عامة ===== */}
        {tab === "overview" && (
          <Card>
            {/* زر حجز اجتماع */}
            {company && (
              <div style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setMeetModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #EDE3D8", borderRadius: 8, padding: "11px 18px", cursor: "pointer", fontFamily: "inherit", color: "#374151", fontWeight: 700, fontSize: 13, width: "100%" }}
                >
                  <span style={{ flex: 1, textAlign: "right" }}>احجز اجتماعاً مع {company.ownerName}</span>
                  <Calendar size={16} color="#2563eb" />
                </button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {project.phases.map((phase, i) => (
                <PhaseCard key={i} phase={phase} icon={PHASE_ICONS[i]} />
              ))}
            </div>

            {/* تقييم — يظهر فقط لو المشروع مكتمل */}
            {project.status === "completed" && company && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#111827" }}>قيّم تجربتك</h3>
                </div>
                {reviewMsg ? (
                  <div style={{ background: reviewMsg.includes("مسبقاً") ? "#eff6ff" : "#f0fdf4", borderRadius: 12, padding: "14px 18px", textAlign: "center" }}>
                    <p style={{ color: reviewMsg.includes("مسبقاً") ? "#2563eb" : "#16a34a", fontWeight: 700, margin: 0 }}>{reviewMsg}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-start", gap: 4, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setMyRating(s)}
                          style={{ background: "none", border: "none", padding: "2px", cursor: "pointer", lineHeight: 1, transition: "transform 0.1s", transform: s <= myRating ? "scale(1.15)" : "scale(1)" }}>
                          <Star size={30} color="#f59e0b" fill={s <= myRating ? "#f59e0b" : "none"} strokeWidth={1.5} />
                        </button>
                      ))}
                    </div>
                    <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
                      placeholder="شاركنا تجربتك... (اختياري)" rows={2}
                      style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right", resize: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12, background: "#fafafa" }}
                      onFocus={e => e.target.style.borderColor="#C4956A"} onBlur={e => e.target.style.borderColor="#e5e7eb"} />
                    <button onClick={handleReview} disabled={!myRating || reviewing}
                      style={{ background: !myRating ? "#f3f4f6" : "#1B3A2D", color: !myRating ? "#9ca3af" : "white", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: !myRating ? "not-allowed" : "pointer", width: "100%", fontFamily: "inherit" }}>
                      {reviewing ? "جاري الإرسال..." : "نشر التقييم"}
                    </button>
                  </>
                )}
              </div>
            )}
          </Card>
        )}

        {/* ===== TAB: الحاسبة ===== */}
        {tab === "calc" && (
          <div>
            {/* إجمالي كل المراحل */}
            <div style={{ background: "white", borderRadius: 10, padding: "18px 22px", marginBottom: 16, border: "1px solid #EDE3D8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>إجمالي كل المراحل</p>
                <p style={{ fontSize: 30, fontWeight: 900, color: "#C4956A", margin: 0, lineHeight: 1 }}>
                  {fmtNum(grandTotal)} <span style={{ fontSize: 14, color: "#9ca3af" }}>﷼</span>
                </p>
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>ريال سعودي</span>
            </div>

            {/* قائمة المراحل */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {project.phases.map((phase, i) => {
                const items   = calcItems[i] || [];
                const subTotal = items.reduce((s, x) => s + (x.price || 0), 0);
                const isOpen  = openPhase === i;

                return (
                  <div key={i} style={{ background: "white", borderRadius: 10, overflow: "hidden", border: `1px solid ${isOpen ? "#C4956A" : "#EDE3D8"}` }}>
                    {/* رأس المرحلة */}
                    <button
                      onClick={() => setOpenPhase(isOpen ? null : i)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "right" }}>
                        <span style={{ fontSize: 20 }}>{PHASE_ICONS[i]}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{phase.name}</p>
                          {items.length > 0 && (
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{items.length} بند</p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {subTotal > 0 && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#C4956A" }}>{fmtNum(subTotal)} ﷼</span>
                        )}
                        {isOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                      </div>
                    </button>

                    {/* تفاصيل المرحلة المفتوحة */}
                    {isOpen && (
                      <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f5f5f5" }}>
                        {/* البنود الموجودة */}
                        {items.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12, marginBottom: 14 }}>
                            {items.map(item => (
                              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", borderRadius: 10, padding: "9px 12px", border: "1px solid #f0f0f0" }}>
                                <span style={{ fontSize: 13, color: "#374151", flex: 1, textAlign: "right" }}>{item.name}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#C4956A", flexShrink: 0 }}>{fmtNum(item.price)} ﷼</span>
                                <button onClick={() => removeCalcItem(i, item.id)}
                                  style={{ background: "#fff0f0", border: "none", borderRadius: 7, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Trash2 size={12} color="#ef4444" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* إضافة بند جديد */}
                        <div style={{ background: "#f9fafb", borderRadius: 14, padding: 12, border: "1px dashed #e5e7eb" }}>
                          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "right", margin: "0 0 10px", fontWeight: 600 }}>+ إضافة بند جديد</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="text"
                              placeholder="اسم البند (مثال: خشب، عمالة...)"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && addCalcItem()}
                              style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 14, textAlign: "right", outline: "none", fontFamily: "inherit" }}
                              onFocus={e => e.target.style.borderColor="#C4956A"} onBlur={e => e.target.style.borderColor="#e5e7eb"}
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="السعر ﷼"
                              value={newPrice}
                              onChange={e => setNewPrice(e.target.value)}
                              style={{ width: 90, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 14, textAlign: "center", outline: "none", fontFamily: "inherit" }}
                              onFocus={e => e.target.style.borderColor="#C4956A"} onBlur={e => e.target.style.borderColor="#e5e7eb"}
                            />
                            <button
                              onClick={addCalcItem}
                              disabled={!newName.trim() || !newPrice}
                              style={{ background: newName.trim() && newPrice ? "#C4956A" : "#f3f4f6", color: newName.trim() && newPrice ? "white" : "#9ca3af", border: "none", borderRadius: 10, padding: "0 14px", cursor: newName.trim() && newPrice ? "pointer" : "not-allowed", flexShrink: 0, fontFamily: "inherit", fontSize: 20, fontWeight: 700 }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {savingCalc && <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 6 }}>جاري الحفظ...</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== TAB: التحديثات ===== */}
        {tab === "updates" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* تحديثات الشركة */}
            <Card title="تحديثات الشركة" icon={<Bell size={16} color="#C4956A" />}>
              {project.updates?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {project.updates.map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, background: "#fafafa", borderRadius: 12, padding: "11px 14px" }}>
                        <p style={{ fontSize: 14, color: "#374151", margin: "0 0 5px", lineHeight: 1.7, textAlign: "right" }}>{u.text}</p>
                        <p style={{ fontSize: 11, color: "#b0b7c3", margin: 0, textAlign: "right" }}>
                          {new Date(u.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div style={{ width: 3, background: "#C4956A", borderRadius: 999, alignSelf: "stretch", flexShrink: 0, opacity: 0.4 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyMsg text="لا توجد تحديثات من الشركة بعد" />
              )}
            </Card>

            {/* تواصل مع الشركة */}
            {company?.User && (
              <Card title="تواصل مع الشركة" icon={<MessageCircle size={16} color="#C4956A" />}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {company.User.phone && (
                    <a href={`tel:${company.User.phone}`} style={contactRow}>
                      <span style={{ fontSize: 14, color: "#374151", fontWeight: 600, direction: "ltr" }}>{company.User.phone}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F0E4D0", borderRadius: 9, padding: "7px 12px" }}>
                        <Phone size={14} color="#C4956A" />
                        <span style={{ color: "#C4956A", fontSize: 13, fontWeight: 700 }}>اتصال</span>
                      </div>
                    </a>
                  )}
                  {company.User.email && (
                    <a href={`mailto:${company.User.email}`} style={contactRow}>
                      <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{company.User.email}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", borderRadius: 9, padding: "7px 12px" }}>
                        <Mail size={14} color="#3b82f6" />
                        <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 700 }}>مراسلة</span>
                      </div>
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ===== TAB: ملاحظاتي ===== */}
        {tab === "notes" && (
          <Card title="ملاحظاتي للشركة" icon={<StickyNote size={16} color="#C4956A" />}>
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "right", margin: "0 0 14px" }}>
              ملاحظاتك تظهر لفريق الشركة المنفذة
            </p>

            {/* نموذج الإدخال */}
            <div style={{ background: "#fafafa", borderRadius: 16, padding: 14, border: "1px solid #f0f0f0", marginBottom: 16 }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
                rows={3}
                style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right", resize: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box", lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor="#C4956A"} onBlur={e => e.target.style.borderColor="#e5e7eb"}
              />

              {/* معاينة الصورة */}
              {notePreview && (
                <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                  <img src={notePreview} alt="معاينة" style={{ maxWidth: 200, maxHeight: 140, borderRadius: 10, border: "1px solid #e5e7eb", objectFit: "cover" }} />
                  <button onClick={clearImage} style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={11} />
                  </button>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                {/* إرفاق صورة */}
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#6b7280", fontWeight: 600, padding: "6px 12px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                  <Image size={13} color="#6b7280" />
                  {noteImage ? noteImage.name.substring(0, 16) + "..." : "إرفاق صورة"}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePickImage} style={{ display: "none" }} />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {noteOk  && <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>تم</span>}
                  {noteErr && <span style={{ color: "#ef4444", fontSize: 12 }}>{noteErr}</span>}
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || sendingNote}
                    style={{ background: !noteText.trim() || sendingNote ? "#f3f4f6" : "#1B3A2D", color: !noteText.trim() || sendingNote ? "#9ca3af" : "white", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: !noteText.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
                  >
                    <Send size={13} />
                    {sendingNote ? "جاري..." : "إرسال"}
                  </button>
                </div>
              </div>
            </div>

            {/* قائمة الملاحظات */}
            {project.clientNotes?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {project.clientNotes.map((n, i) => (
                  <div key={i} style={{ background: "#fff8f3", border: "1px solid #fde8d0", borderRadius: 14, padding: "14px 16px" }}>
                    <p style={{ fontSize: 14, color: "#374151", margin: "0 0 8px", lineHeight: 1.75, textAlign: "right" }}>{n.text}</p>
                    {n.imageUrl && (
                      <a href={`${n.imageUrl}`} target="_blank" rel="noreferrer">
                        <img src={`${n.imageUrl}`} alt="صورة"
                          style={{ maxWidth: 220, maxHeight: 160, borderRadius: 10, border: "1px solid #fde8d0", objectFit: "cover", marginBottom: 8, display: "block" }} />
                      </a>
                    )}
                    <p style={{ fontSize: 11, color: "#b0b7c3", margin: 0, textAlign: "right" }}>
                      {new Date(n.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMsg text="لا توجد ملاحظات بعد — اكتب أول ملاحظة" />
            )}
          </Card>
        )}

      </div>

      {/* ===== مودال حجز الاجتماع ===== */}
      {meetModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setMeetModal(false); }}>
          <div style={{ background: "white", borderRadius: 24, padding: "28px 28px 24px", width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }} dir="rtl">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setMeetModal(false)} style={{ background: "#f3f4f6", border: "none", borderRadius: 9, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#6b7280" />
              </button>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#111827" }}>حجز اجتماع</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>مع {company?.ownerName}</p>
              </div>
            </div>

            {meetOk ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#16a34a", marginBottom: 4 }}>تم إرسال الطلب!</p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>ستتلقى تأكيداً من الشركة قريباً</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textAlign: "right" }}>موضوع الاجتماع *</label>
                  <input type="text" placeholder="مناقشة التصميم، مراجعة التقدم..." value={meetTopic} onChange={e => setMeetTopic(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 14, textAlign: "right", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor="#2563eb"} onBlur={e => e.target.style.borderColor="#e5e7eb"} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textAlign: "right" }}>الوقت *</label>
                    <input type="time" value={meetTime} onChange={e => setMeetTime(e.target.value)}
                      style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor="#2563eb"} onBlur={e => e.target.style.borderColor="#e5e7eb"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textAlign: "right" }}>التاريخ *</label>
                    <input type="date" value={meetDate} onChange={e => setMeetDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                      style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor="#2563eb"} onBlur={e => e.target.style.borderColor="#e5e7eb"} />
                  </div>
                </div>
                {meetErr && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "right" }}>{meetErr}</p>}
                <button onClick={handleProposeMeeting} disabled={!meetDate || !meetTime || !meetTopic.trim() || sendingMeet}
                  style={{ background: !meetDate || !meetTime || !meetTopic.trim() ? "#f3f4f6" : "#1B3A2D", color: !meetDate || !meetTime || !meetTopic.trim() ? "#9ca3af" : "white", border: "none", borderRadius: 8, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: !meetDate || !meetTime || !meetTopic.trim() ? "not-allowed" : "pointer", width: "100%", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Calendar size={15} /> {sendingMeet ? "جاري الإرسال..." : "إرسال طلب الاجتماع"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

/* ======= Sub-components ======= */

function PhaseCard({ phase, icon }) {
  return (
    <div style={{
      background: phase.progress === 100 ? "#f0fdf4" : phase.progress > 0 ? "#fff8f3" : "#fafafa",
      borderRadius: 14, padding: "12px 14px",
      border: `1px solid ${phase.progress === 100 ? "#bbf7d0" : phase.progress > 0 ? "#fde8d0" : "#f0f0f0"}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{phase.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {phase.progress === 100
            ? <CheckCircle size={13} color="#22c55e" />
            : <span style={{ fontSize: 11, fontWeight: 800, color: phaseColor(phase.progress) }}>{phase.progress}%</span>}
        </div>
      </div>
      <div style={{ height: 5, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${phase.progress}%`, background: phaseColor(phase.progress), borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {(title || icon) && (
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f7f7f7", display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#111827" }}>{title}</h2>
        </div>
      )}
      <div style={{ padding: "16px 20px 20px" }}>{children}</div>
    </div>
  );
}

function EmptyMsg({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0", color: "#c4cad4" }}>
      <p style={{ fontSize: 13 }}>{text}</p>
    </div>
  );
}

const contactRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: "#fafafa", borderRadius: 12, padding: "11px 14px",
  color: "#374151", textDecoration: "none", border: "1px solid #f0f0f0",
};
