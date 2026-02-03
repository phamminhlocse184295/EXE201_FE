import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function RoleBadge({ role }) {
  const map = {
    Admin: {
      bg: "rgba(255,106,0,.12)",
      bd: "rgba(255,106,0,.28)",
      tx: "#C2410C",
    },
    Manager: {
      bg: "rgba(124,58,237,.12)",
      bd: "rgba(124,58,237,.28)",
      tx: "#5B21B6",
    },
    Annotator: {
      bg: "rgba(16,185,129,.12)",
      bd: "rgba(16,185,129,.28)",
      tx: "#065F46",
    },
    Reviewer: {
      bg: "rgba(59,130,246,.12)",
      bd: "rgba(59,130,246,.28)",
      tx: "#1D4ED8",
    },
  };
  const s = map[role] || {
    bg: "rgba(152,162,179,.16)",
    bd: "rgba(152,162,179,.30)",
    tx: "#344054",
  };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 700,
      }}
    >
      {role}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <b style={{ fontSize: 14 }}>{title}</b>
          <button
            className="btn"
            onClick={onClose}
            style={{ padding: "8px 10px" }}
          >
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Annotator" });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s),
    );
  }, [users, q]);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Backend thật: GET /users -> [{id,name,email,role}]
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      // fallback demo
      setUsers([
        { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "Admin" },
        { id: 2, name: "Trần Thị B", email: "b@example.com", role: "Manager" },
        { id: 3, name: "Lê Văn C", email: "c@example.com", role: "Annotator" },
        { id: 4, name: "Phạm Thị D", email: "d@example.com", role: "Reviewer" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "Annotator" });
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "Annotator",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = { ...form };
    if (!payload.name.trim() || !payload.email.trim()) {
      alert("Name và Email không được trống");
      return;
    }

    try {
      if (editing) {
        // PUT /users/:id
        await api.put(`/users/${editing.id}`, payload);
      } else {
        // POST /users
        await api.post("/users", payload);
      }
      setOpen(false);
      fetchUsers();
    } catch {
      // fallback demo: update local state
      if (editing) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editing.id ? { ...u, ...payload } : u)),
        );
      } else {
        setUsers((prev) => [{ id: Date.now(), ...payload }, ...prev]);
      }
      setOpen(false);
    }
  };

  const remove = async (u) => {
    if (!confirm(`Xoá user "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      fetchUsers();
    } catch {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
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
          <h2 style={{ margin: 0, fontWeight: 900 }}>Users</h2>
          <div style={{ color: "var(--muted)" }}>
            {loading ? "Loading..." : `${users.length} total users`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / role..."
            style={{ width: 280 }}
          />

          <button className="btn btnPrimary" onClick={openCreate}>
            + New User
          </button>
        </div>
      </div>

      {/* Board wrapper */}
      <div className="board">
        <div className="boardHeader">
          <b>User List</b>
          <span>{filtered.length} shown</span>
        </div>

        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: "28%" }}>Name</th>
                  <th style={{ width: "34%" }}>Email</th>
                  <th style={{ width: "18%" }}>Role</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        ID: {u.id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        Active
                      </div>
                    </td>

                    <td>
                      <RoleBadge role={u.role} />
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn"
                        onClick={() => openEdit(u)}
                        style={{ marginRight: 8 }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn"
                        onClick={() => remove(u)}
                        style={{
                          borderColor: "rgba(239,68,68,.28)",
                          background: "rgba(239,68,68,.08)",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: 16, color: "var(--muted)" }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        title={editing ? "Edit User" : "Create User"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter name..."
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Email</div>
            <input
              className="input"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="Enter email..."
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Role</div>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Annotator</option>
              <option>Reviewer</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 6,
            }}
          >
            <button className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btnPrimary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
