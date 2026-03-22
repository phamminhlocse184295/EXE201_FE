import { useEffect, useMemo, useState } from "react";
import { getAllCourses, deleteCourse, createCourse } from "../services/courseService";
import { getAllExercises } from "../services/exerciseService";
import { playTick, playSend } from "../lib/sounds";

const darkInput = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,10,20,0.6)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,245,255,0.08)", fontWeight: 600, fontFamily: "monospace" };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(0,245,255,0.05)", fontSize: 13 };
const levelMeta = { beginner: { bg: "rgba(16,185,129,0.18)", col: "#34d399" }, intermediate: { bg: "rgba(245,158,11,0.18)", col: "#f59e0b" }, advanced: { bg: "rgba(239,68,68,0.18)", col: "#f87171" } };
const FG = ({ label, children }) => <div style={{ display: "grid", gap: 6 }}><label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>{children}</div>;

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", level: "beginner", price: 0, img_url: "", days: [] });

  const fetchData = async () => {
    setLoading(true);
    try { const r = await getAllCourses(); setCourses(Array.isArray(r) ? r : r.data || []); } catch {}
    try {
      const r = await getAllExercises();
      setExercises(r.data?.data || r.data || r || []);
    } catch (err) {
      if (err?.response?.status === 403) { try { const { default: api } = await import("../services/api"); const r = await api.get("/exercises/client"); setExercises(r.data?.data || r.data || r || []); } catch {} }
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = () => { setForm({ title: "", description: "", level: "beginner", price: 0, img_url: "", days: [] }); setOpen(true); };
  const addDay = () => { const n = form.days.length + 1; setForm({ ...form, days: [...form.days, { phase_number: 1, week_number: Math.ceil(n / 7), day_number: n, title: `Ngày ${n} (Tuần ${Math.ceil(n / 7)})`, exercises: [] }] }); };
  const addExerciseToDay = (dIdx) => { const d = [...form.days]; d[dIdx].exercises.push({ title: "", video_url: "" }); setForm({ ...form, days: d }); };
  const updateExerciseDetail = (dIdx, eIdx, field, value) => { const d = [...form.days]; d[dIdx].exercises[eIdx][field] = value; setForm({ ...form, days: d }); };
  const removeExerciseFromDay = (dIdx, eIdx) => { const d = [...form.days]; d[dIdx].exercises.splice(eIdx, 1); setForm({ ...form, days: d }); };
  const handleSave = async () => {
    if (!form.title.trim()) return alert("Vui lòng nhập tiêu đề khóa học");
    setIsSubmitting(true);
    try { await createCourse(form); alert("Tạo khóa học thành công!"); setOpen(false); fetchData(); } catch { alert("Lỗi khi tạo khóa học."); }
    setIsSubmitting(false);
  };
  const filtered = useMemo(() => courses.filter(c => (c.title || "").toLowerCase().includes(q.toLowerCase())), [courses, q]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>📚 Course Management</h2>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>Found {filtered.length} courses</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input style={{ ...darkInput, paddingLeft: 36, width: 220 }} placeholder="Tìm tên khóa học..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button onClick={handleOpenModal} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>+ Add New Course</button>
        </div>
      </div>

      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {loading ? <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>⏳ Đang tải khóa học...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ ...thStyle, width: 80 }}>Image</th>
                  <th style={thStyle}>Course Title</th>
                  <th style={thStyle}>Level</th>
                  <th style={thStyle}>Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const lvl = levelMeta[(c.level || "beginner").toLowerCase()] || levelMeta.beginner;
                  return (
                    <tr key={c.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={tdStyle}>
                        <img src={c.img_url || c.image_url || c.image || "https://placehold.co/60x40/1e293b/475569?text=No+Img"} alt={c.title}
                          style={{ width: 60, height: 40, borderRadius: 8, objectFit: "cover", background: "#1e293b" }}
                          onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/60x40/1e293b/475569?text=Err"; }} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</div>
                      </td>
                      <td style={tdStyle}><span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, background: lvl.bg, color: lvl.col, fontWeight: 700, textTransform: "capitalize" }}>{c.level}</span></td>
                      <td style={{ ...tdStyle, color: "#f59e0b", fontWeight: 800 }}>{Number(c.price || 0).toLocaleString()}đ</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                          <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)" }}>Không tìm thấy khóa học.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo mới */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ width: "min(720px,95%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <b style={{ color: "#fff", fontSize: 15 }}>➕ Tạo khóa học mới</b>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 22, overflowY: "auto", display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FG label="Tiêu đề"><input style={darkInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FG>
                <FG label="Giá (VNĐ)"><input type="number" style={darkInput} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></FG>
                <FG label="Độ khó"><select style={darkInput} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></FG>
                <FG label="Link ảnh (IMG_URL)"><input style={darkInput} value={form.img_url} onChange={e => setForm({ ...form, img_url: e.target.value })} placeholder="https://..." /></FG>
              </div>
              <FG label="Mô tả"><textarea style={{ ...darkInput, minHeight: 70, resize: "vertical" }} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FG>
              
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                  <b style={{ color: "#fff", fontSize: 14 }}>Lịch trình tập luyện ({form.days.length} ngày)</b>
                  <button onClick={addDay} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Thêm ngày tập</button>
                </div>
                {form.days.map((day, dIdx) => (
                  <div key={dIdx} style={{ marginBottom: 12, padding: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#60a5fa" }}>{day.title}</div>
                    {day.exercises.map((ex, eIdx) => (
                      <div key={eIdx} style={{ display: "grid", gap: 8, background: "rgba(255,255,255,0.04)", padding: 10, marginTop: 8, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.12)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <b style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Bài {eIdx + 1}</b>
                          <button onClick={() => removeExerciseFromDay(dIdx, eIdx)} style={{ color: "#f87171", border: "none", background: "none", cursor: "pointer", fontWeight: 900 }}>✕ Xóa</button>
                        </div>
                        <input style={darkInput} placeholder="Tên bài tập..." value={ex.title} onChange={e => updateExerciseDetail(dIdx, eIdx, "title", e.target.value)} />
                        <input style={darkInput} placeholder="Link video..." value={ex.video_url} onChange={e => updateExerciseDetail(dIdx, eIdx, "video_url", e.target.value)} />
                      </div>
                    ))}
                    <button onClick={() => addExerciseToDay(dIdx)} style={{ marginTop: 10, width: "100%", padding: "9px", borderRadius: 10, border: "1px dashed rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.08)", color: "#60a5fa", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Ghi thêm bài tập thủ công</button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button onClick={() => setOpen(false)} disabled={isSubmitting} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy bỏ</button>
                <button onClick={handleSave} disabled={isSubmitting} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Đang xử lý..." : "Tạo khóa học ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
