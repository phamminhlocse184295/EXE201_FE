import { useEffect, useMemo, useState } from "react";
import { getAllMissions, createMission, addExerciseToMission } from "../services/missionService";
import { getAllExercises } from "../services/exerciseService";

const darkInput = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 };
const levelMeta = { beginner: { bg: "rgba(16,185,129,0.18)", col: "#34d399" }, intermediate: { bg: "rgba(245,158,11,0.18)", col: "#f59e0b" }, advanced: { bg: "rgba(239,68,68,0.18)", col: "#f87171" } };
const FG = ({ label, children }) => <div style={{ display: "grid", gap: 6 }}><label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>{children}</div>;

function DarkModal({ open, onClose, title, width = 520, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ width: `min(${width}px,95%)`, borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <b style={{ color: "#fff", fontSize: 15 }}>{title}</b>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCreate, setFormCreate] = useState({ title: "", description: "", level: "beginner", target_date: "" });
  const [targetMissionId, setTargetMissionId] = useState(null);
  const [openAddEx, setOpenAddEx] = useState(false);
  const [isSubmittingEx, setIsSubmittingEx] = useState(false);
  const [formAddEx, setFormAddEx] = useState([{ exercise_id: "", point: 10 }]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await getAllMissions(filterDate || undefined);
      setMissions(Array.isArray(r) ? r : r.data || []);
    } catch (err) {
      if (err?.response?.status === 403) alert("Thông báo: Tài khoản này không có quyền xem danh sách Nhiệm vụ.");
    }
    try {
      const r = await getAllExercises();
      setExercises(r.data?.data || r.data || r || []);
    } catch (err) {
      if (err?.response?.status === 403) { try { const { default: api } = await import("../services/api"); const r2 = await api.get("/exercises/client"); setExercises(r2.data?.data || r2.data || r2 || []); } catch {} }
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [filterDate]);

  const filtered = useMemo(() => missions.filter(m => (m.title || "").toLowerCase().includes(q.toLowerCase())), [missions, q]);
  const handleOpenCreate = () => { setFormCreate({ title: "", description: "", level: "beginner", target_date: new Date().toISOString().split("T")[0] }); setOpenCreate(true); };
  const handleSaveCreate = async () => {
    if (!formCreate.title.trim()) return alert("Vui lòng nhập tên nhiệm vụ");
    if (!formCreate.target_date) return alert("Vui lòng chọn ngày chạy");
    setIsSubmitting(true);
    try { await createMission(formCreate); alert("Tạo nhiệm vụ thành công!"); setOpenCreate(false); fetchData(); } catch { alert("Lỗi khi tạo nhiệm vụ."); }
    setIsSubmitting(false);
  };
  const handleOpenAddEx = (id) => { setTargetMissionId(id); setFormAddEx([{ exercise_id: "", point: 10 }]); setOpenAddEx(true); };
  const updateExForm = (i, field, value) => { const u = [...formAddEx]; u[i][field] = value; setFormAddEx(u); };
  const addExRow = () => setFormAddEx([...formAddEx, { exercise_id: "", point: 10 }]);
  const removeExRow = (i) => { const u = [...formAddEx]; u.splice(i, 1); setFormAddEx(u); };
  const handleSaveAddEx = async () => {
    if (formAddEx.find(r => !r.exercise_id)) return alert("Vui lòng chọn bài tập cho tất cả các dòng");
    if (!targetMissionId) return alert("Không tìm thấy Mission ID");
    setIsSubmittingEx(true);
    try { await addExerciseToMission(targetMissionId, { exercises: formAddEx }); alert("Thêm bài tập thành công!"); setOpenAddEx(false); fetchData(); } catch { alert("Lỗi khi thêm bài tập."); }
    setIsSubmittingEx(false);
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>🎯 Quản lý Nhiệm vụ</h2>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>Tìm thấy {filtered.length} nhiệm vụ</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>LỌC NGÀY</label>
            <input type="date" style={{ ...darkInput, width: 150 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input style={{ ...darkInput, paddingLeft: 36, width: 200 }} placeholder="Tìm tên nhiệm vụ..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button onClick={handleOpenCreate} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}>+ Tạo nhiệm vụ</button>
        </div>
      </div>

      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {loading && missions.length === 0 ? <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>⏳ Đang tải...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={thStyle}>Tên Nhiệm Vụ</th>
                  <th style={thStyle}>Mức Độ</th>
                  <th style={thStyle}>Ngày Chạy</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const lvl = levelMeta[(m.level || "beginner").toLowerCase()] || levelMeta.beginner;
                  return (
                    <tr key={m.id || m._id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{m.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description}</div>
                      </td>
                      <td style={tdStyle}><span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, background: lvl.bg, color: lvl.col, fontWeight: 700, textTransform: "capitalize" }}>{m.level || "Beginner"}</span></td>
                      <td style={{ ...tdStyle, color: "#60a5fa", fontWeight: 700 }}>{m.target_date || "N/A"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button onClick={() => handleOpenAddEx(m.id || m._id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.1)", color: "#34d399", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                          + Gán Bài Tập
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)" }}>Không tìm thấy nhiệm vụ nào. {filterDate && "Thử bỏ lọc theo ngày."}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Nhiệm Vụ */}
      <DarkModal open={openCreate} onClose={() => setOpenCreate(false)} title="🎯 Tạo Nhiệm Vụ Mới">
        <div style={{ display: "grid", gap: 16 }}>
          <FG label="Tên nhiệm vụ"><input style={darkInput} value={formCreate.title} onChange={e => setFormCreate({ ...formCreate, title: e.target.value })} placeholder="Ví dụ: Nhiệm vụ dãn cơ buổi sáng..." /></FG>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FG label="Mức độ"><select style={darkInput} value={formCreate.level} onChange={e => setFormCreate({ ...formCreate, level: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></FG>
            <FG label="Ngày chạy"><input type="date" style={darkInput} value={formCreate.target_date} onChange={e => setFormCreate({ ...formCreate, target_date: e.target.value })} /></FG>
          </div>
          <FG label="Mô tả"><textarea style={{ ...darkInput, minHeight: 70, resize: "vertical" }} rows={3} value={formCreate.description} onChange={e => setFormCreate({ ...formCreate, description: e.target.value })} placeholder="Mô tả chi tiết để user dễ hiểu..." /></FG>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={() => setOpenCreate(false)} disabled={isSubmitting} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy bỏ</button>
            <button onClick={handleSaveCreate} disabled={isSubmitting} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Đang xử lý..." : "Lưu lại"}
            </button>
          </div>
        </div>
      </DarkModal>

      {/* Modal Gán Bài Tập */}
      <DarkModal open={openAddEx} onClose={() => setOpenAddEx(false)} title="➕ Gán Bài Tập Cho Nhiệm Vụ" width={640}>
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Chọn các bài tập từ hệ thống và điểm thưởng tương ứng</p>
          {formAddEx.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>CHỌN BÀI TẬP</label>
                <select style={{ ...darkInput, marginTop: 4 }} value={row.exercise_id} onChange={e => updateExForm(i, "exercise_id", e.target.value)}>
                  <option value="">-- Chọn bài tập --</option>
                  {exercises.map(ex => <option key={ex.id || ex._id} value={ex.id || ex._id}>{ex.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>ĐIỂM THƯỞNG</label>
                <input type="number" style={{ ...darkInput, marginTop: 4 }} value={row.point} onChange={e => updateExForm(i, "point", Number(e.target.value))} min={0} />
              </div>
              <button onClick={() => removeExRow(i)} style={{ marginTop: 18, color: "#f87171", border: "none", background: "none", cursor: "pointer", fontWeight: 900, padding: "0 8px", fontSize: 18 }}>✕</button>
            </div>
          ))}
          <button onClick={addExRow} style={{ padding: "10px", borderRadius: 10, border: "1px dashed rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.08)", color: "#60a5fa", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ Gán thêm dòng bài tập</button>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={() => setOpenAddEx(false)} disabled={isSubmittingEx} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy bỏ</button>
            <button onClick={handleSaveAddEx} disabled={isSubmittingEx} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: isSubmittingEx ? 0.7 : 1 }}>
              {isSubmittingEx ? "Đang xử lý..." : "Xác nhận gán bài"}
            </button>
          </div>
        </div>
      </DarkModal>
    </div>
  );
}
