import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = ["#FF6A00", "#FFB000", "#7C3AED", "#10B981", "#EF4444"];

function Stat({ title, value, sub }) {
  return (
    <div className="statCard">
      <div className="statTitle">{title}</div>
      <div className="statValue">{value}</div>
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, tasks: 0, pending: 0 });
  const [taskStatus, setTaskStatus] = useState([
    { name: "Todo", value: 12 },
    { name: "In Progress", value: 20 },
    { name: "Review", value: 9 },
    { name: "Done", value: 7 },
  ]);

  useEffect(() => {
    let ok = true;

    (async () => {
      try {
        const [s, p] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/task-status"),
        ]);
        if (!ok) return;

        setStats(s.data);
        if (Array.isArray(p.data) && p.data.length) setTaskStatus(p.data);
      } catch {
        if (!ok) return;
        setStats({ users: 12, tasks: 48, pending: 7 });
      } finally {
        if (ok) setLoading(false);
      }
    })();

    return () => {
      ok = false;
    };
  }, []);

  const total = useMemo(
    () => taskStatus.reduce((sum, x) => sum + (Number(x.value) || 0), 0),
    [taskStatus],
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
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
            {loading ? "Loading..." : "Overview"}
          </div>
        </div>

        <button
          className="btn btnPrimary"
          onClick={() => alert("Hook action: create task / open modal")}
        >
          + Quick Action
        </button>
      </div>

      <div className="statGrid">
        <Stat title="Users" value={stats.users} sub="Total users" />
        <Stat title="Tasks" value={stats.tasks} sub="All tasks" />
        <Stat title="Pending" value={stats.pending} sub="Need action" />
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          alignItems: "start",
        }}
      >
        <Board title="Task Status" right={`Total: ${total}`}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={3}
                >
                  {taskStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Board>

        <Board title="Highlights" right="Today">
          <div style={{ display: "grid", gap: 10 }}>
            <div className="card" style={{ padding: 14 }}>
              <b style={{ display: "block" }}>Quality check</b>
              <div
                style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}
              >
                Review queue đang có {stats.pending} tasks cần xử lý.
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <b style={{ display: "block" }}>Next steps</b>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 18,
                  color: "var(--muted)",
                }}
              >
                <li>Thêm chart: Users theo role</li>
                <li>Thêm bảng recent activities</li>
                <li>Nối API thật `/admin/task-status`</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => alert("Go Users")}>
                Manage Users
              </button>
              <button
                className="btn btnPrimary"
                onClick={() => alert("Open Reports")}
              >
                View Reports
              </button>
            </div>
          </div>
        </Board>
      </div>
    </div>
  );
}
