import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import đầy đủ các service cần thiết
import {
  getAllCourses,
  deleteCourse,
  createCourse,
} from "../services/courseService";
import { getAllExercises } from "../services/exerciseService";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]); // Lưu danh sách bài tập để chọn
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // State quản lý Modal và Form
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    price: 0,
    img_url: "",
    days: [], // Chứa danh sách ngày tập
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load song song cả Khóa học và Bài tập
      const [resCourses, resExercises] = await Promise.all([
        getAllCourses(),
        getAllExercises(),
      ]);

      // Xử lý data Courses (Mảng trực tiếp)
      setCourses(
        Array.isArray(resCourses) ? resCourses : resCourses.data || [],
      );

      // Xử lý data Exercises để dùng cho dropdown chọn bài tập
      setExercises(
        resExercises.data?.data || resExercises.data || resExercises || [],
      );
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC XỬ LÝ FORM TẠO MỚI ---

  const handleOpenModal = () => {
    setForm({
      title: "",
      description: "",
      level: "beginner",
      price: 0,
      img_url: "",
      days: [],
    });
    setOpen(true);
  };

  const addDay = () => {
    const newDay = {
      phase_number: 1,
      week_number: 1,
      day_number: form.days.length + 1,
      title: `Ngày ${form.days.length + 1}, Tuần 1`,
      exercises: [],
    };
    setForm({ ...form, days: [...form.days, newDay] });
  };

  const addExerciseToDay = (dayIndex, exerciseId) => {
    if (!exerciseId) return;
    const updatedDays = [...form.days];
    // API yêu cầu object { exercise_id: "..." }
    updatedDays[dayIndex].exercises.push({ exercise_id: exerciseId });
    setForm({ ...form, days: updatedDays });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Vui lòng nhập tiêu đề khóa học");
    setIsSubmitting(true);
    try {
      const res = await createCourse(form);
      if (res) {
        alert("Tạo khóa học thành công!");
        setOpen(false);
        fetchData(); // Load lại danh sách
      }
    } catch (err) {
      alert("Lỗi khi tạo khóa học. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bộ lọc tìm kiếm
  const filtered = useMemo(() => {
    return courses.filter((c) =>
      (c.title || "").toLowerCase().includes(q.toLowerCase()),
    );
  }, [courses, q]);

  if (loading) return <div style={{ padding: 20 }}>Đang tải khóa học...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Course Management</h2>
          <div style={{ color: "var(--muted)" }}>
            Found {filtered.length} courses
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            placeholder="Tìm tên khóa học..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btnPrimary" onClick={handleOpenModal}>
            + Add New Course
          </button>
        </div>
      </div>

      {/* Bảng hiển thị */}
      <div className="board">
        <div className="boardBody" style={{ padding: 0 }}>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Image</th>
                  <th>Course Title</th>
                  <th>Level</th>
                  <th>Price</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <img
                        src={c.img_url || "https://placehold.co/60x40"}
                        alt={c.title}
                        style={{
                          width: 60,
                          height: 40,
                          borderRadius: 4,
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{c.title}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.description}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ textTransform: "capitalize" }}
                      >
                        {c.level}
                      </span>
                    </td>
                    <td>
                      <b style={{ color: "#d97706" }}>
                        {Number(c.price).toLocaleString()}đ
                      </b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn" style={{ marginRight: 6 }}>
                        Edit
                      </button>
                      <button className="btn" style={{ color: "red" }}>
                        Del
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TẠO MỚI (TỰ ĐỘNG HIỆN KHI BẤM + ADD NEW COURSE) */}
      {open && (
        <div
          className="modalOverlay"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            style={{
              background: "#fff",
              width: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Tạo khóa học mới</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>
                  TIÊU ĐỀ
                </label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>
                  GIÁ (VNĐ)
                </label>
                <input
                  className="input"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>
                  ĐỘ KHÓ
                </label>
                <select
                  className="input"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>
                  LINK ẢNH (IMG_URL)
                </label>
                <input
                  className="input"
                  value={form.img_url}
                  onChange={(e) =>
                    setForm({ ...form, img_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700 }}>MÔ TẢ</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* QUẢN LÝ LỊCH TẬP (DAYS) */}
            <div
              style={{
                border: "1px solid #eee",
                padding: "16px",
                borderRadius: "8px",
                background: "#fcfcfc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <b style={{ fontSize: "14px" }}>
                  Lịch trình tập luyện ({form.days.length} ngày)
                </b>
                <button className="btn" onClick={addDay}>
                  + Thêm ngày tập
                </button>
              </div>

              {form.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  style={{
                    marginBottom: "12px",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: "#fff",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>
                    {day.title}
                  </div>

                  {/* Dropdown chọn bài tập từ Exercise list */}
                  <select
                    className="input"
                    style={{
                      marginTop: "8px",
                      height: "32px",
                      fontSize: "12px",
                    }}
                    onChange={(e) => addExerciseToDay(dIdx, e.target.value)}
                    value=""
                  >
                    <option value="">-- Chọn bài tập để thêm --</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    {day.exercises.map((ex, eIdx) => (
                      <span
                        key={eIdx}
                        style={{
                          fontSize: "10px",
                          background: "#f0f0f0",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      >
                        ID: {ex.exercise_id.substring(0, 8)}...
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                className="btn"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btnPrimary"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo khóa học ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
