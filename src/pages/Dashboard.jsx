import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// Import Services
import { getAllUsers } from "../services/userService";
import { getAllExercises } from "../services/exerciseService";
import { getAllCourses } from "../services/courseService"; // Đã thêm

// Màu sắc cho biểu đồ
const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

function Stat({ title, value, sub, color }) {
  return (
    <div className="statCard">
      <div className="statTitle">{title}</div>
      <div className="statValue" style={{ color: color || "inherit" }}>
        {value}
      </div>
      <div className="statSub">{sub}</div>
    </div>
  );
}

function Board({ title, right, children }) {
  return (
    <div className="board">
      <div className="boardHeader">
        <b>{title}</b>
        <span>{right}</span>
      </div>
      <div className="boardBody">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State lưu dữ liệu
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [courses, setCourses] = useState([]); // Đã thêm state mới

  // Load dữ liệu từ 3 nguồn API
  useEffect(() => {
    let ok = true;
    (async () => {
      // 1. Fetch Users
      try {
        const resUsers = await getAllUsers();
        if (ok) setUsers(resUsers.data?.data || resUsers.data || resUsers || []);
      } catch (err) {
        console.error("Lỗi tải Users:", err);
      }

      // 2. Fetch Exercises
      try {
        const resExercises = await getAllExercises();
        if (ok) setExercises(resExercises.data?.data || resExercises.data || resExercises || []);
      } catch (err) {
        console.error("Lỗi lấy bài tập:", err);
        if (err?.response?.status === 403) {
          try {
            const { default: api } = await import("../services/api");
            const fallbackRes = await api.get("/exercises/client");
            if (ok) setExercises(fallbackRes.data?.data || fallbackRes.data || fallbackRes || []);
          } catch (e) {}
        }
      }

      // 3. Fetch Courses
      try {
        const resCourses = await getAllCourses();
        if (ok) setCourses(Array.isArray(resCourses) ? resCourses : resCourses.data || []);
      } catch (err) {
        console.error("Lỗi tải Courses:", err);
      }

      if (ok) setLoading(false);
    })();
    return () => {
      ok = false;
    };
  }, []);

  // --- TÍNH TOÁN SỐ LIỆU ---
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalExercises: exercises.length,
      totalCourses: courses.length,
      // API User dùng is_active (boolean)
      activeUsers: users.filter((u) => u.is_active === true).length,
      // Tính tổng giá trị các khóa học
      totalCourseValue: courses.reduce(
        (sum, c) => sum + (Number(c.price) || 0),
        0,
      ),
    };
  }, [users, exercises, courses]);

  // Dữ liệu biểu đồ tròn: Phân bổ theo loại hình
  const chartData = useMemo(
    () =>
      [
        { name: "Users", value: stats.totalUsers },
        { name: "Exercises", value: stats.totalExercises },
        { name: "Courses", value: stats.totalCourses },
      ].filter((i) => i.value > 0),
    [stats],
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Hệ Thống EasyStretch</h2>
          <div style={{ color: "var(--muted)" }}>
            {loading
              ? "Đang đồng bộ dữ liệu..."
              : "Báo cáo tổng quan thời thực"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => navigate("/courses")}>
            Xem Khóa Học
          </button>
          <button
            className="btn btnPrimary"
            onClick={() => navigate("/exercises")}
          >
            + Thêm Bài Tập
          </button>
        </div>
      </div>

      {/* STAT CARDS - Đủ 4 thẻ số liệu */}
      <div
        className="statGrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat
          title="Thành viên"
          value={stats.totalUsers}
          sub={`${stats.activeUsers} đang hoạt động`}
          color="#3B82F6"
        />
        <Stat
          title="Bài tập"
          value={stats.totalExercises}
          sub="Trong thư viện"
          color="#10B981"
        />
        <Stat
          title="Khóa học"
          value={stats.totalCourses}
          sub="Đang kinh doanh"
          color="#8B5CF6"
        />
        <Stat
          title="Doanh thu dự tính"
          value={`${stats.totalCourseValue.toLocaleString()}đ`}
          sub="Giá trị khoá học"
          color="#F59E0B"
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* LEFT: BIỂU ĐỒ TỔNG QUAN */}
        <Board
          title="Tỉ lệ dữ liệu hệ thống"
          right={`Tổng: ${stats.totalUsers + stats.totalExercises + stats.totalCourses}`}
        >
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Board>

        {/* RIGHT: THÔNG TIN NHANH */}
        <Board title="Hoạt động mới" right="Live">
          <div style={{ display: "grid", gap: 10 }}>
            {/* User Highlight */}
            <div
              className="card"
              style={{ padding: 14, borderLeft: "4px solid #3B82F6" }}
            >
              <b>Thành viên mới nhất</b>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                {users.length > 0 ? (
                  <span>
                    Chào mừng <b>{users[users.length - 1].full_name}</b> vừa gia
                    nhập hệ thống.
                  </span>
                ) : (
                  "Chưa có data."
                )}
              </div>
            </div>

            {/* Course Highlight */}
            <div
              className="card"
              style={{ padding: 14, borderLeft: "4px solid #8B5CF6" }}
            >
              <b>Khóa học tiêu biểu</b>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                {courses.length > 0 ? (
                  <span>
                    Khóa học <b>"{courses[0].title}"</b> đang có giá{" "}
                    {Number(courses[0].price).toLocaleString()}đ.
                  </span>
                ) : (
                  "Chưa có khóa học."
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={() => navigate("/users")}
              >
                Quản lý Users
              </button>
              <button
                className="btn btnPrimary"
                style={{ flex: 1 }}
                onClick={() => navigate("/courses")}
              >
                Quản lý Courses
              </button>
            </div>
          </div>
        </Board>
      </div>
    </div>
  );
}
