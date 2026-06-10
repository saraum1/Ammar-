import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle, XCircle, Clock, User, MapPin,
  MessageSquare, Settings, Save, Camera, HardHat, Plus, X,
  Package, ShoppingBag, Trash2, Edit3, Briefcase, ImageIcon, CalendarDays, Image
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES_LIST = ["اسمنت","حديد","خشب","بلاط","دهانات","كهربائيات","سباكة","عزل","رخام"];

const REQ_STATUS = {
  pending:  { label: "معلق",   bg: "#fef3c7", color: "#92400e", icon: <Clock size={13} /> },
  accepted: { label: "مقبول",  bg: "#dcfce7", color: "#166534", icon: <CheckCircle size={13} /> },
  rejected: { label: "مرفوض", bg: "#fee2e2", color: "#991b1b", icon: <XCircle size={13} /> },
};

const PROJ_STATUS = {
  active:    { label: "جارٍ",   bg: "#f0fdf4", color: "#16a34a" },
  completed: { label: "مكتمل", bg: "#eff6ff", color: "#2563eb" },
  paused:    { label: "متوقف", bg: "#fffbeb", color: "#d97706" },
};

const PHASE_ICONS = ["📋","✏️","📄","⛏️","🏗️","🏠","🔧","🧱","🎨","🏆"];

function calcProgress(phases) {
  if (!phases?.length) return 0;
  return Math.round(phases.reduce((a, p) => a + (p.progress || 0), 0) / phases.length);
}

export default function CompanyDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [companyType, setCompanyType] = useState(null);
  const [tab, setTab] = useState(null);

  const [requests, setRequests] = useState([]);

  const [projects,     setProjects]     = useState([]);
  const [activeProj,   setActiveProj]   = useState(null);
  const [updateText,   setUpdateText]   = useState("");
  const [addingUpd,    setAddingUpd]    = useState(false);

  const [profile,     setProfile]     = useState(null);
  const [desc,        setDesc]        = useState("");
  const [city,        setCity]        = useState("الرياض");
  const [specs,       setSpecs]       = useState("");
  const [selCats,     setSelCats]     = useState([]);
  const [coverPrev,   setCoverPrev]   = useState(null);
  const [coverFile,   setCoverFile]   = useState(null);
  const [crFile,      setCrFile]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  const [products,    setProducts]    = useState([]);
  const [showProdForm,setShowProdForm]= useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [prodForm,    setProdForm]    = useState({ name: "", description: "", price: "", unit: "وحدة", category: "" });
  const [prodImage,   setProdImage]   = useState(null);
  const [prodPreview, setProdPreview] = useState(null);
  const prodFileRef = useRef(null);
  const [savingProd,  setSavingProd]  = useState(false);
  const [prodError,   setProdError]   = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErr,  setPwErr]  = useState("");
  const [pwOk,   setPwOk]   = useState(false);
  const [pwLoad, setPwLoad] = useState(false);
  const [deleteNote,    setDeleteNote]    = useState("");
  const [deleteReqSent, setDeleteReqSent] = useState(false);
  const [deleteReqLoad, setDeleteReqLoad] = useState(false);
  const [deleteReqErr,  setDeleteReqErr]  = useState("");

  const [orders,      setOrders]      = useState([]);
  const [meetings,    setMeetings]    = useState([]);
  const [portfolio,       setPortfolio]       = useState([]);
  const [showPortForm,    setShowPortForm]    = useState(false);
  const [editingPort,     setEditingPort]     = useState(null);
  const [portForm,        setPortForm]        = useState({ title: "", description: "", year: "", category: "" });
  const [portImageFile,   setPortImageFile]   = useState(null);
  const [portImagePrev,   setPortImagePrev]   = useState(null);
  const [savingPort,      setSavingPort]      = useState(false);
  const [portErr,         setPortErr]         = useState("");

  const [showProposeForm, setShowProposeForm] = useState(false);
  const [proposeForm, setProposeForm] = useState({ projectId: "", proposedDate: "", proposedTime: "", topic: "", meetLink: "" });
  const [proposeErr,  setProposeErr]  = useState("");
  const [proposing,   setProposing]   = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "company") { navigate("/login"); return; }
    fetch("/api/companies/me/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          const t = d.data.type;
          setCompanyType(t);
          setProfile(d.data);
          setDesc(d.data.description || "");
          setCity(d.data.city || "الرياض");
          setSpecs(Array.isArray(d.data.specializations) ? d.data.specializations.join("، ") : "");
          setSelCats(Array.isArray(d.data.categories) ? d.data.categories : []);
          setTab(t === "materials_supplier" ? "products" : "requests");
        } else {
          setTab("requests");
        }
      })
      .catch(() => setTab("requests"));
  }, [token, user]);

  useEffect(() => {
    if (!tab) return;
    if (tab === "requests")  fetchRequests();
    else if (tab === "projects")  fetchProjects();
    else if (tab === "products")  fetchProducts();
    else if (tab === "orders")    fetchOrders();
    else if (tab === "meetings")   { fetchMeetings(); if (!projects.length) fetchProjects(); }
    else if (tab === "portfolio")  fetchPortfolio();
    else if (tab === "profile")    fetchProfile();
  }, [tab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/requests/company-requests", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) setRequests(d.data);
    } finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/projects/company", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) setProjects(d.data);
    } finally { setLoading(false); }
  };

  const fetchProfile = async () => {
    if (profile) return;
    setLoading(true);
    try {
      const r = await fetch("/api/companies/me/profile", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) {
        setProfile(d.data);
        setDesc(d.data.description || "");
        setCity(d.data.city || "الرياض");
        setSpecs(Array.isArray(d.data.specializations) ? d.data.specializations.join("، ") : "");
        setSelCats(Array.isArray(d.data.categories) ? d.data.categories : []);
      }
    } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const pr = await fetch("/api/products/mine", { headers: { Authorization: `Bearer ${token}` } });
      const pd = await pr.json();
      if (Array.isArray(pd)) setProducts(pd);
    } finally { setLoading(false); }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/meetings/company", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) setMeetings(d.data || []);
    } finally { setLoading(false); }
  };

  const handleMeetingStatus = async (meetId, status, note = "", link = "") => {
    const r = await fetch(`/api/meetings/${meetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, companyNote: note || undefined, meetLink: link || undefined })
    });
    if (r.ok) setMeetings(prev => prev.map(m => m.id === meetId ? { ...m, status, companyNote: note, meetLink: link } : m));
  };

  const handleProposeMeeting = async () => {
    setProposeErr("");
    const { projectId, proposedDate, proposedTime, topic, meetLink } = proposeForm;
    if (!projectId || !proposedDate || !proposedTime || !topic?.trim())
      return setProposeErr("يرجى تعبئة جميع الحقول");
    if (!meetLink?.trim())
      return setProposeErr("رابط الاجتماع إلزامي");
    setProposing(true);
    try {
      const r = await fetch("/api/meetings/company-propose", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: Number(projectId), proposedDate, proposedTime, topic: topic.trim(), meetLink: meetLink.trim() })
      });
      const d = await r.json();
      if (!r.ok) { setProposeErr(d.message || "حدث خطأ"); return; }
      setMeetings(prev => [d.data, ...prev]);
      setShowProposeForm(false);
      setProposeForm({ projectId: "", proposedDate: "", proposedTime: "", topic: "", meetLink: "" });
    } catch { setProposeErr("حدث خطأ في الاتصال"); }
    finally { setProposing(false); }
  };

  /* ========== Portfolio ========== */
  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/portfolio/mine", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) setPortfolio(d.data || []);
    } finally { setLoading(false); }
  };

  const openAddPort = () => {
    setEditingPort(null);
    setPortForm({ title: "", description: "", year: "", category: "" });
    setPortImageFile(null); setPortImagePrev(null); setPortErr("");
    setShowPortForm(true);
  };

  const openEditPort = (item) => {
    setEditingPort(item);
    setPortForm({ title: item.title, description: item.description || "", year: item.year || "", category: item.category || "" });
    setPortImagePrev(item.image ? `${item.image}` : null);
    setPortImageFile(null); setPortErr("");
    setShowPortForm(true);
  };

  const handlePortImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortImageFile(file);
    setPortImagePrev(URL.createObjectURL(file));
  };

  const handleSavePort = async () => {
    setPortErr("");
    if (!portForm.title.trim()) return setPortErr("عنوان العمل مطلوب");
    setSavingPort(true);
    try {
      const fd = new FormData();
      fd.append("title",       portForm.title.trim());
      fd.append("description", portForm.description.trim());
      fd.append("year",        portForm.year);
      fd.append("category",    portForm.category.trim());
      if (portImageFile) fd.append("image", portImageFile);

      const url    = editingPort ? `/api/portfolio/${editingPort.id}` : "/api/portfolio";
      const method = editingPort ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await r.json();
      if (!r.ok) { setPortErr(d.message || "حدث خطأ"); return; }

      if (editingPort) setPortfolio(prev => prev.map(p => p.id === editingPort.id ? d.data : p));
      else             setPortfolio(prev => [d.data, ...prev]);

      setShowPortForm(false);
      setEditingPort(null);
      setPortImageFile(null); setPortImagePrev(null);
    } catch { setPortErr("حدث خطأ في الاتصال"); }
    finally { setSavingPort(false); }
  };

  const handleDeletePort = async (id) => {
    if (!window.confirm("حذف هذا العمل نهائياً؟")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/orders/company-orders", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (Array.isArray(d)) setOrders(d);
    } finally { setLoading(false); }
  };

  const [statusError, setStatusError] = useState("");

  const handleStatus = async (id, status, note = "") => {
    setStatusError("");
    try {
      const r = await fetch(`/api/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, companyNote: note })
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.message?.includes("مشروع")) {
          setTab("projects");
          return;
        }
        setStatusError(d.message || d.error || `خطأ ${r.status}`);
        return;
      }

      fetchRequests();
      if (status === "accepted") {
        setTab("projects");
      }
    } catch {
      setStatusError("تعذّر الاتصال بالسيرفر — تأكد أن الباك اند شغّال");
    }
  };

  const handlePhaseUpdate = async (projectId, phaseIndex, progress) => {
    const r = await fetch(`/api/projects/company/${projectId}/phase`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phaseIndex, progress })
    });
    const d = await r.json();
    if (r.ok) {
      setProjects(prev => prev.map(p => p.id === projectId ? d.data : p));
      setActiveProj(d.data);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateText.trim() || !activeProj) return;
    setAddingUpd(true);
    try {
      const r = await fetch(`/api/projects/company/${activeProj.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: updateText })
      });
      const d = await r.json();
      if (r.ok) {
        setProjects(prev => prev.map(p => p.id === activeProj.id ? d.data : p));
        setActiveProj(d.data);
        setUpdateText("");
      }
    } finally { setAddingUpd(false); }
  };

  const handleProjStatus = async (projectId, status) => {
    const r = await fetch(`/api/projects/company/${projectId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    const d = await r.json();
    if (r.ok) {
      setProjects(prev => prev.map(p => p.id === projectId ? d.data : p));
      if (activeProj?.id === projectId) setActiveProj(d.data);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPrev(reader.result);
    reader.readAsDataURL(file);
  };
  const handleUploadCover = async () => {
    if (!coverFile) return;
    const fd = new FormData();
    fd.append("cover", coverFile);
    await fetch("/api/companies/me/cover", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    setCoverFile(null);
  };

  const handleCRFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setCrFile(file);
  };

  const handleUploadCR = async () => {
    if (!crFile) return;
    const fd = new FormData();
    fd.append("crDoc", crFile);
    await fetch("/api/auth/upload-cr-doc", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    setCrFile(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/companies/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: desc,
          city,
          specializations: specs.split(/[,،]+/).map(s => s.trim()).filter(Boolean),
          categories: selCats
        })
      });
      if (coverFile) await handleUploadCover();
      if (crFile) await handleUploadCR();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchProfile();
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk(false);
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return setPwErr("جميع الحقول مطلوبة");
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwErr("كلمتا المرور الجديدة غير متطابقتين");
    if (pwForm.newPassword.length < 6)
      return setPwErr("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    setPwLoad(true);
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm)
      });
      const d = await r.json();
      if (!r.ok) return setPwErr(d.message || "حدث خطأ");
      setPwOk(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwOk(false), 3000);
    } catch { setPwErr("تعذر الاتصال بالسيرفر"); }
    finally { setPwLoad(false); }
  };

  const handleRequestDelete = async () => {
    setDeleteReqErr("");
    setDeleteReqLoad(true);
    try {
      const r = await fetch("/api/companies/me/request-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: deleteNote })
      });
      const d = await r.json();
      if (!r.ok) { setDeleteReqErr(d.message || "حدث خطأ"); return; }
      setDeleteReqSent(true);
      setProfile(prev => prev ? { ...prev, deleteRequested: true } : prev);
    } catch { setDeleteReqErr("تعذر الاتصال بالسيرفر"); }
    finally { setDeleteReqLoad(false); }
  };

  const openAddProd  = () => { setProdForm({ name: "", description: "", price: "", unit: "وحدة", category: "" }); setProdImage(null); setProdPreview(null); setEditingProd(null); setProdError(""); setShowProdForm(true); };
  const openEditProd = (p) => {
    setProdForm({ name: p.name, description: p.description || "", price: String(p.price), unit: p.unit || "وحدة", category: p.category || "" });
    setProdImage(null);
    // Handle both old file-path images (/uploads/...) and new base64 images
    const preview = p.imageUrl
      ? (p.imageUrl.startsWith("data:") ? p.imageUrl : `${p.imageUrl}`)
      : null;
    setProdPreview(preview);
    setEditingProd(p);
    setProdError("");
    setShowProdForm(true);
  };
  const handleProdImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProdImage(file);
    const reader = new FileReader();
    reader.onload = ev => setProdPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const clearProdImage = () => { setProdImage(null); setProdPreview(null); if (prodFileRef.current) prodFileRef.current.value = ""; };

  const handleSaveProd = async () => {
    if (!prodForm.name.trim() || !prodForm.price) return;
    setSavingProd(true);
    setProdError("");
    try {
      const body = {
        name:        prodForm.name.trim(),
        description: prodForm.description || null,
        price:       parseFloat(prodForm.price),
        unit:        prodForm.unit || "وحدة",
        category:    prodForm.category || null,
      };
      // Only send imageUrl if a new image was selected, or if it's a new product (null)
      if (prodImage) {
        body.imageUrl = prodPreview; // base64 data URL
      } else if (!editingProd) {
        body.imageUrl = null;
      }
      const url    = editingProd ? `/api/products/${editingProd.id}` : "/api/products";
      const method = editingProd ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (r.ok) {
        setShowProdForm(false);
        fetchProducts();
      } else {
        const errData = await r.json().catch(() => ({}));
        setProdError(errData.error || errData.message || `خطأ ${r.status}`);
      }
    } catch (e) {
      setProdError("تعذر الاتصال بالسيرفر");
    } finally { setSavingProd(false); }
  };

  const handleDeleteProd = async (id) => {
    if (!window.confirm("هل تريد حذف هذا المنتج؟")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleCat = (cat) => setSelCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleOrderStatus = async (orderId, status) => {
    const r = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (r.ok) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  if (!tab) return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
      <p style={{ color: "#9ca3af", fontSize: 15 }}>جاري التحميل...</p>
    </div>
  );

  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh" }} dir="rtl">

      <div style={{ background: "white", borderBottom: "1px solid #EDE3D8", padding: "16px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1B3A2D" }}>لوحة تحكم الشركة</h1>
            <p style={{ color: "#9ca3af", fontSize: 12, margin: "2px 0 0" }}>مرحباً {user?.name || user?.email}</p>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", background: "#F5F0EA", borderRadius: 12, padding: "5px" }}>
            {companyType !== "materials_supplier" && <>
              <TabBtn active={tab === "requests"} onClick={() => setTab("requests")} icon={<MessageSquare size={14} />} label="الطلبات" />
              <TabBtn active={tab === "projects"} onClick={() => setTab("projects")} icon={<HardHat size={14} />}       label="المشاريع" />
              <TabBtn active={tab === "meetings"} onClick={() => setTab("meetings")} icon={<CalendarDays size={14} />} label="الاجتماعات" />
            </>}
            {companyType === "materials_supplier" && <>
              <TabBtn active={tab === "products"} onClick={() => setTab("products")} icon={<Package size={14} />}       label="المنتجات" />
              <TabBtn active={tab === "orders"}   onClick={() => setTab("orders")}   icon={<ShoppingBag size={14} />}   label="الطلبيات" />
            </>}
            <TabBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")} icon={<Briefcase size={14} />}    label="أعمالنا" />
            <TabBtn active={tab === "profile"}  onClick={() => setTab("profile")}  icon={<Settings size={14} />}      label="البروفايل" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 40px 60px" }}>

        {tab === "requests" && (
          <>
          {statusError && (
            <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 12, padding: "12px 18px", marginBottom: 16, fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStatusError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: 700 }}>✕</button>
              <span>❌ {statusError}</span>
            </div>
          )}
          {loading ? <Loading /> :
          requests.length === 0 ? (
            <EmptyState icon={<MessageSquare size={48} />} text="لا توجد طلبات من عملاء بعد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {requests.map(req => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onAccept={() => handleStatus(req.id, "accepted")}
                  onReject={(n) => handleStatus(req.id, "rejected", n)}
                  onCreateProject={() => handleStatus(req.id, "accepted")}
                />
              ))}
            </div>
          )
          }
          </>
        )}

        {tab === "projects" && (
          loading ? <Loading /> :
          projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 32px" }}>
              <div style={{ marginBottom: 16, color: "#C4956A", display: "flex", justifyContent: "center" }}><HardHat size={48} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1B3A2D", marginBottom: 10 }}>لا توجد مشاريع بعد</h3>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.9, marginBottom: 16 }}>
                المشاريع تُنشأ <strong>تلقائياً</strong> عند قبولك لطلب عميل
              </p>
              <button
                onClick={() => setTab("requests")}
                style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
              >
                الطلبات
              </button>
            </div>
          ) : (
            <div>
              {!activeProj && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {projects.map(proj => (
                    <ProjectMiniCard
                      key={proj.id}
                      proj={proj}
                      onClick={() => {
                        setActiveProj(proj);
                        fetch(`/api/projects/${proj.id}/mark-read`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                        setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, unreadByCompany: false } : p));
                      }}
                    />
                  ))}
                </div>
              )}

              {activeProj && (
                <ProjectEditor
                  proj={activeProj}
                  onBack={() => setActiveProj(null)}
                  onPhaseClick={(idx, pct) => handlePhaseUpdate(activeProj.id, idx, pct)}
                  updateText={updateText}
                  setUpdateText={setUpdateText}
                  onAddUpdate={handleAddUpdate}
                  addingUpd={addingUpd}
                  onStatusChange={(s) => handleProjStatus(activeProj.id, s)}
                />
              )}
            </div>
          )
        )}

        {tab === "meetings" && (
          loading ? <Loading /> : (
            <div>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>الاجتماعات</h2>
                <button onClick={() => { setShowProposeForm(v => !v); setProposeErr(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: showProposeForm ? "#f3f4f6" : "#C4956A", color: showProposeForm ? "#374151" : "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  <Plus size={15} /> {showProposeForm ? "إلغاء" : "اقتراح اجتماع"}
                </button>
              </div>

              {/* Propose form */}
              {showProposeForm && (
                <div style={{ background: "white", borderRadius: 18, padding: 22, marginBottom: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", border: "1px solid #f0e8df" }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 16px", textAlign: "right" }}>اقتراح موعد اجتماع جديد</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <select value={proposeForm.projectId} onChange={e => setProposeForm(p => ({ ...p, projectId: e.target.value }))}
                      style={{ ...inpStyle, gridColumn: "1 / -1" }}>
                      <option value="">اختر المشروع</option>
                      {projects.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.type} — {pr.clientName || pr.location || `#${pr.id}`}</option>
                      ))}
                    </select>
                    <input type="date" value={proposeForm.proposedDate} onChange={e => setProposeForm(p => ({ ...p, proposedDate: e.target.value }))} style={inpStyle} />
                    <input type="time" value={proposeForm.proposedTime} onChange={e => setProposeForm(p => ({ ...p, proposedTime: e.target.value }))} style={inpStyle} />
                    <input placeholder="موضوع الاجتماع" value={proposeForm.topic} onChange={e => setProposeForm(p => ({ ...p, topic: e.target.value }))} style={{ ...inpStyle, gridColumn: "1 / -1" }} />
                    <input placeholder="رابط الاجتماع (إلزامي)" value={proposeForm.meetLink} onChange={e => setProposeForm(p => ({ ...p, meetLink: e.target.value }))} style={{ ...inpStyle, gridColumn: "1 / -1", borderColor: proposeForm.meetLink ? "#e5e7eb" : "#fca5a5" }} />
                  </div>

                  {proposeErr && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 10px", textAlign: "right" }}>{proposeErr}</p>}

                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <button onClick={handleProposeMeeting} disabled={proposing}
                      style={{ background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: proposing ? "default" : "pointer", opacity: proposing ? 0.7 : 1 }}>
                      {proposing ? "جاري الإرسال..." : "إرسال الاقتراح"}
                    </button>
                  </div>
                </div>
              )}

              {meetings.length === 0 ? (
                <EmptyState icon={<CalendarDays size={48} />} text="لا توجد اجتماعات بعد" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {meetings.map(m => <MeetingCard key={m.id} meeting={m} onAction={handleMeetingStatus} />)}
                </div>
              )}
            </div>
          )
        )}

        {tab === "products" && (
          loading ? <Loading /> : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>المنتجات</h2>
                <button
                  onClick={openAddProd}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  <Plus size={16} /> إضافة منتج
                </button>
              </div>

              {products.length === 0 ? (
                <EmptyState icon={<Package size={48} />} text="لا توجد منتجات بعد — أضف أول منتج!" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {products.map(p => (
                    <div key={p.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />}
                      <div style={{ padding: "14px 16px" }}>
                        <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 4px", textAlign: "right" }}>{p.name}</p>
                        {p.category && <span style={{ fontSize: 11, background: "#F0E4D0", color: "#C4956A", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{p.category}</span>}
                        {p.description && <p style={{ fontSize: 12, color: "#6b7280", margin: "8px 0", textAlign: "right", lineHeight: 1.6 }}>{p.description}</p>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => openEditProd(p)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#374151" }}>
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleDeleteProd(p.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#ef4444" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 15, color: "#C4956A" }}>{p.price} ر.س<span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}> / {p.unit}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showProdForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={() => setShowProdForm(false)}>
                  <div style={{ background: "white", width: "100%", maxWidth: 440, borderRadius: 24, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()} dir="rtl">
                    <button onClick={() => setShowProdForm(false)} style={{ position: "absolute", top: 14, left: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={20}/></button>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, textAlign: "right" }}>{editingProd ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
                    <ProdField label="اسم المنتج *"><input value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} style={fInp} /></ProdField>
                    <ProdField label="الوصف"><textarea value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} rows={2} style={{...fInp, resize:"none"}}/></ProdField>
                    <div style={{ display: "flex", gap: 12 }}>
                      <ProdField label="الوحدة" style={{ flex: 1 }}><input value={prodForm.unit} onChange={e => setProdForm({...prodForm, unit: e.target.value})} placeholder="مثال: كيس، متر" style={fInp} /></ProdField>
                      <ProdField label="السعر (ر.س) *" style={{ flex: 1 }}><input type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} style={fInp} /></ProdField>
                    </div>
                    <ProdField label="الفئة"><input value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} placeholder="مثال: اسمنت، حديد" style={fInp} /></ProdField>
                    <ProdField label="صورة المنتج">
                      {prodPreview && (
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 8, width: "100%" }}>
                          <img src={prodPreview} alt="معاينة" style={{ width: "100%", maxHeight: 160, borderRadius: 10, objectFit: "cover" }} />
                          <button onClick={clearProdImage} style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={11} /></button>
                        </div>
                      )}
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: "#F5F0EA", border: "1px dashed #C4956A", borderRadius: 10, padding: "9px 14px", color: "#C4956A", fontWeight: 600, fontSize: 13 }}>
                        <Image size={14} />
                        {prodImage ? prodImage.name.substring(0, 25) + (prodImage.name.length > 25 ? "..." : "") : "اختر صورة للمنتج"}
                        <input ref={prodFileRef} type="file" accept="image/*" onChange={handleProdImage} style={{ display: "none" }} />
                      </label>
                    </ProdField>
                    {prodError && (
                      <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 8, textAlign: "right" }}>
                        ⚠️ {prodError}
                      </div>
                    )}
                    <button
                      onClick={handleSaveProd}
                      disabled={!prodForm.name.trim() || !prodForm.price || savingProd}
                      style={{ width: "100%", background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8, opacity: (!prodForm.name.trim() || !prodForm.price || savingProd) ? 0.5 : 1 }}
                    >
                      {savingProd ? "جاري الحفظ..." : (editingProd ? "حفظ التعديلات" : "إضافة المنتج")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {tab === "orders" && (
          loading ? <Loading /> : (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, textAlign: "right" }}>الطلبيات الواردة</h2>
              {orders.length === 0 ? (
                <EmptyState icon={<ShoppingBag size={48} />} text="لا توجد طلبيات بعد" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {orders.map(o => {
                    const client = o.Client || {};
                    const statusInfo = ORDER_STATUS_INFO[o.status] || ORDER_STATUS_INFO.pending;
                    return (
                      <div key={o.id} style={{ background: "white", borderRadius: 18, padding: "20px 24px", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>{client.firstName} {client.lastName}</p>
                            {client.phone && <p style={{ color: "#6b7280", fontSize: 13, margin: "3px 0 0" }}>📞 {client.phone}</p>}
                          </div>
                          <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>{statusInfo.label}</span>
                        </div>

                        {Array.isArray(o.items) && (
                          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
                            {o.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#374151" }}>
                                <span>{item.name} × {item.qty}</span>
                                <span style={{ color: "#C4956A", fontWeight: 700 }}>{item.unitPrice * item.qty} ر.س</span>
                              </div>
                            ))}
                            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14 }}>
                              <span>الإجمالي</span>
                              <span style={{ color: "#C4956A" }}>{o.totalPrice} ر.س</span>
                            </div>
                          </div>
                        )}

                        <p style={{ fontSize: 13, color: "#6b7280", textAlign: "right", marginBottom: 12 }}>📍 {o.address}</p>
                        {o.notes && <p style={{ fontSize: 13, color: "#6b7280", textAlign: "right", marginBottom: 12 }}>📝 {o.notes}</p>}

                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-start", flexWrap: "wrap" }}>
                          {["confirmed","shipped","delivered","cancelled"].filter(s => s !== o.status).map(s => (
                            <button
                              key={s}
                              onClick={() => handleOrderStatus(o.id, s)}
                              style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", background: ORDER_STATUS_INFO[s]?.bg || "#f3f4f6", color: ORDER_STATUS_INFO[s]?.color || "#374151" }}
                            >
                              {ORDER_STATUS_INFO[s]?.label || s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* ───── أعمالنا السابقة ───── */}
        {tab === "portfolio" && (
          loading ? <Loading /> : (
            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>أعمالنا السابقة</h2>
                <button onClick={openAddPort}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  <Plus size={15} /> إضافة عمل
                </button>
              </div>

              {/* Form add/edit */}
              {showPortForm && (
                <div style={{ background: "white", borderRadius: 18, padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f0e8df" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <button onClick={() => setShowPortForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={20} /></button>
                    <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#111827" }}>{editingPort ? "تعديل العمل" : "إضافة عمل جديد"}</p>
                  </div>

                  {/* Image picker */}
                  <div
                    onClick={() => document.getElementById("portImgInput").click()}
                    style={{ width: "100%", height: 180, borderRadius: 14, overflow: "hidden", background: portImagePrev ? "transparent" : "#f9fafb", border: "2px dashed #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, position: "relative" }}>
                    {portImagePrev
                      ? <img src={portImagePrev} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ textAlign: "center", color: "#9ca3af" }}>
                          <ImageIcon size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                          <p style={{ fontSize: 13 }}>اضغط لرفع صورة للعمل</p>
                        </div>
                    }
                    {portImagePrev && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                        <Camera size={24} color="white" />
                      </div>
                    )}
                  </div>
                  <input id="portImgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePortImageChange} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="عنوان العمل (مطلوب)" value={portForm.title} onChange={e => setPortForm(p => ({ ...p, title: e.target.value }))}
                      style={{ ...inpStyle, gridColumn: "1 / -1" }} />
                    <select value={portForm.category} onChange={e => setPortForm(p => ({ ...p, category: e.target.value }))} style={inpStyle}>
                      <option value="">نوع المشروع</option>
                      {["فيلا","شقق","عمارة","مجمع سكني","مبنى تجاري","مكاتب","أخرى"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" placeholder="سنة الإنجاز" value={portForm.year} onChange={e => setPortForm(p => ({ ...p, year: e.target.value }))}
                      style={inpStyle} min="1990" max="2030" />
                    <textarea placeholder="وصف مختصر (اختياري)" value={portForm.description} onChange={e => setPortForm(p => ({ ...p, description: e.target.value }))}
                      rows={3} style={{ ...inpStyle, gridColumn: "1 / -1", resize: "none" }} />
                  </div>

                  {portErr && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px", textAlign: "right" }}>{portErr}</p>}

                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <button onClick={handleSavePort} disabled={savingPort}
                      style={{ background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: savingPort ? "default" : "pointer", opacity: savingPort ? 0.7 : 1 }}>
                      {savingPort ? "جاري الحفظ..." : editingPort ? "حفظ التعديلات" : "إضافة العمل"}
                    </button>
                  </div>
                </div>
              )}

              {portfolio.length === 0 ? (
                <EmptyState icon={<Briefcase size={48} />} text="لا توجد أعمال بعد — أضف أول عمل!" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 18 }}>
                  {portfolio.map(item => (
                    <div key={item.id} style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      {/* Image */}
                      <div style={{ height: 160, background: "#f3f4f6", overflow: "hidden", position: "relative" }}>
                        {item.image
                          ? <img src={`${item.image}`} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Briefcase size={40} color="#e5e7eb" />
                            </div>
                        }
                        {item.year && (
                          <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                            {item.year}
                          </span>
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0, textAlign: "right", flex: 1, marginLeft: item.category ? 8 : 0 }}>{item.title}</p>
                          {item.category && (
                            <span style={{ fontSize: 11, background: "#F0E4D0", color: "#C4956A", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{item.category}</span>
                          )}
                        </div>
                        {item.description && (
                          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6, textAlign: "right", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.description}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button onClick={() => handleDeletePort(item.id)}
                            style={{ background: "#fef2f2", border: "none", borderRadius: 9, padding: "6px 10px", cursor: "pointer", color: "#ef4444" }}>
                            <Trash2 size={13} />
                          </button>
                          <button onClick={() => openEditPort(item)}
                            style={{ background: "#f3f4f6", border: "none", borderRadius: 9, padding: "6px 12px", cursor: "pointer", color: "#374151", fontWeight: 700, fontSize: 12 }}>
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {tab === "profile" && (
          loading ? <Loading /> : (
            <div style={{ background: "white", borderRadius: 20, padding: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, textAlign: "right" }}>تعديل بروفايل الشركة</h2>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, textAlign: "right" }}>صورة الغلاف</label>
                <div
                  style={{ position: "relative", width: "100%", height: 140, borderRadius: 16, overflow: "hidden", background: "#f3f4f6", cursor: "pointer", border: "2px dashed #e5e7eb" }}
                  onClick={() => document.getElementById("coverInput").click()}
                >
                  <input id="coverInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverChange} />
                  {(coverPrev || profile?.coverPhoto) ? (
                    <img src={coverPrev || `${profile.coverPhoto}`} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                      <Camera size={28} style={{ marginBottom: 6 }} />
                      <p style={{ fontSize: 13 }}>انقر لرفع صورة الغلاف</p>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "#C4956A", color: "white", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>
                    تغيير الصورة
                  </div>
                </div>
              </div>

              {/* رفع ملف السجل التجاري */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, textAlign: "right" }}>ملف السجل التجاري (PDF)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {profile?.commercialRegistrationFile ? (
                    <button
                      onClick={() => {
                        const data = profile.commercialRegistrationFile;
                        if (data.startsWith("data:")) {
                          const byteStr = atob(data.split(",")[1]);
                          const arr = new Uint8Array(byteStr.length);
                          for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
                          const blob = new Blob([arr], { type: "application/pdf" });
                          window.open(URL.createObjectURL(blob), "_blank");
                        } else {
                          window.open(data, "_blank");
                        }
                      }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0E4D0", color: "#C4956A", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}
                    >
                      📄 عرض الملف الحالي
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, color: "#9ca3af", background: "#f9fafb", padding: "8px 14px", borderRadius: 10 }}>
                      ⚠️ لم يُرفع ملف بعد
                    </span>
                  )}
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f3f4f6", border: "1.5px dashed #e5e7eb", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    <input type="file" accept=".pdf" style={{ display: "none" }} onChange={handleCRFileChange} />
                    📎 {crFile ? crFile.name : "رفع ملف جديد"}
                  </label>
                </div>
              </div>

              <Field label="وصف الشركة">
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="اكتب وصفاً..." style={taStyle} />
              </Field>
              <Field label="المدينة">
                <input value={city} onChange={e => setCity(e.target.value)} style={inpStyle} />
              </Field>
              <Field label='التخصصات (افصل بفواصل)'>
                <input value={specs} onChange={e => setSpecs(e.target.value)} placeholder="بناء فلل، ترميم، أساسات" style={inpStyle} />
              </Field>

              {profile?.type === "materials_supplier" && (
                <Field label="فئات المواد التي تبيعها">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
                    {CATEGORIES_LIST.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCat(cat)}
                        style={{
                          padding: "6px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                          fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                          background: selCats.includes(cat) ? "#C4956A" : "#f3f4f6",
                          color:      selCats.includes(cat) ? "white"   : "#374151"
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {profile && (
                <div style={{ background: "#f9fafb", borderRadius: 14, padding: "16px 20px", marginTop: 20, marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px", fontWeight: 600, textAlign: "right" }}>معلومات مسجّلة (لا تتغير)</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: "5px 0", textAlign: "right" }}>🏢 اسم الشركة: {profile.ownerName}</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: "5px 0", textAlign: "right" }}>📄 السجل التجاري: {profile.commercialRegistrationNumber}</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: "5px 0", textAlign: "right" }}>
                    ✅ الحالة:{" "}
                    <span style={{ color: profile.approvalStatus === "approved" ? "#16a34a" : "#C4956A", fontWeight: 700 }}>
                      {profile.approvalStatus === "approved" ? "معتمد" : "قيد المراجعة"}
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                <Save size={16} />
                {saving ? "جاري الحفظ..." : saved ? "✓ تم الحفظ" : "حفظ التغييرات"}
              </button>
            </div>
          )
        )}

        {tab === "profile" && !loading && (
          <>
          <div style={{ background: "white", borderRadius: 20, padding: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, background: "#F0E4D0", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#C4956A" }}>
                🔒
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, textAlign: "right" }}>تغيير كلمة المرور</h2>
            </div>
            {pwErr && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, textAlign: "right" }}>⚠️ {pwErr}</div>}
            {pwOk  && <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, textAlign: "right" }}>✅ تم تغيير كلمة المرور بنجاح</div>}
            {[
              { key: "currentPassword", label: "كلمة المرور الحالية" },
              { key: "newPassword",     label: "كلمة المرور الجديدة" },
              { key: "confirmPassword", label: "تأكيد كلمة المرور الجديدة" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, textAlign: "right" }}>{label}</label>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={pwLoad}
              style={{ background: "#1B3A2D", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: pwLoad ? 0.6 : 1 }}
            >
              {pwLoad ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>
          </div>

          {/* طلب حذف الحساب */}
          <div style={{ background: "white", borderRadius: 20, padding: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginTop: 20, border: "1px solid #fee2e2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, background: "#fef2f2", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>🗑️</div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, textAlign: "right", color: "#ef4444" }}>طلب حذف الحساب</h2>
            </div>
            {(profile?.deleteRequested || deleteReqSent) ? (
              <div style={{ background: "#fef3c7", color: "#92400e", borderRadius: 12, padding: "14px 18px", textAlign: "right", fontSize: 14 }}>
                ⏳ تم إرسال طلب الحذف — سيتم مراجعته من قبل الإدارة وسيتم التواصل معك قريباً.
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, textAlign: "right", lineHeight: 1.7 }}>
                  لا يمكن حذف حساب الشركة مباشرة لحماية بيانات العملاء. يمكنك إرسال طلب حذف وسيراجعه الإدارة.
                </p>
                {deleteReqErr && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12, textAlign: "right" }}>⚠️ {deleteReqErr}</div>}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, textAlign: "right" }}>سبب طلب الحذف (اختياري)</label>
                  <textarea
                    value={deleteNote}
                    onChange={e => setDeleteNote(e.target.value)}
                    placeholder="اكتب سبب الحذف..."
                    rows={3}
                    style={{ width: "100%", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
                <button
                  onClick={handleRequestDelete}
                  disabled={deleteReqLoad}
                  style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: deleteReqLoad ? 0.6 : 1 }}
                >
                  {deleteReqLoad ? "جاري الإرسال..." : "إرسال طلب الحذف"}
                </button>
              </>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectMiniCard({ proj, onClick }) {
  const progress   = calcProgress(proj.phases);
  const st         = PROJ_STATUS[proj.status] || PROJ_STATUS.active;
  const client     = proj.Client;
  const donePhases = proj.phases?.filter(p => p.progress === 100).length || 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: "white", borderRadius: 20, padding: "20px 22px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s", border: "1px solid rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", gap: 12,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999, border: `1px solid ${st.color}22` }}>{st.label}</span>
          {proj.unreadByCompany && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 999, padding: "2px 9px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>ملاحظة جديدة</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: "#111827" }}>{proj.type}</p>
          {client && <p style={{ color: "#6b7280", fontSize: 12, margin: "3px 0 0" }}>👤 {client.firstName} {client.lastName}</p>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", color: "#9ca3af", fontSize: 12 }}>
        <span>{proj.location}</span>
        <MapPin size={12} color="#C4956A" />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "#9ca3af" }}>{donePhases}/{proj.phases?.length} مراحل</span>
          <span style={{ fontWeight: 800, color: progress === 100 ? "#22c55e" : "#C4956A" }}>{progress}%</span>
        </div>
        <div style={{ height: 7, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#A67C52,#C4956A)", borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

function ProjectEditor({ proj, onBack, onPhaseClick, updateText, setUpdateText, onAddUpdate, addingUpd, onStatusChange }) {
  const [showUpdForm, setShowUpdForm] = useState(false);
  const client   = proj.Client;
  const st       = PROJ_STATUS[proj.status] || PROJ_STATUS.active;
  const progress = calcProgress(proj.phases);
  const donePhases = proj.phases?.filter(p => p.progress === 100).length || 0;

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "9px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 22, color: "#374151", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "box-shadow 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}
      >
        <span style={{ fontSize: 16 }}>→</span> العودة للمشاريع
      </button>

      {/* بطاقة الملخص */}
      <div style={{ background: "white", borderRadius: 22, overflow: "hidden", marginBottom: 18, boxShadow: "0 4px 18px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div style={{ background: "linear-gradient(135deg,#fff8f2,#fef3e8)", padding: "22px 24px 18px", borderBottom: "1px solid #f0e8df" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["active","completed","paused"].map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  style={{
                    fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999,
                    border: `1.5px solid ${proj.status === s ? PROJ_STATUS[s].color + "44" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.15s",
                    background: proj.status === s ? PROJ_STATUS[s].bg : "#f3f4f6",
                    color:      proj.status === s ? PROJ_STATUS[s].color : "#9ca3af",
                  }}
                >
                  {PROJ_STATUS[s].label}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#111827" }}>{proj.type}</h2>
              {client && (
                <p style={{ color: "#6b7280", fontSize: 13, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  {client.phone && <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 6 }}>📞 {client.phone}</span>}
                  <span>{client.firstName} {client.lastName}</span>
                  <User size={13} color="#C4956A" />
                </p>
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{proj.location}<MapPin size={13} color="#C4956A" /></span>
            {proj.budget && <span>💰 {proj.budget}</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{donePhases}/{proj.phases?.length} مراحل مكتملة</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: progress === 100 ? "#22c55e" : "#C4956A", lineHeight: 1 }}>{progress}</span>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>% إنجاز</span>
            </div>
          </div>
          <div style={{ height: 10, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#A67C52,#C4956A)", borderRadius: 999, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>

      {/* مراحل المشروع */}
      <DashCard title="مراحل المشروع" hint="اضغط على الشريط لتحديث النسبة" emoji="🏗️">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {proj.phases.map((phase, i) => (
            <div key={i} style={{
              background: phase.progress === 100 ? "#f0fdf4" : phase.progress > 0 ? "#fff8f3" : "#fafafa",
              border: `1px solid ${phase.progress === 100 ? "#bbf7d0" : phase.progress > 0 ? "#fde8d0" : "#f0f0f0"}`,
              borderRadius: 14, padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: phase.progress === 100 ? "#22c55e" : phase.progress > 0 ? "#C4956A" : "#9ca3af" }}>
                  {phase.progress === 100 ? "✓" : `${phase.progress}%`}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{phase.name}</span>
                  <span style={{ fontSize: 16 }}>{PHASE_ICONS[i]}</span>
                </div>
              </div>
              <div
                style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", cursor: "pointer" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct  = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  onPhaseClick(i, Math.max(0, Math.min(100, pct)));
                }}
                title="اضغط لتحديث النسبة"
              >
                <div style={{ height: "100%", width: `${phase.progress}%`, background: phase.progress === 100 ? "#22c55e" : "#C4956A", borderRadius: 999, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </DashCard>

      {/* التحديثات للعميل */}
      <DashCard title="التحديثات للعميل" emoji="📢"
        action={
          <button
            onClick={() => setShowUpdForm(!showUpdForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showUpdForm ? "#f3f4f6" : "#C4956A", color: showUpdForm ? "#374151" : "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            <Plus size={14} /> {showUpdForm ? "إلغاء" : "إضافة تحديث"}
          </button>
        }
      >
        {showUpdForm && (
          <div style={{ background: "#fff8f3", borderRadius: 14, padding: 16, marginBottom: 14, border: "1px solid #fde8d0" }}>
            <textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              rows={3}
              placeholder="اكتب تحديثاً يراه العميل..."
              style={{ width: "100%", border: "1.5px solid #fcd4a8", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", textAlign: "right", resize: "none", fontFamily: "inherit", boxSizing: "border-box", background: "white", color: "#111827" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowUpdForm(false)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>إلغاء</button>
              <button
                onClick={() => { onAddUpdate(); setShowUpdForm(false); }}
                disabled={addingUpd || !updateText.trim()}
                style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: addingUpd || !updateText.trim() ? 0.5 : 1 }}
              >
                {addingUpd ? "جاري الحفظ..." : "نشر التحديث"}
              </button>
            </div>
          </div>
        )}
        {proj.updates?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {proj.updates.map((u, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 3, background: "#C4956A", borderRadius: 999, alignSelf: "stretch", flexShrink: 0, opacity: 0.4 }} />
                <div style={{ flex: 1, background: "#fafafa", borderRadius: 12, padding: "11px 15px", border: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: 14, color: "#374151", margin: "0 0 5px", lineHeight: 1.7 }}>{u.text}</p>
                  <p style={{ fontSize: 11, color: "#b0b7c3", margin: 0, fontWeight: 500 }}>
                    {new Date(u.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashEmpty icon="💬" text="لم تضف أي تحديثات بعد" />
        )}
      </DashCard>

      {/* ملاحظات العميل */}
      <DashCard title="ملاحظات العميل" emoji="📝">
        {proj.clientNotes?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {proj.clientNotes.map((n, i) => (
              <div key={i} style={{ background: "#fff8f3", border: "1px solid #fde8d0", borderRadius: 12, padding: "13px 16px" }}>
                <p style={{ fontSize: 14, color: "#374151", margin: "0 0 6px", lineHeight: 1.75, textAlign: "right" }}>{n.text}</p>
                <p style={{ fontSize: 11, color: "#b0b7c3", margin: 0, textAlign: "right", fontWeight: 500 }}>
                  {new Date(n.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <DashEmpty icon="🗒️" text="لا توجد ملاحظات من العميل بعد" />
        )}
      </DashCard>
    </div>
  );
}

function DashCard({ title, emoji, hint, action, children }) {
  return (
    <div style={{ background: "white", borderRadius: 22, overflow: "hidden", marginBottom: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 22px 14px", borderBottom: "1px solid #f7f7f7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {action || <div />}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#111827" }}>
            {title}
            {hint && <span style={{ fontSize: 11, color: "#c4cad4", fontWeight: 400, marginRight: 8 }}>({hint})</span>}
          </h3>
          <div style={{ width: 30, height: 30, background: "#F0E4D0", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{emoji}</div>
        </div>
      </div>
      <div style={{ padding: "16px 22px 20px" }}>{children}</div>
    </div>
  );
}

function DashEmpty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "22px 0", color: "#c4cad4" }}>
      <p style={{ fontSize: 26, margin: "0 0 8px" }}>{icon}</p>
      <p style={{ fontSize: 13 }}>{text}</p>
    </div>
  );
}

function RequestCard({ req, onAccept, onReject, onCreateProject }) {
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const st     = REQ_STATUS[req.status] || REQ_STATUS.pending;
  const client = req.Client || {};

  return (
    <div style={{
      background: "white", borderRadius: 20, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{ background: req.status === "accepted" ? "#f0fdf4" : req.status === "rejected" ? "#fef2f2" : "linear-gradient(135deg,#fff8f2,#fef3e8)", padding: "18px 24px 14px", borderBottom: "1px solid #f7f7f7" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: "#111827" }}>{req.projectType}</p>
            <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 0", fontWeight: 500 }}>
              {new Date(req.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
            {st.label} {st.icon}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 24px 20px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", justifyContent: "flex-start" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151", background: "#f9fafb", padding: "5px 12px", borderRadius: 8, border: "1px solid #f0f0f0" }}>
            {client.firstName} {client.lastName} <User size={13} color="#C4956A" />
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151", background: "#f9fafb", padding: "5px 12px", borderRadius: 8, border: "1px solid #f0f0f0" }}>
            {req.location} <MapPin size={13} color="#C4956A" />
          </span>
          {req.budget && (
            <span style={{ fontSize: 13, color: "#374151", background: "#f9fafb", padding: "5px 12px", borderRadius: 8, border: "1px solid #f0f0f0" }}>
              {req.budget} 💰
            </span>
          )}
        </div>

        {req.message && (
          <p style={{ fontSize: 13.5, color: "#6b7280", background: "#fafafa", borderRadius: 12, padding: "11px 16px", marginBottom: 16, textAlign: "right", lineHeight: 1.75, border: "1px solid #f0f0f0" }}>
            {req.message}
          </p>
        )}

        {req.status === "pending" && !showReject && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
            <button
              onClick={() => setShowReject(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <XCircle size={15} /> رفض
            </button>
            <button
              onClick={onAccept}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}
            >
              <CheckCircle size={15} /> قبول الطلب
            </button>
          </div>
        )}

        {req.status === "pending" && showReject && (
          <div style={{ background: "#fef2f2", borderRadius: 14, padding: 14, border: "1px solid #fecaca" }}>
            <input
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="سبب الرفض (اختياري)"
              style={{ width: "100%", border: "1.5px solid #fecaca", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", marginBottom: 10, textAlign: "right", fontFamily: "inherit", boxSizing: "border-box", background: "white", color: "#111827" }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}>
              <button onClick={() => setShowReject(false)} style={{ background: "white", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
              <button onClick={() => onReject(rejectNote)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>تأكيد الرفض</button>
            </div>
          </div>
        )}

        {req.status === "rejected" && req.companyNote && (
          <p style={{ color: "#ef4444", fontSize: 13, textAlign: "right", background: "#fef2f2", borderRadius: 10, padding: "8px 14px" }}>سبب الرفض: {req.companyNote}</p>
        )}

        {req.status === "accepted" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: "#16a34a", fontSize: 13, fontWeight: 700, margin: 0 }}>مقبول — المشروع جاهز ✅</p>
            <button
              onClick={onCreateProject}
              style={{ fontSize: 13, color: "white", background: "#C4956A", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontWeight: 700 }}
            >
              اعرض المشروع
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 700, transition: "all 0.15s",
        background: active ? "white" : "transparent",
        color: active ? "#C4956A" : "#6b7280",
        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {icon} {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, textAlign: "right" }}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "70px 20px", color: "#9ca3af" }}>
      <div style={{ margin: "0 auto 16px", opacity: 0.3 }}>{icon}</div>
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}

function MeetingCard({ meeting, onAction }) {
  const [note,    setNote]    = useState("");
  const [link,    setLink]    = useState("");
  const [open,    setOpen]    = useState(false);
  const [linkErr, setLinkErr] = useState(false);

  const client = meeting.Client || {};
  const isPending = meeting.status === "pending";

  const statusStyle = {
    pending:   { bg: "#fef3c7", color: "#92400e", label: "بانتظار ردك" },
    confirmed: { bg: "#dcfce7", color: "#166534", label: "مؤكد" },
    declined:  { bg: "#fee2e2", color: "#991b1b", label: "مرفوض" },
  }[meeting.status] || { bg: "#f3f4f6", color: "#6b7280", label: meeting.status };

  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "18px 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{meeting.topic}</p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            📅 {meeting.proposedDate} &nbsp; 🕐 {meeting.proposedTime}
          </p>
          <p style={{ fontSize: 12, color: "#C4956A", fontWeight: 600, margin: "4px 0 0" }}>
            👤 {client.firstName} {client.lastName}
            {client.phone && <span style={{ color: "#9ca3af", fontWeight: 400, marginRight: 6 }}>— {client.phone}</span>}
          </p>
          {meeting.meetLink && (
            <a
              href={meeting.meetLink.startsWith("http") ? meeting.meetLink : `https://${meeting.meetLink}`}
              target="_blank" rel="noreferrer"
              style={{ display: "inline-block", fontSize: 12, color: "#2563eb", marginTop: 6, wordBreak: "break-all" }}
            >
              {meeting.meetLink}
            </a>
          )}
        </div>
        <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, flexShrink: 0 }}>
          {statusStyle.label}
        </span>
      </div>

      {isPending && (
        <div style={{ padding: "0 22px 18px" }}>
          {!open ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setOpen("decline"); }}
                style={{ flex: 1, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 12, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                ✕ رفض
              </button>
              <button onClick={() => { setOpen("confirm"); }}
                style={{ flex: 1, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", border: "none", borderRadius: 12, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                ✓ تأكيد
              </button>
            </div>
          ) : open === "confirm" ? (
            <div style={{ background: "#f0fdf4", borderRadius: 14, padding: 14, border: "1px solid #bbf7d0" }}>
              <input value={link} onChange={e => { setLink(e.target.value); setLinkErr(false); }}
                placeholder="رابط الاجتماع (إلزامي)"
                style={{ width: "100%", border: `1.5px solid ${linkErr ? "#fca5a5" : "#bbf7d0"}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", marginBottom: linkErr ? 4 : 10, textAlign: "right", fontFamily: "inherit", boxSizing: "border-box", background: "white" }} />
              {linkErr && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px", textAlign: "right" }}>رابط الاجتماع مطلوب</p>}
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة للعميل (اختياري)"
                style={{ width: "100%", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", marginBottom: 10, textAlign: "right", fontFamily: "inherit", boxSizing: "border-box", background: "white" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setOpen(false); setLinkErr(false); }} style={{ background: "white", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
                <button onClick={() => { if (!link.trim()) { setLinkErr(true); return; } onAction(meeting.id, "confirmed", note, link); }}
                  style={{ flex: 1, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", border: "none", borderRadius: 10, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  تأكيد الاجتماع
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: "#fef2f2", borderRadius: 14, padding: 14, border: "1px solid #fecaca" }}>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="سبب الرفض (اختياري)"
                style={{ width: "100%", border: "1.5px solid #fecaca", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", marginBottom: 10, textAlign: "right", fontFamily: "inherit", boxSizing: "border-box", background: "white" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setOpen(false)} style={{ background: "white", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
                <button onClick={() => onAction(meeting.id, "declined", note)}
                  style={{ flex: 1, background: "#ef4444", color: "white", border: "none", borderRadius: 10, padding: "9px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  تأكيد الرفض
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isPending && meeting.companyNote && (
        <div style={{ padding: "0 22px 16px" }}>
          <p style={{ fontSize: 12, color: "#6b7280", background: "#f9fafb", borderRadius: 10, padding: "8px 12px", margin: 0, textAlign: "right" }}>
            💬 {meeting.companyNote}
          </p>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return <p style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>جاري التحميل...</p>;
}

const inpStyle = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
  padding: "10px 14px", fontSize: 14, color: "#111827",
  background: "#f9fafb", outline: "none", textAlign: "right",
  boxSizing: "border-box", fontFamily: "inherit"
};
const taStyle = { ...inpStyle, resize: "none" };

const fInp = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
  padding: "9px 12px", fontSize: 13, outline: "none", textAlign: "right",
  background: "#f9fafb", fontFamily: "inherit", boxSizing: "border-box", color: "#111827"
};

function ProdField({ label, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, textAlign: "right" }}>{label}</label>
      {children}
    </div>
  );
}

const ORDER_STATUS_INFO = {
  pending:   { label: "معلق",    bg: "#fef3c7", color: "#92400e" },
  confirmed: { label: "مؤكد",   bg: "#dbeafe", color: "#1d4ed8" },
  shipped:   { label: "جارٍ",   bg: "#fff3cd", color: "#b45309" },
  delivered: { label: "مُسلَّم", bg: "#dcfce7", color: "#166534" },
  cancelled: { label: "ملغى",   bg: "#fee2e2", color: "#991b1b" }
};
