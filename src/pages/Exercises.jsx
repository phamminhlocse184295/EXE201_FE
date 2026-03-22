import { useEffect, useMemo, useState } from "react";
import {
  getAllExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../services/exerciseService";

// Modal giữ nguyên
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: "650px", maxWidth: "95%" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <b style={{ fontSize: 16 }}>{title}</b>
          <button
            className="btn"
            onClick={onClose}
            style={{ padding: "4px 8px" }}
          >
            ✕
          </button>
        </div>
        <div
          className="modalBody"
          style={{ maxHeight: "85vh", overflowY: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Input Group
const FormGroup = ({ label, children }) => (
  <div style={{ display: "grid", gap: 4 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "var(--muted)",
        textTransform: "uppercase",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

export default function Exercises() {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);

  // STATE TÌM KIẾM VÀ BỘ LỌC
  const [q, setQ] = useState("");
  const [filterTime, setFilterTime] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 60,
    video_url: "",
    exercise_type: "free",
    target_muscle: "",
    img_list: "",
  });

  const filteredAndSorted = useMemo(() => {
    let result = exercises.filter((ex) => {
      const s = q.trim().toLowerCase();
      if (!s) return true;
      const title = (ex.title || "").toLowerCase();
      const desc = (ex.description || "").toLowerCase();
      return title.includes(s) || desc.includes(s);
    });

    if (filterTime === "short") {
      result = result.filter(
        (ex) => (ex.duration || ex.duration_seconds || 0) < 60,
      );
    } else if (filterTime === "medium") {
      result = result.filter(
        (ex) =>
          (ex.duration || ex.duration_seconds || 0) >= 60 &&
          (ex.duration || ex.duration_seconds || 0) <= 120,
      );
    } else if (filterTime === "long") {
      result = result.filter(
        (ex) => (ex.duration || ex.duration_seconds || 0) > 120,
      );
    }

    if (sortBy === "time_asc") {
      result.sort(
        (a, b) =>
          (a.duration || a.duration_seconds || 0) -
          (b.duration || b.duration_seconds || 0),
      );
    } else if (sortBy === "time_desc") {
      result.sort(
        (a, b) =>
          (b.duration || b.duration_seconds || 0) -
          (a.duration || a.duration_seconds || 0),
      );
    }

    return result;
  }, [exercises, q, filterTime, sortBy]);

  async function fetchExercises() {
    setLoading(true);
    try {
      const res = await getAllExercises();
      const data = Array.isArray(res) ? res : res.data?.data || res.data || [];
      setExercises(data);
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 403) {
        try {
          const { default: api } = await import("../services/api");
          const fallbackRes = await api.get("/exercises/client");
          const fallbackData = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes.data?.data || fallbackRes.data || [];
          setExercises(fallbackData);
        } catch (e) {
          setExercises([]);
        }
      } else {
        setExercises([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExercises();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      duration: 60,
      video_url: "",
      exercise_type: "free",
      target_muscle: "",
      img_list: "",
    });
    setOpen(true);
  };

  const openEdit = (ex) => {
    setEditing(ex);

    const muscleStr = Array.isArray(ex.target_muscle)
      ? ex.target_muscle.join(", ")
      : ex.target_muscle || "";
    const imgStr =
      Array.isArray(ex.img_list) && ex.img_list.length > 0
        ? ex.img_list[0]
        : ex.img_list || "";

    setForm({
      title: ex.title || "",
      description: ex.description || "",
      duration: ex.duration || ex.duration_seconds || 0,
      video_url: ex.video_url || "",
      exercise_type: ex.exercise_type || "free",
      target_muscle: muscleStr,
      img_list: imgStr,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return alert("Tên bài tập là bắt buộc");

    // ĐÃ SỬA CHỐT HẠ: Cắt bỏ hoàn toàn exercise_type cho khớp đúng 6 trường của API
    const payload = {
      title: form.title.trim(),
      description: form.description || "",
      video_url: form.video_url || "",
      duration: Number(form.duration) || 0,
      target_muscle: form.target_muscle
        ? form.target_muscle
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      img_list:
        form.img_list && form.img_list.trim() !== ""
          ? [form.img_list.trim()]
          : [],
    };

    console.log("Payload CHUẨN 100% gửi lên Backend:", payload);

    try {
      if (editing) {
        const idToUpdate = editing.id || editing._id || editing.exercise_id;
        if (!idToUpdate) return alert("Lỗi: Không tìm thấy ID!");

        await updateExercise(idToUpdate, payload);
        alert("Cập nhật bài tập thành công!");
      } else {
        await createExercise(payload);
        alert("Thêm bài tập mới thành công!");
      }
      setOpen(false);
      fetchExercises();
    } catch (error) {
      console.error(
        "Chi tiết lỗi 500 từ Server:",
        error.response?.data || error.message,
      );
      alert(
        `Lỗi Backend: ${error.response?.data?.message || "Gửi API thất bại."}`,
      );
    }
  };

  const remove = async (ex) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá bài tập "${ex.title}"?`)) return;
    const idToDelete = ex.id || ex._id || ex.exercise_id;
    if (!idToDelete) return alert("Lỗi: Không tìm thấy ID!");
    try {
      await deleteExercise(idToDelete);
      alert("Xóa bài tập thành công!");
      fetchExercises();
    } catch (error) {
      console.error(error);
      alert("Không thể xóa bài tập này.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Exercise Library</h2>
          <div style={{ color: "var(--muted)" }}>
            {filteredAndSorted.length !== exercises.length
              ? `Đang lọc: ${filteredAndSorted.length} bài tập`
              : `Tổng số: ${exercises.length} bài tập`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            className="input"
            style={{ width: 140, cursor: "pointer" }}
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
          >
            <option value="all">⏳ Mọi thời lượng</option>
            <option value="short">Dưới 60 giây</option>
            <option value="medium">60 - 120 giây</option>
            <option value="long">Trên 120 giây</option>
          </select>

          <select
            className="input"
            style={{ width: 170, cursor: "pointer" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">↕️ Sắp xếp mặc định</option>
            <option value="time_asc">Thời gian: Ngắn → Dài</option>
            <option value="time_desc">Thời gian: Dài → Ngắn</option>
          </select>

          <div style={{ position: "relative" }}>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên bài tập..."
              style={{ width: 220, paddingRight: 30 }}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button className="btn btnPrimary" onClick={openCreate}>
            + New Exercise
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="board">
        <div className="boardHeader">
          <b>Danh sách bài tập</b>
          <span>{filteredAndSorted.length} found</span>
        </div>
        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Exercise Info</th>
                  <th style={{ width: "25%" }}>Description</th>
                  <th style={{ width: "20%" }}>Duration (Time)</th>
                  <th style={{ width: "10%" }}>Type</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((ex, i) => {
                  const id = ex.id || ex._id || ex.exercise_id;
                  const type = ex.exercise_type || "free";
                  const isMember = type.toLowerCase() === "member";

                  const muscleArr = Array.isArray(ex.target_muscle)
                    ? ex.target_muscle
                    : [];

                  return (
                    <tr key={id || i}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{ex.title}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          ID: {String(id).substring(0, 8)}...
                        </div>

                        {muscleArr.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              flexWrap: "wrap",
                              marginTop: 4,
                            }}
                          >
                            {muscleArr.map((m, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  fontSize: 10,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        )}

                        {ex.video_url && (
                          <a
                            href={ex.video_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11,
                              color: "#007bff",
                              textDecoration: "none",
                              marginTop: 4,
                              display: "inline-block",
                            }}
                          >
                            Watch Video ↗
                          </a>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#555",
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ex.description || "---"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <b>{ex.duration || ex.duration_seconds || 0}s</b>{" "}
                          duration
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 4,
                            textTransform: "capitalize",
                            background: isMember ? "#fef08a" : "#dcfce7",
                            color: isMember ? "#854d0e" : "#166534",
                          }}
                        >
                          {type}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn"
                          onClick={() => openEdit(ex)}
                          style={{ marginRight: 6 }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => remove(ex)}
                          style={{
                            color: "red",
                            background: "rgba(255,0,0,0.05)",
                            borderColor: "rgba(255,0,0,0.1)",
                          }}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Không tìm thấy bài tập nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal
        open={open}
        title={editing ? "Edit Exercise" : "Create New Exercise"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
          >
            <FormGroup label="Tên bài tập (Title)">
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Bài tập cơ cổ"
              />
            </FormGroup>

            <FormGroup label="Thời gian (Giây)">
              <input
                type="number"
                className="input"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: parseInt(e.target.value) || 0 })
                }
              />
            </FormGroup>
          </div>

          <FormGroup label="Mô tả chi tiết">
            <textarea
              className="input"
              style={{ minHeight: 80, resize: "vertical" }}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Nhập mô tả..."
            />
          </FormGroup>

          <hr style={{ border: 0, borderTop: "1px solid #eee", margin: 0 }} />

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Nhóm cơ mục tiêu (Cách nhau bằng dấu phẩy)">
              <input
                className="input"
                value={form.target_muscle}
                onChange={(e) =>
                  setForm({ ...form, target_muscle: e.target.value })
                }
                placeholder="VD: cổ, vai, gáy"
              />
            </FormGroup>

            {/* GIAO DIỆN VẪN CÒN ĐÓ NHƯNG DATA SẼ BỊ LỌC BỎ KHI BẤM LƯU */}
            <FormGroup label="Loại (Type)">
              <select
                className="input"
                value={form.exercise_type}
                onChange={(e) =>
                  setForm({ ...form, exercise_type: e.target.value })
                }
              >
                <option value="free">Miễn phí (Free)</option>
                <option value="member">Hội viên (Member)</option>
              </select>
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Video URL">
              <input
                className="input"
                value={form.video_url}
                onChange={(e) =>
                  setForm({ ...form, video_url: e.target.value })
                }
                placeholder="http://youtube.com/..."
              />
            </FormGroup>
            <FormGroup label="Link ảnh minh hoạ (IMG_LIST)">
              <input
                className="input"
                value={form.img_list}
                onChange={(e) => setForm({ ...form, img_list: e.target.value })}
                placeholder="https://i.ytimg.com/..."
              />
            </FormGroup>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button className="btn" onClick={() => setOpen(false)}>
              Huỷ bỏ
            </button>
            <button className="btn btnPrimary" onClick={save}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
