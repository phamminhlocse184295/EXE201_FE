import { useEffect, useMemo, useState } from "react";
import {
  getAllMissions,
  createMission,
  addExerciseToMission,
} from "../services/missionService";
import { getAllExercises } from "../services/exerciseService";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lọc client side
  const [q, setQ] = useState("");
  // Lọc server side theo date
  const [filterDate, setFilterDate] = useState("");

  // States cho Tạo nhiệm vụ
  const [openCreate, setOpenCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCreate, setFormCreate] = useState({
    title: "",
    description: "",
    level: "beginner",
    target_date: "",
  });

  // States cho Thêm bài tập vào nhiệm vụ
  const [targetMissionId, setTargetMissionId] = useState(null); // ID nhiệm vụ đang được chọn
  const [openAddEx, setOpenAddEx] = useState(false);
  const [isSubmittingEx, setIsSubmittingEx] = useState(false);
  // Do API yêu cầu mảng các bài tập
  const [formAddEx, setFormAddEx] = useState([
    { exercise_id: "", point: 10 }
  ]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Missions độc lập
    try {
      const resMissions = await getAllMissions(filterDate || undefined);
      setMissions(Array.isArray(resMissions) ? resMissions : resMissions.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu Missions:", err);
      // Nếu là User thường thì backend sẽ trả 403 khi lấy DS Mission
      if (err?.response?.status === 403) {
        alert("Thông báo: Tài khoản của bạn là tài khoản User thường, Backend đang chặn (Lỗi 403) không cho phép xem danh sách Nhiệm vụ dành cho Admin/Manager. Bạn cần đăng nhập bằng tài khoản Quản trị để thấy danh sách.");
      }
    }

    // 2. Fetch Exercises độc lập
    try {
      const resExercises = await getAllExercises();
      setExercises(resExercises.data?.data || resExercises.data || resExercises || []);
    } catch (err) {
      console.error("Lỗi tải API /exercises (của Admin):", err);
      if (err.response?.status === 403) {
        // Fallback sang API của Client dành cho User
        try {
          const { default: api } = await import("../services/api");
          const fallbackRes = await api.get("/exercises/client");
          setExercises(fallbackRes.data?.data || fallbackRes.data || fallbackRes || []);
          console.log("Đã fallback lấy danh sách bài tập thành công thông qua API Client!");
        } catch (fallbackErr) {
          console.error("Fallback cũng thất bại:", fallbackErr);
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterDate]); // Gọi lại khi đổi ngày lọc

  // Xử lý Lọc Title trên Client
  const filtered = useMemo(() => {
    return missions.filter((m) =>
      (m.title || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [missions, q]);

  // Handle Mở modal tạo Mission
  const handleOpenCreate = () => {
    setFormCreate({
      title: "",
      description: "",
      level: "beginner",
      target_date: new Date().toISOString().split("T")[0], // Mặc định hôm nay
    });
    setOpenCreate(true);
  };

  const handleSaveCreate = async () => {
    if (!formCreate.title.trim()) return alert("Vui lòng nhập tên nhiệm vụ");
    if (!formCreate.target_date) return alert("Vui lòng chọn ngày chạy");
    
    setIsSubmitting(true);
    try {
      const res = await createMission(formCreate);
      if (res) {
        alert("Tạo nhiệm vụ thành công!");
        setOpenCreate(false);
        fetchData(); // reload
      }
    } catch (err) {
      alert("Lỗi khi tạo nhiệm vụ. Vui lòng kiểm tra lại.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Mở modal Add Exercise
  const handleOpenAddEx = (missionId) => {
    setTargetMissionId(missionId);
    setFormAddEx([{ exercise_id: "", point: 10 }]);
    setOpenAddEx(true);
  };

  // Thay đổi dòng bài tập
  const updateExForm = (index, field, value) => {
    const updated = [...formAddEx];
    updated[index][field] = value;
    setFormAddEx(updated);
  };

  const addExRow = () => {
    setFormAddEx([...formAddEx, { exercise_id: "", point: 10 }]);
  };
  
  const removeExRow = (index) => {
    const updated = [...formAddEx];
    updated.splice(index, 1);
    setFormAddEx(updated);
  };

  const handleSaveAddEx = async () => {
    // Validate
    const invalid = formAddEx.find(item => !item.exercise_id);
    if (invalid) return alert("Vui lòng chọn bài tập cho tất cả các dòng");
    if (!targetMissionId) return alert("Không tìm thấy Mission ID");

    setIsSubmittingEx(true);
    try {
      const payload = { exercises: formAddEx };
      const res = await addExerciseToMission(targetMissionId, payload);
      if (res) {
        alert("Thêm bài tập vào nhiệm vụ thành công!");
        setOpenAddEx(false);
        // Có thể reload lại dữ liệu để lấy danh sách exercises mới nhất của mission (nếu API GET missions có trả về)
        fetchData(); 
      }
    } catch (err) {
      alert("Lỗi khi thêm bài tập. Vui lòng thử lại.");
    } finally {
      setIsSubmittingEx(false);
    }
  };

  if (loading && missions.length === 0) return <div style={{ padding: 20 }}>Đang tải dữ liệu nhiệm vụ...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Quản lý Nhiệm vụ</h2>
          <div style={{ color: "var(--muted)" }}>Tìm thấy {filtered.length} nhiệm vụ</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginRight: 8, color: "#64748b" }}>
              LỌC NGÀY:
            </label>
            <input
              type="date"
              className="input"
              style={{ width: 140 }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <input
            className="input"
            placeholder="Tìm tên nhiệm vụ..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btnPrimary" onClick={handleOpenCreate}>
            + Tạo nhiệm vụ
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="board">
        <div className="boardBody" style={{ padding: 0 }}>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Tên Nhiệm Vụ</th>
                  <th>Mức độ</th>
                  <th>Ngày chạy</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id || m._id}>
                    <td>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{m.title}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          maxWidth: "350px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ textTransform: "capitalize" }}>
                        {m.level || "Beginner"}
                      </span>
                    </td>
                    <td>
                      <b style={{ color: "#2563eb", letterSpacing: 0.5 }}>
                        {m.target_date || "N/A"}
                      </b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn" 
                        style={{ marginRight: 6, color: "#10b981", borderColor: "#10b981" }}
                        onClick={() => handleOpenAddEx(m.id || m._id)}
                        title="Gán bài tập cho nhiệm vụ này"
                      >
                        + Gán Bài Tập
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                      Không tìm thấy nhiệm vụ nào. {filterDate && "Thử bỏ lọc theo ngày để xem tổng hợp."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TẠO NHIỆM VỤ */}
      {openCreate && (
        <div
          className="modalOverlay"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          }}
        >
          <div className="modal" style={{ background: "#fff", width: "500px", padding: "24px", borderRadius: "8px" }}>
            <h3 style={{ marginTop: 0 }}>Tạo Nhiệm Vụ Mới</h3>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700 }}>TÊN NHIỆM VỤ</label>
              <input
                className="input"
                value={formCreate.title}
                onChange={(e) => setFormCreate({ ...formCreate, title: e.target.value })}
                placeholder="Ví dụ: Nhiệm vụ dãn cơ buổi sáng..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>MỨC ĐỘ</label>
                <select
                  className="input"
                  value={formCreate.level}
                  onChange={(e) => setFormCreate({ ...formCreate, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>NGÀY CHẠY</label>
                <input
                  type="date"
                  className="input"
                  value={formCreate.target_date}
                  onChange={(e) => setFormCreate({ ...formCreate, target_date: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700 }}>MÔ TẢ</label>
              <textarea
                className="input"
                rows={3}
                value={formCreate.description}
                onChange={(e) => setFormCreate({ ...formCreate, description: e.target.value })}
                placeholder="Mô tả chi tiết để user dễ hiểu..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button className="btn" onClick={() => setOpenCreate(false)} disabled={isSubmitting}>
                Hủy bỏ
              </button>
              <button className="btn btnPrimary" onClick={handleSaveCreate} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Lưu lại"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GÁN BÀI TẬP */}
      {openAddEx && (
        <div
          className="modalOverlay"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          }}
        >
          <div className="modal" style={{ background: "#fff", width: "600px", maxHeight: "80vh", overflowY: "auto", padding: "24px", borderRadius: "8px" }}>
            <h3 style={{ marginTop: 0 }}>Gán Bài Tập Cho Nhiệm Vụ</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Chọn các bài tập từ hệ thống và điểm thưởng tương ứng
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formAddEx.map((row, index) => (
                <div key={index} style={{ display: "flex", gap: 12, alignItems: "center", background: "#f8fafc", padding: 12, borderRadius: 6, border: "1px dashed #cbd5e1" }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>CHỌN BÀI TẬP</label>
                    <select
                      className="input"
                      value={row.exercise_id}
                      onChange={(e) => updateExForm(index, "exercise_id", e.target.value)}
                    >
                      <option value="">-- Chọn bài tập --</option>
                      {exercises.map((ex) => (
                        <option key={ex.id || ex._id} value={ex.id || ex._id}>
                          {ex.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>ĐIỂM THƯỞNG</label>
                    <input
                      type="number"
                      className="input"
                      value={row.point}
                      onChange={(e) => updateExForm(index, "point", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div style={{ paddingTop: 16 }}>
                    <button
                      className="btn"
                      style={{ color: "red", border: "none", background: "none", cursor: "pointer", padding: "0 8px" }}
                      onClick={() => removeExRow(index)}
                      title="Xóa dòng này"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn"
              style={{ marginTop: 16, width: "100%", border: "1px dashed #3b82f6", color: "#3b82f6", background: "#eff6ff" }}
              onClick={addExRow}
            >
              + Gán thêm dòng bài tập
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button className="btn" onClick={() => setOpenAddEx(false)} disabled={isSubmittingEx}>
                Hủy bỏ
              </button>
              <button className="btn btnPrimary" onClick={handleSaveAddEx} disabled={isSubmittingEx}>
                {isSubmittingEx ? "Đang xử lý..." : "Xác nhận gán bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
