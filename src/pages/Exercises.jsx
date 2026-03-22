import { useEffect, useMemo, useState } from "react";
import { getAllExercises, createExercise, updateExercise, deleteExercise } from "../services/exerciseService";

const darkInput = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 };

function DarkModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }} onMouseDown={onClose}>
      <div style={{ width: "min(680px,95%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <b style={{ color: "#fff", fontSize: 15 }}>{title}</b>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
function FG({ label, children }) {
  return <div style={{ display: "grid", gap: 6 }}><label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>{children}</div>;
}

export default function Exercises() {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [q, setQ] = useState("");
  const [filterTime, setFilterTime] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", duration: 60, video_url: "", exercise_type: "free", target_muscle: "", img_list: "" });

  const filteredAndSorted = useMemo(() => {
    let result = exercises.filter(ex => {
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return (ex.title || "").toLowerCase().includes(s) || (ex.description || "").toLowerCase().includes(s);
    });
    if (filterTime === "short") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) < 60);
    else if (filterTime === "medium") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) >= 60 && (ex.duration || ex.duration_seconds || 0) <= 120);
    else if (filterTime === "long") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) > 120);
    if (sortBy === "time_asc") result.sort((a, b) => (a.duration || a.duration_seconds || 0) - (b.duration || b.duration_seconds || 0));
    else if (sortBy === "time_desc") result.sort((a, b) => (b.duration || b.duration_seconds || 0) - (a.duration || a.duration_seconds || 0));
    return result;
  }, [exercises, q, filterTime, sortBy]);

  async function fetchExercises() {
    setLoading(true);
    try {
      const res = await getAllExercises();
      setExercises(Array.isArray(res) ? res : res.data?.data || res.data || []);
    } catch (err) {
      if (err?.response?.status === 403) {
        try { const { default: api } = await import("../services/api"); const r = await api.get("/exercises/client"); setExercises(Array.isArray(r) ? r : r.data?.data || r.data || []); } catch {}
      } else setExercises([]);
    } finally { setLoading(false); }
  }
  useEffect(() => { fetchExercises(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", duration: 60, video_url: "", exercise_type: "free", target_muscle: "", img_list: "" }); setOpen(true); };
  const openEdit = ex => {
    setEditing(ex);
    setForm({ title: ex.title || "", description: ex.description || "", duration: ex.duration || ex.duration_seconds || 0, video_url: ex.video_url || "", exercise_type: ex.exercise_type || "free", target_muscle: Array.isArray(ex.target_muscle) ? ex.target_muscle.join(", ") : ex.target_muscle || "", img_list: Array.isArray(ex.img_list) && ex.img_list.length > 0 ? ex.img_list[0] : ex.img_list || "" });
    setOpen(true);
  };
  const save = async () => {
    if (!form.title.trim()) return alert("Tên bài tập là bắt buộc");
    const payload = { title: form.title.trim(), description: form.description || "", video_url: form.video_url || "", duration: Number(form.duration) || 0, target_muscle: form.target_muscle ? form.target_muscle.split(",").map(s => s.trim()).filter(Boolean) : [], img_list: form.img_list?.trim() ? [form.img_list.trim()] : [] };
    try {
      if (editing) { const id = editing.id || editing._id || editing.exercise_id; if (!id) return alert("Lỗi: Không tìm thấy ID!"); await updateExercise(id, payload); alert("Cập nhật thành công!"); }
      else { await createExercise(payload); alert("Thêm bài tập thành công!"); }
      setOpen(false); fetchExercises();
    } catch (err) { alert(`Lỗi Backend: ${err.response?.data?.message || "Gửi API thất bại."}`); }
  };
  const remove = async ex => {
    if (!confirm(`Xóa bài tập "${ex.title}"?`)) return;
    const id = ex.id || ex._id || ex.exercise_id;
    if (!id) return alert("Lỗi: Không tìm thấy ID!");
    try { await deleteExercise(id); alert("Xóa thành công!"); fetchExercises(); } catch { alert("Không thể xóa bài tập này."); }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>🏃 Exercise Library</h2>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            {filteredAndSorted.length !== exercises.length ? `Đang lọc: ${filteredAndSorted.length} bài tập` : `Tổng số: ${exercises.length} bài tập`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select style={{ ...darkInput, width: 160 }} value={filterTime} onChange={e => setFilterTime(e.target.value)}>
            <option value="all">⏳ Mọi thời lượng</option>
            <option value="short">Dưới 60 giây</option>
            <option value="medium">60 - 120 giây</option>
            <option value="long">Trên 120 giây</option>
          </select>
          <select style={{ ...darkInput, width: 190 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">↕️ Sắp xếp mặc định</option>
            <option value="time_asc">Thời gian: Ngắn → Dài</option>
            <option value="time_desc">Thời gian: Dài → Ngắn</option>
          </select>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input style={{ ...darkInput, paddingLeft: 36, width: 220 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên bài tập..." />
          </div>
          <button onClick={openCreate} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>+ New Exercise</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {loading ? <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>⏳ Đang tải...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={thStyle}>Exercise Info</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((ex, i) => {
                  const id = ex.id || ex._id || ex.exercise_id;
                  const type = ex.exercise_type || "free";
                  const isMember = type.toLowerCase() === "member";
                  const muscles = Array.isArray(ex.target_muscle) ? ex.target_muscle : [];
                  return (
                    <tr key={id || i} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{ex.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>ID: {String(id).substring(0, 8)}...</div>
                        {muscles.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                            {muscles.map((m, idx) => <span key={idx} style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{m}</span>)}
                          </div>
                        )}
                        {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#60a5fa", marginTop: 4, display: "inline-block" }}>Watch Video ↗</a>}
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.5)" }}>{ex.description || "---"}</td>
                      <td style={tdStyle}><span style={{ color: "#f59e0b", fontWeight: 700 }}>{ex.duration || ex.duration_seconds || 0}s</span></td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "capitalize", background: isMember ? "rgba(245,158,11,0.18)" : "rgba(16,185,129,0.18)", color: isMember ? "#f59e0b" : "#34d399" }}>{type}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button onClick={() => openEdit(ex)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                          <button onClick={() => remove(ex)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSorted.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)" }}>Không tìm thấy bài tập nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <DarkModal open={open} onClose={() => setOpen(false)} title={editing ? "✏️ Edit Exercise" : "➕ Create New Exercise"}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <FG label="Tên bài tập"><input style={darkInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Bài tập cơ cổ" /></FG>
            <FG label="Thời gian (giây)"><input type="number" style={darkInput} value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} /></FG>
          </div>
          <FG label="Mô tả chi tiết"><textarea style={{ ...darkInput, minHeight: 70, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Nhập mô tả..." /></FG>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FG label="Nhóm cơ (cách nhau bằng dấu phẩy)"><input style={darkInput} value={form.target_muscle} onChange={e => setForm({ ...form, target_muscle: e.target.value })} placeholder="VD: cổ, vai, gáy" /></FG>
            <FG label="Loại (Type)"><select style={darkInput} value={form.exercise_type} onChange={e => setForm({ ...form, exercise_type: e.target.value })}><option value="free">Miễn phí (Free)</option><option value="member">Hội viên (Member)</option></select></FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FG label="Video URL"><input style={darkInput} value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="http://youtube.com/..." /></FG>
            <FG label="Link ảnh minh hoạ"><input style={darkInput} value={form.img_list} onChange={e => setForm({ ...form, img_list: e.target.value })} placeholder="https://i.ytimg.com/..." /></FG>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={() => setOpen(false)} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy bỏ</button>
            <button onClick={save} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>Lưu thay đổi</button>
          </div>
        </div>
      </DarkModal>
    </div>
  );
}
