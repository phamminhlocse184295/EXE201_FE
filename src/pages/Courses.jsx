import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCourses,
  deleteCourse,
  createCourse,
} from "../services/courseService";
import { getAllExercises } from "../services/exerciseService";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    price: 0,
    img_url: "",
    days: [],
  });

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Courses độc lập
    try {
      const resCourses = await getAllCourses();
      setCourses(Array.isArray(resCourses) ? resCourses : resCourses.data || []);
    } catch (err) {
      console.error("Lỗi tải Courses:", err);
    }

    // 2. Fetch Exercises độc lập
    try {
      const resExercises = await getAllExercises();
      setExercises(resExercises.data?.data || resExercises.data || resExercises || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách bài tập (Role Admin/Manager):", err);
      if (err?.response?.status === 403) {
        // Fallback: Nếu 403 thì gọi API danh sách bài tập của User
        try {
          const { default: api } = await import("../services/api");
          const fallbackRes = await api.get("/exercises/client");
          setExercises(fallbackRes.data?.data || fallbackRes.data || fallbackRes || []);
        } catch (fallbackErr) {}
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // ĐÃ SỬA: Tự động tính toán Tuần (Cứ 7 ngày nhảy 1 tuần)
  const addDay = () => {
    const totalDays = form.days.length + 1;
    // Dùng Math.ceil để làm tròn lên: 1/7 -> Tuần 1, 8/7 -> Tuần 2
    const calculatedWeek = Math.ceil(totalDays / 7);

    const newDay = {
      phase_number: 1,
      week_number: calculatedWeek,
      day_number: totalDays,
      title: `Ngày ${totalDays} (Tuần ${calculatedWeek})`,
      exercises: [],
    };
    setForm({ ...form, days: [...form.days, newDay] });
  };

  const addExerciseToDay = (dayIndex) => {
    const updatedDays = [...form.days];
    updatedDays[dayIndex].exercises.push({ title: "", video_url: "" });
    setForm({ ...form, days: updatedDays });
  };

  const updateExerciseDetail = (dayIndex, exIndex, field, value) => {
    const updatedDays = [...form.days];
    updatedDays[dayIndex].exercises[exIndex][field] = value;
    setForm({ ...form, days: updatedDays });
  };

  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const updatedDays = [...form.days];
    updatedDays[dayIndex].exercises.splice(exIndex, 1);
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
        fetchData();
      }
    } catch (err) {
      alert("Lỗi khi tạo khóa học. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        src={
                          c.img_url ||
                          c.image_url ||
                          c.image ||
                          "https://placehold.co/60x40?text=No+Img"
                        }
                        alt={c.title || "Course Image"}
                        style={{
                          width: 60,
                          height: 40,
                          borderRadius: 4,
                          objectFit: "cover",
                          background: "#f1f5f9",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/60x40?text=Error";
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
                        {Number(c.price || 0).toLocaleString()}đ
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
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "#999",
                      }}
                    >
                      Không tìm thấy khóa học nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TẠO MỚI */}
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

            {/* QUẢN LÝ LỊCH TẬP (DAYS) - NHẬP THỦ CÔNG */}
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
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: 8,
                      color: "#2563eb",
                    }}
                  >
                    {day.title}
                  </div>

                  {/* DANH SÁCH BÀI TẬP BÊN TRONG TỪNG NGÀY */}
                  {day.exercises.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      style={{
                        display: "grid",
                        gap: 8,
                        background: "#f8fafc",
                        padding: 12,
                        marginTop: 8,
                        borderRadius: 6,
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <b style={{ fontSize: 12, color: "#475569" }}>
                          Bài {eIdx + 1}
                        </b>
                        <button
                          onClick={() => removeExerciseFromDay(dIdx, eIdx)}
                          style={{
                            color: "#ef4444",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                        >
                          ✕ Xóa
                        </button>
                      </div>
                      <input
                        className="input"
                        placeholder="Tên bài tập..."
                        value={ex.title}
                        onChange={(e) =>
                          updateExerciseDetail(
                            dIdx,
                            eIdx,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="input"
                        placeholder="Link video (Youtube, Google Drive...)"
                        value={ex.video_url}
                        onChange={(e) =>
                          updateExerciseDetail(
                            dIdx,
                            eIdx,
                            "video_url",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}

                  <button
                    className="btn"
                    style={{
                      marginTop: 12,
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px dashed #bfdbfe",
                      width: "100%",
                    }}
                    onClick={() => addExerciseToDay(dIdx)}
                  >
                    + Ghi thêm bài tập thủ công
                  </button>
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
