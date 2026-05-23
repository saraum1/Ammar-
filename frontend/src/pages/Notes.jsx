import React, { useState, useEffect } from "react";
import { BookOpen, Plus, X, Trash2, Image, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PHASES = [
  "كل المراحل", "التخطيط والميزانية", "التصميم الهندسي",
  "استخراج التراخيص", "الحفر والأساسيات", "الهيكل الإنشائي",
  "السقف والبطاقة", "السباكة والكهرباء", "العزل والجدران",
  "التشطيبات الداخلية", "التسليم النهائي"
];

export default function Notes() {
  const { token } = useAuth();

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F0", display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
        <div style={{ background: "white", borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.09)", maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📓</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>سجّل دخولك أول</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>عشان تقدر تحفظ مذكراتك</p>
          <Link to="/login" style={{ display: "block", background: "#C4956A", color: "white", padding: "12px 0", borderRadius: 14, fontWeight: 700, textDecoration: "none" }}>
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [filter,     setFilter]     = useState("كل المراحل");
  const [form,       setForm]       = useState({ title: "", phase: "كل المراحل", content: "" });
  const [imgPreview, setImgPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/notes", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (Array.isArray(d)) setNotes(d);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [token]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const body = {
        title:    form.title.trim(),
        phase:    form.phase === "كل المراحل" ? null : form.phase,
        content:  form.content.trim() || null,
        imageUrl: imgPreview || null
      };
      const r = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (r.ok) {
        await fetchNotes();
        setForm({ title: "", phase: "كل المراحل", content: "" });
        setImgPreview(null);
        setShowForm(false);
      } else {
        const errText = await r.text();
        console.error("Notes save error:", r.status, errText);
        alert(`خطأ ${r.status}: ${errText}`);
      }
    } catch(e) {
      console.error("Notes fetch error:", e);
      alert("خطأ في الاتصال: " + e.message);
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      const r = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) setNotes(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const filtered = filter === "كل المراحل"
    ? notes
    : notes.filter(n => n.phase === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F0" }} dir="rtl">

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 50, height: 50, background: "#F0E4D0", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#C4956A" }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>مذكراتي</h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "3px 0 0" }}>سجّل ملاحظاتك وتفاصيل كل مرحلة</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#C4956A", color: "white", border: "none", borderRadius: 14, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,149,106,0.35)" }}
        >
          <Plus size={17} /> مذكرة جديدة
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap", paddingBottom: 6, scrollbarWidth: "none" }}>
          {["كل المراحل", "التخطيط والميزانية", "التصميم الهندسي", "استخراج التراخيص", "الحفر والأساسيات", "التسليم النهائي"].map(ph => (
            <button
              key={ph}
              onClick={() => setFilter(ph)}
              style={{
                padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap",
                background: filter === ph ? "#C4956A" : "white",
                color:      filter === ph ? "white"   : "#6b7280",
                boxShadow:  filter === ph ? "0 4px 10px rgba(196,149,106,0.3)" : "none"
              }}
            >
              {ph}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
            <Loader size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
            <BookOpen size={48} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
            <p style={{ fontSize: 15 }}>لا توجد مذكرات بعد — أضف أولى مذكراتك!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {filtered.map(note => (
              <NoteCard key={note.id} note={note} onDelete={() => handleDelete(note.id)} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ background: "white", width: "100%", maxWidth: 460, borderRadius: 28, padding: 32, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 14, left: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20 }}>
              <X size={22} />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, textAlign: "right" }}>مذكرة جديدة</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={lblStyle}>عنوان المذكرة *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: زيارة الموقع - الأساسات"
                style={inpStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lblStyle}>مرحلة البناء</label>
              <select
                value={form.phase}
                onChange={e => setForm({ ...form, phase: e.target.value })}
                style={inpStyle}
              >
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lblStyle}>ملاحظات</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="اكتب ملاحظاتك وتفاصيل هذه المرحلة..."
                rows={3}
                style={{ ...inpStyle, resize: "none" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lblStyle}>صورة مرفقة</label>
              <div
                style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "border-color 0.15s" }}
                onClick={() => document.getElementById("noteImgInput").click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#C4956A"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <input id="noteImgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                {imgPreview ? (
                  <img src={imgPreview} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
                ) : (
                  <>
                    <Image size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>انقر لرفع صورة</p>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleAdd}
                disabled={!form.title.trim() || submitting}
                style={{ flex: 1, background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (!form.title.trim() || submitting) ? 0.5 : 1 }}
              >
                {submitting ? "جاري الحفظ..." : "إضافة المذكرة"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "13px 22px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onDelete }) {
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", transition: "box-shadow 0.18s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)"}
    >
      {note.imageUrl && (
        <img src={note.imageUrl} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
      )}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <button
            onClick={onDelete}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}
          >
            <Trash2 size={15} />
          </button>
          <div style={{ textAlign: "right", flex: 1 }}>
            <h3 style={{ fontWeight: 800, color: "#1f2937", fontSize: 15, margin: 0 }}>{note.title}</h3>
            {note.phase && (
              <span style={{ display: "inline-block", background: "#F0E4D0", color: "#C4956A", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginTop: 6 }}>
                {note.phase}
              </span>
            )}
          </div>
        </div>

        {note.content && (
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: "0 0 12px", textAlign: "right" }}>{note.content}</p>
        )}

        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, textAlign: "right" }}>
          {new Date(note.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}

const lblStyle = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151",
  marginBottom: 6, textAlign: "right"
};
const inpStyle = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12,
  padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right",
  background: "#f9fafb", fontFamily: "inherit", boxSizing: "border-box",
  color: "#111827"
};
