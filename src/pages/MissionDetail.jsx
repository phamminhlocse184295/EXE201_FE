import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMissionById, getMissionExercises, removeExerciseFromMission, deleteMission, updateMission, getMissionStats } from "../services/missionService";
import { getAllExercises } from "../services/exerciseService";

const darkCard = { borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,245,255,0.08)", fontWeight: 600, fontFamily: "monospace" };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(0,245,255,0.05)", fontSize: 13 };
const levelMeta = { beginner: { bg: "rgba(16,185,129,0.18)", col: "#34d399" }, intermediate: { bg: "rgba(245,158,11,0.18)", col: "#f59e0b" }, advanced: { bg: "rgba(239,68,68,0.18)", col: "#f87171" } };

function ConfirmModal({ open, onClose, onConfirm, title, message, customContent, confirmText = "Xác nhận", cancelText = "Hủy" }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ width: "min(500px,95%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: 16 }}>{title}</h3>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {customContent || <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{message}</p>}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });
  const [openEdit, setOpenEdit] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [formEdit, setFormEdit] = useState({ title: "", description: "", level: "beginner", target_date: "" });
  const [missionStats, setMissionStats] = useState(null);

  console.log("🔍 MissionDetail component loaded with ID:", id);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    console.log("📡 Fetching data for mission ID:", id);
    
    try {
      const [missionRes, exercisesRes, allExRes, statsRes] = await Promise.all([
        getMissionById(id),
        getMissionExercises(id),
        getAllExercises(),
        getMissionStats(id).catch(() => null) // Stats có thể chưa có API
      ]);
      
      console.log("✅ Mission data:", missionRes.data);
      console.log("✅ Mission exercises:", exercisesRes.data);
      console.log("✅ All exercises:", allExRes.data);
      
      setMission(missionRes.data || missionRes);
      setExercises(exercisesRes.data?.exercises || exercisesRes.data || []);
      setAllExercises(allExRes.data?.data || allExRes.data || []);
      setMissionStats(statsRes?.data || null);
      
    } catch (err) {
      console.error("❌ Error fetching mission detail:", err);
      setError(err.message || "Không thể tải thông tin nhiệm vụ");
      
      if (err?.response?.status === 404) {
        setError("Không tìm thấy nhiệm vụ này");
        setTimeout(() => navigate("/manager/missions"), 2000);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRemoveExercise = async (exerciseId) => {
    try {
      await removeExerciseFromMission(id, exerciseId);
      alert("Xóa bài tập khỏi nhiệm vụ thành công!");
      fetchData();
    } catch (err) {
      alert("Lỗi khi xóa bài tập.");
    }
    setDeleteConfirm({ open: false, type: null, id: null });
  };

  const handleDeleteMission = async () => {
    try {
      await deleteMission(id);
      alert("Xóa nhiệm vụ thành công!");
      navigate("/manager/missions");
    } catch (err) {
      alert("Lỗi khi xóa nhiệm vụ.");
    }
    setDeleteConfirm({ open: false, type: null, id: null });
  };

  const getExerciseTitle = (exerciseId) => {
    const exercise = allExercises.find(ex => (ex.id || ex._id) === exerciseId);
    return exercise?.title || "Unknown Exercise";
  };

  const handleOpenEdit = () => {
    if (mission) {
      setFormEdit({
        title: mission.title || "",
        description: mission.description || "",
        level: mission.level || "beginner",
        target_date: mission.target_date || new Date().toISOString().split("T")[0]
      });
      setOpenEdit(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!formEdit.title.trim()) return alert("Vui lòng nhập tên nhiệm vụ");
    if (!formEdit.target_date) return alert("Vui lòng chọn ngày chạy");
    
    setIsSubmittingEdit(true);
    try {
      await updateMission(id, formEdit);
      alert("Cập nhật nhiệm vụ thành công!");
      setOpenEdit(false);
      fetchData();
    } catch (err) {
      alert("Lỗi khi cập nhật nhiệm vụ.");
    }
    setIsSubmittingEdit(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, color: "rgba(255,255,255,0.3)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <div>Đang tải thông tin nhiệm vụ...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
        <div style={{ marginBottom: 16 }}>{error}</div>
        <button 
          onClick={() => navigate("/manager/missions")}
          style={{ 
            padding: "10px 20px", 
            borderRadius: 10, 
            border: "1px solid rgba(255,255,255,0.1)", 
            background: "rgba(255,255,255,0.1)", 
            color: "#fff", 
            cursor: "pointer" 
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
        <div>Không tìm thấy nhiệm vụ</div>
      </div>
    );
  }

  const lvl = levelMeta[(mission.level || "beginner").toLowerCase()] || levelMeta.beginner;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button 
            onClick={() => navigate("/manager/missions")}
            style={{ 
              padding: "8px 16px", 
              borderRadius: 10, 
              border: "1px solid rgba(255,255,255,0.1)", 
              background: "transparent", 
              color: "rgba(255,255,255,0.6)", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            ← Quay lại
          </button>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>
            🎯 {mission.title}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            onClick={handleOpenEdit}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 12, 
              border: "1px solid rgba(59,130,246,0.3)", 
              background: "rgba(59,130,246,0.1)", 
              color: "#3b82f6", 
              fontWeight: 600, 
              cursor: "pointer" 
            }}
          >
            ✏️ Chỉnh Sửa
          </button>
          <button 
            onClick={() => setDeleteConfirm({ open: true, type: "mission", id })}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 12, 
              border: "1px solid rgba(239,68,68,0.3)", 
              background: "rgba(239,68,68,0.1)", 
              color: "#f87171", 
              fontWeight: 600, 
              cursor: "pointer" 
            }}
          >
            🗑️ Xóa Nhiệm Vụ
          </button>
        </div>
      </div>

      {/* Mission Info */}
      <div style={darkCard}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Mức Độ
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, background: lvl.bg, color: lvl.col, fontWeight: 700, textTransform: "capitalize" }}>
                {mission.level || "Beginner"}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Ngày Chạy
              </div>
              <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14 }}>
                {mission.target_date || "N/A"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Tổng Điểm
              </div>
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: 14 }}>
                {exercises.reduce((sum, ex) => sum + (ex.point || 0), 0)} điểm
              </div>
            </div>
          </div>
          
          {mission.description && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Mô Tả
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                {mission.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Stats */}
      {missionStats && (
        <div style={darkCard}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ margin: 0, color: "#fff", fontSize: 16 }}>
              📊 Thống Kê Hoàn Thành
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div style={{ textAlign: "center", padding: 20, borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#34d399", marginBottom: 8 }}>
                  {missionStats.totalUsers || 0}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Tổng User
                </div>
              </div>
              <div style={{ textAlign: "center", padding: 20, borderRadius: 12, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#3b82f6", marginBottom: 8 }}>
                  {missionStats.completedUsers || 0}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Đã Hoàn Thành
                </div>
              </div>
              <div style={{ textAlign: "center", padding: 20, borderRadius: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#f59e0b", marginBottom: 8 }}>
                  {missionStats.completionRate ? `${missionStats.completionRate}%` : "0%"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Tỷ Lệ Hoàn Thành
                </div>
              </div>
              <div style={{ textAlign: "center", padding: 20, borderRadius: 12, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#8b5cf6", marginBottom: 8 }}>
                  {missionStats.averageScore || 0}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Điểm Trung Bình
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Tiến Độ Hoàn Thành
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>
                  {missionStats.completionRate || 0}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    borderRadius: 4, 
                    background: "linear-gradient(90deg, #34d399, #10b981)", 
                    width: `${missionStats.completionRate || 0}%`,
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercises List */}
      <div style={darkCard}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: 16 }}>
            📋 Danh Sách Bài Tập ({exercises.length})
          </h3>
        </div>
        {exercises.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
            <div>Chưa có bài tập nào được gán</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={thStyle}>Tên Bài Tập</th>
                  <th style={thStyle}>Điểm Thưởng</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex, index) => (
                  <tr key={ex.id || ex._id || index} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {getExerciseTitle(ex.exercise_id)}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                        ID: {ex.exercise_id}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#34d399", fontWeight: 600, fontSize: 12 }}>
                        +{ex.point || 0} điểm
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button 
                        onClick={() => setDeleteConfirm({ open: true, type: "exercise", id: ex.exercise_id })}
                        style={{ 
                          padding: "6px 12px", 
                          borderRadius: 8, 
                          border: "1px solid rgba(239,68,68,0.3)", 
                          background: "rgba(239,68,68,0.1)", 
                          color: "#f87171", 
                          cursor: "pointer", 
                          fontSize: 12, 
                          fontWeight: 600 
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        open={deleteConfirm.open && deleteConfirm.type === "exercise"}
        onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}
        onConfirm={() => handleRemoveExercise(deleteConfirm.id)}
        title="Xác nhận xóa bài tập"
        message="Bạn có chắc chắn muốn xóa bài tập này khỏi nhiệm vụ không?"
      />
      
      <ConfirmModal
        open={deleteConfirm.open && deleteConfirm.type === "mission"}
        onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}
        onConfirm={handleDeleteMission}
        title="Xác nhận xóa nhiệm vụ"
        message="⚠️ Cảnh báo: Xóa nhiệm vụ sẽ xóa tất cả dữ liệu liên quan. Bạn có chắc chắn muốn tiếp tục?"
      />

      {/* Edit Mission Modal */}
      <ConfirmModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onConfirm={handleSaveEdit}
        title="✏️ Chỉnh Sửa Nhiệm Vụ"
        message=""
        customContent={
          <div style={{ display: "grid", gap: 16, padding: "20px 0" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                Tên nhiệm vụ
              </label>
              <input 
                style={{ 
                  width: "100%", 
                  padding: "11px 14px", 
                  borderRadius: 10, 
                  border: "1px solid rgba(0,245,255,0.15)", 
                  background: "rgba(0,10,20,0.6)", 
                  color: "#fff", 
                  fontSize: 13, 
                  outline: "none", 
                  boxSizing: "border-box" 
                }}
                value={formEdit.title} 
                onChange={e => setFormEdit({ ...formEdit, title: e.target.value })} 
                placeholder="Ví dụ: Nhiệm vụ dãn cơ buổi sáng..." 
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                  Mức độ
                </label>
                <select 
                  style={{ 
                    width: "100%", 
                    padding: "11px 14px", 
                    borderRadius: 10, 
                    border: "1px solid rgba(0,245,255,0.15)", 
                    background: "#1e293b", 
                    color: "#fff", 
                    fontSize: 13, 
                    outline: "none", 
                    boxSizing: "border-box" 
                  }}
                  value={formEdit.level} 
                  onChange={e => setFormEdit({ ...formEdit, level: e.target.value })}
                >
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                  Ngày chạy
                </label>
                <input 
                  type="date" 
                  style={{ 
                    width: "100%", 
                    padding: "11px 14px", 
                    borderRadius: 10, 
                    border: "1px solid rgba(0,245,255,0.15)", 
                    background: "rgba(0,10,20,0.6)", 
                    color: "#fff", 
                    fontSize: 13, 
                    outline: "none", 
                    boxSizing: "border-box" 
                  }}
                  value={formEdit.target_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setFormEdit({ ...formEdit, target_date: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                Mô tả
              </label>
              <textarea 
                style={{ 
                  width: "100%", 
                  padding: "11px 14px", 
                  borderRadius: 10, 
                  border: "1px solid rgba(0,245,255,0.15)", 
                  background: "rgba(0,10,20,0.6)", 
                  color: "#fff", 
                  fontSize: 13, 
                  outline: "none", 
                  boxSizing: "border-box",
                  minHeight: 70,
                  resize: "vertical"
                }}
                rows={3}
                value={formEdit.description} 
                onChange={e => setFormEdit({ ...formEdit, description: e.target.value })} 
                placeholder="Mô tả chi tiết để user dễ hiểu..." 
              />
            </div>
          </div>
        }
        confirmText={isSubmittingEdit ? "Đang xử lý..." : "Lưu lại"}
        cancelText="Hủy bỏ"
      />
    </div>
  );
}
