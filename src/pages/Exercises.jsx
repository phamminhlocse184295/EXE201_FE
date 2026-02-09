import { useEffect, useMemo, useState } from "react";
// Import service
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
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // 1. Form state khớp với JSON: title, description, duration_seconds, calories_burn, video_url
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_seconds: 60,
    calories_burn: 0,
    video_url: "",
  });

  // 2. Logic Search: Tìm theo Title hoặc Description
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return exercises;

    return exercises.filter((ex) => {
      const title = (ex.title || "").toLowerCase();
      const desc = (ex.description || "").toLowerCase();
      return title.includes(s) || desc.includes(s);
    });
  }, [exercises, q]);

  // 3. Fetch Data
  async function fetchExercises() {
    setLoading(true);
    try {
      const res = await getAllExercises();
      // API trả về { success: true, data: [...] } hoặc mảng trực tiếp
      const data = Array.isArray(res) ? res : res.data || [];
      setExercises(data);
    } catch (error) {
      console.error(error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExercises();
  }, []);

  // 4. Reset Form
  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      duration_seconds: 60,
      calories_burn: 10,
      video_url: "",
    });
    setOpen(true);
  };

  // 5. Load Data vào Form (Map đúng key từ JSON)
  const openEdit = (ex) => {
    setEditing(ex);
    setForm({
      title: ex.title || "",
      description: ex.description || "",
      duration_seconds: ex.duration_seconds || 0,
      calories_burn: ex.calories_burn || 0,
      video_url: ex.video_url || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return alert("Tên bài tập là bắt buộc");

    try {
      if (editing) {
        // ID là exercise_id
        await updateExercise(editing.exercise_id, form);
      } else {
        await createExercise(form);
      }
      setOpen(false);
      fetchExercises();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu dữ liệu");
    }
  };

  const remove = async (ex) => {
    if (!confirm(`Xoá bài tập "${ex.title}"?`)) return;
    try {
      await deleteExercise(ex.exercise_id);
      fetchExercises();
    } catch (error) {
      alert("Không thể xóa bài tập này");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header */}
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
            {filtered.length !== exercises.length
              ? `Found ${filtered.length} results`
              : `${exercises.length} exercises total`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search exercise..."
              style={{ width: 280, paddingRight: 30 }}
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
          <b>All Exercises</b>
          <span>{filtered.length} found</span>
        </div>
        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Exercise Info</th>
                  <th style={{ width: "25%" }}>Description</th>
                  <th style={{ width: "25%" }}>Stats (Time/Cal)</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ex, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{ex.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        ID: {ex.exercise_id}
                      </div>
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
                        <b>{ex.duration_seconds}s</b> duration
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        ~{ex.calories_burn} kcal
                      </div>
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
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      No exercises found.
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
          {/* Tên bài tập */}
          <FormGroup label="Tên bài tập (Title)">
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Bài tập cơ cổ"
            />
          </FormGroup>

          {/* Mô tả */}
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

          {/* Stats */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Thời gian (Giây)">
              <input
                type="number"
                className="input"
                value={form.duration_seconds}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration_seconds: parseInt(e.target.value) || 0,
                  })
                }
              />
            </FormGroup>
            <FormGroup label="Calo tiêu thụ (Kcal)">
              <input
                type="number"
                className="input"
                value={form.calories_burn}
                onChange={(e) =>
                  setForm({
                    ...form,
                    calories_burn: parseInt(e.target.value) || 0,
                  })
                }
              />
            </FormGroup>
          </div>

          {/* Video URL */}
          <FormGroup label="Video URL">
            <input
              className="input"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="http://youtuber.com/..."
            />
          </FormGroup>

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
