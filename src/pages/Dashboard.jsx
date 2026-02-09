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

// Import Service
import { getAllUsers } from "../services/userService";
import { getAllExercises } from "../services/exerciseService";

// Màu sắc cho biểu đồ
const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B"];

// Component hiển thị thẻ số liệu
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

// Component khung chứa
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

  // Load dữ liệu thật từ API
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const [resUsers, resExercises] = await Promise.all([
          getAllUsers(),
          getAllExercises(),
        ]);

        if (!ok) return;

        // Xử lý dữ liệu trả về an toàn
        const userData = Array.isArray(resUsers)
          ? resUsers
          : resUsers.data || [];
        const exData = Array.isArray(resExercises)
          ? resExercises
          : resExercises.data || [];

        setUsers(userData);
        setExercises(exData);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        // Fallback data ảo để không bị trắng trang nếu lỗi
        setExercises([{ title: "Demo", duration_seconds: 60 }]);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  // --- TÍNH TOÁN SỐ LIỆU ---

  // 1. Số liệu tổng quan
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalExercises = exercises.length;
    // Đếm số user đang active (dựa vào isActive)
    const activeUsers = users.filter((u) => u.isActive).length;

    return { totalUsers, totalExercises, activeUsers };
  }, [users, exercises]);

  // 2. BIỂU ĐỒ MỚI: Phân bố theo Thời lượng (Duration)
  // Vì API thiếu 'difficulty', ta dùng 'duration_seconds' để phân loại
  const durationData = useMemo(() => {
    let short = 0,
      medium = 0,
      long = 0;

    exercises.forEach((ex) => {
      const sec = ex.duration_seconds || 0;
      if (sec <= 60)
        short++; // Dưới 1 phút
      else if (sec <= 300)
        medium++; // 1 - 5 phút
      else long++; // Trên 5 phút
    });

    return [
      { name: "Ngắn (<1p)", value: short },
      { name: "Vừa (1-5p)", value: medium },
      { name: "Dài (>5p)", value: long },
    ].filter((item) => item.value > 0);
  }, [exercises]);

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
          <h2 style={{ margin: 0, fontWeight: 900 }}>Dashboard</h2>
          <div style={{ color: "var(--muted)" }}>
            {loading ? "Đang tải dữ liệu..." : "Tổng quan hệ thống"}
          </div>
        </div>
        <button
          className="btn btnPrimary"
          onClick={() => navigate("/exercises")}
        >
          + Thêm bài tập
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="statGrid">
        <Stat title="Thành viên" value={stats.totalUsers} sub="Tổng số users" />
        <Stat
          title="Thư viện bài tập"
          value={stats.totalExercises}
          sub="Tổng số bài tập"
        />
        <Stat
          title="Đang hoạt động"
          value={stats.activeUsers}
          sub="User Active"
          color="#10B981"
        />
      </div>

      {/* CHARTS & HIGHLIGHTS */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* LEFT: BIỂU ĐỒ TRÒN (Thời lượng) */}
        <Board
          title="Phân bố thời lượng"
          right={`Tổng: ${stats.totalExercises}`}
        >
          <div style={{ height: 300 }}>
            {durationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={durationData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={3}
                  >
                    {durationData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                Chưa có dữ liệu bài tập
              </div>
            )}
          </div>
        </Board>

        {/* RIGHT: HIGHLIGHTS */}
        <Board title="Thông tin nhanh" right="Hôm nay">
          <div style={{ display: "grid", gap: 10 }}>
            <div className="card" style={{ padding: 14 }}>
              <b style={{ display: "block" }}>Thành viên mới nhất</b>
              <div
                style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}
              >
                {users.length > 0 ? (
                  <>
                    Chào mừng{" "}
                    <b>
                      {users[users.length - 1].full_name ||
                        users[users.length - 1].name}
                    </b>{" "}
                    gia nhập.
                  </>
                ) : (
                  "Chưa có thành viên nào."
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <b style={{ display: "block" }}>Trạng thái dữ liệu</b>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 18,
                  color: "var(--muted)",
                }}
              >
                <li>Hệ thống đang ghi nhận {stats.totalExercises} bài tập.</li>
                <li>
                  Dữ liệu thời lượng được dùng để phân tích thay vì độ khó.
                </li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              <button className="btn" onClick={() => navigate("/users")}>
                Quản lý Users
              </button>
              <button
                className="btn btnPrimary"
                onClick={() => navigate("/exercises")}
              >
                Quản lý Bài tập
              </button>
            </div>
          </div>
        </Board>
      </div>
    </div>
  );
}
