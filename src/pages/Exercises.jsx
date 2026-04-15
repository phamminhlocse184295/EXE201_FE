import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";

import { getAllExercises, createExercise, updateExercise, deleteExercise } from "../services/exerciseService";



const darkInput = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,10,20,0.6)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };

const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,245,255,0.08)", fontWeight: 600, fontFamily: "monospace" };

const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(0,245,255,0.05)", fontSize: 13 };



// HÀM TỰ ĐỘNG CHUYỂN LINK DRIVE THƯỜNG THÀNH LINK DIRECT CHO MOBILE

const formatDriveLink = (url) => {

  if (!url || typeof url !== "string" || !url.includes("drive.google.com")) return url;

  const regex = /\/d\/([^/]+)\/(view|edit|download)?|id=([^&]+)/;

  const match = url.match(regex);

  const fileId = match ? (match[1] || match[3]) : null;

  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;

};



function DarkModal({ open, onClose, title, children }) {

  if (!open) return null;

  return (

    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }} onMouseDown={onClose}>

      <div style={{ width: "min(680px,95%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onMouseDown={e => e.stopPropagation()}>

        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>

          <b style={{ color: "#fff", fontSize: 15 }}>{title}</b>

          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>

        </div>

        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>

      </div>

    </div>

  );

}



function FG({ label, children }) {

  return <div style={{ display: "grid", gap: 6 }}><label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>{children}</div>;

}



export default function Exercises() {

  const [loading, setLoading] = useState(true);

  const [exercises, setExercises] = useState([]);

  const [q, setQ] = useState("");

  const [filterTime, setFilterTime] = useState("all");

  const [sortBy, setSortBy] = useState("default");

  

  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [uploading, setUploading] = useState(false); 

  

  const [form, setForm] = useState({ 

    title: "", 

    description: "", 

    duration: 60, 

    type: "relaxation",    

    target_muscle: "", 

    video_url: [], 

    img_list: [],

    target_value: 0,

    rest_after: 0,

    loop_type: "reps",

    time_line: []

  });



  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;



  const filteredAndSorted = useMemo(() => {

    let result = exercises.filter(ex => {

      const s = q.trim().toLowerCase();

      if (!s) return true;

      return (ex.title || "").toLowerCase().includes(s) || (ex.description || "").toLowerCase().includes(s);

    });

    if (filterTime === "short") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) < 60);

    else if (filterTime === "medium") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) >= 60 && (ex.duration || ex.duration_seconds || 0) <= 120);

    else if (filterTime === "long") result = result.filter(ex => (ex.duration || ex.duration_seconds || 0) > 120);

    if (sortBy === "time_asc") result.sort((a, b) => (a.duration || a.duration_seconds || 0) - (b.duration || b.duration_seconds || 0));

    else if (sortBy === "time_desc") result.sort((a, b) => (b.duration || b.duration_seconds || 0) - (a.duration || a.duration_seconds || 0));

    return result;

  }, [exercises, q, filterTime, sortBy]);



  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const paginatedData = useMemo(() => {

    const start = (currentPage - 1) * itemsPerPage;

    return filteredAndSorted.slice(start, start + itemsPerPage);

  }, [filteredAndSorted, currentPage]);



  useEffect(() => { setCurrentPage(1); }, [q, filterTime, sortBy]);



  async function fetchExercises() {

    setLoading(true);

    try {

      const res = await getAllExercises();

      setExercises(Array.isArray(res) ? res : res.data?.data || res.data || []);

    } catch (err) {

      setExercises([]);

    } finally { setLoading(false); }

  }

  

  useEffect(() => { fetchExercises(); }, []);



  // HÀM UPLOAD (CHO ẢNH GIÃN CƠ LÊN CLOUDINARY)

  const handleFileUpload = async (e, targetField) => {

    const files = e.target.files;

    if (!files || files.length === 0) return;



    setUploading(true);

    const uploadedUrls = [];



    for (let i = 0; i < files.length; i++) {

      const formData = new FormData();

      formData.append("file", files[i]);

      formData.append("upload_preset", "testupload"); 



      try {

        const endpoint = `https://api.cloudinary.com/v1_1/dojrw6kyq/${targetField}/upload`;

        const response = await axios.post(endpoint, formData);

        

        if (response.data && response.data.secure_url) {

          uploadedUrls.push(response.data.secure_url);

        }

      } catch (error) {

        console.error("Lỗi upload Cloudinary:", error);

        alert(`❌ Lỗi upload: Request bị chặn. Bạn hãy kiểm tra lại kết nối mạng.`);

      }

    }



    if (targetField === "video") {

      setForm({ ...form, video_url: uploadedUrls });

    } else {

      setForm({ ...form, img_list: [...form.img_list, ...uploadedUrls] });

    }

    

    e.target.value = null; 

    setUploading(false);

  };



  const openCreate = () => { 

    setEditing(null); 

    setForm({ 

      title: "", description: "", duration: 60, type: "relaxation", 

      target_muscle: "", video_url: [], img_list: [], target_value: 0, rest_after: 0, loop_type: "reps", time_line: [] 

    }); 

    setOpen(true); 

  };



  const openEdit = ex => {

    setEditing(ex);

    setForm({ 

      title: ex.title || "", 

      description: ex.description || "", 

      duration: ex.duration || ex.duration_seconds || 0, 

      type: ex.type || "relaxation",

      target_muscle: Array.isArray(ex.target_muscle) ? ex.target_muscle.join(", ") : ex.target_muscle || "", 

      video_url: Array.isArray(ex.video_url) ? ex.video_url : (ex.video_url ? [ex.video_url] : []), 

      img_list: Array.isArray(ex.img_list) ? ex.img_list : (ex.img_list ? [ex.img_list] : []),

      target_value: ex.target_value || 0,

      rest_after: ex.rest_after || 0,

      loop_type: ex.loop_type || "reps",

      time_line: Array.isArray(ex.time_line) ? ex.time_line : []

    });

    setOpen(true);

  };



  const save = async () => {

    if (!form.title.trim()) return alert("Tên bài tập là bắt buộc");

    

    let parsedMuscle = [];

    if (typeof form.target_muscle === 'string') {

      parsedMuscle = form.target_muscle.split(",").map(s => s.trim()).filter(Boolean);

    } else if (Array.isArray(form.target_muscle)) {

      parsedMuscle = form.target_muscle;

    }



    let payload = { 

      title: form.title.trim(), 

      description: form.description || "", 

      duration: Number(form.duration) || 0, 

      type: form.type,

      target_muscle: parsedMuscle,

    };



    if (form.type === "recover") {

      let finalVideoUrl = [];

      if (form.video_url && form.video_url.length > 0 && form.video_url[0].trim() !== "") {

         finalVideoUrl = [formatDriveLink(form.video_url[0])];

      }



      payload = {

        ...payload, 

        video_url: finalVideoUrl, 

        img_list: [], 

        time_line: [], 

        rest_after: 0, 

        target_value: 0, 

        loop_type: "reps"

      };

    } else {

      payload = {

        ...payload, 

        video_url: [], 

        img_list: form.img_list, 

        time_line: form.time_line || [], 

        rest_after: Number(form.rest_after) || 0, 

        target_value: Number(form.target_value) || 0, 

        loop_type: form.loop_type || "reps"

      };

    }



    try {

      if (editing) { 

        const id = editing.id || editing._id || editing.exercise_id; 

        if (!id) return alert("Lỗi: Không tìm thấy ID!"); 

        await updateExercise(id, payload); 

        alert("Cập nhật thành công!"); 

      }

      else { 

        await createExercise(payload); 

        alert("Thêm bài tập thành công!"); 

      }

      setOpen(false); 

      fetchExercises();

    } catch (err) { 

      console.error("Backend Error:", err.response?.data);

      alert(`Lỗi Backend: ${err.response?.data?.message || err.message}`); 

    }

  };



  const remove = async ex => {

    if (!window.confirm(`Xóa bài tập "${ex.title}"?`)) return;

    const id = ex.id || ex._id || ex.exercise_id;

    if (!id) return alert("Lỗi: Không tìm thấy ID!");

    try { await deleteExercise(id); alert("Xóa thành công!"); fetchExercises(); } catch { alert("Không thể xóa bài tập này."); }

  };



  return (

    <div style={{ display: "grid", gap: 18 }}>

      {/* Header & Controls */}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

        <div>

          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>🏃 Exercise Library</h2>

          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>

            {filteredAndSorted.length !== exercises.length ? `Đang lọc: ${filteredAndSorted.length} bài tập` : `Tổng số: ${exercises.length} bài tập`}

          </div>

        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>

          <select style={{ ...darkInput, width: 160 }} value={filterTime} onChange={e => setFilterTime(e.target.value)}>

            <option value="all">⏳ Mọi thời lượng</option>

            <option value="short">Dưới 60 giây</option>

            <option value="medium">60 - 120 giây</option>

            <option value="long">Trên 120 giây</option>

          </select>

          <select style={{ ...darkInput, width: 190 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>

            <option value="default">↕️ Sắp xếp mặc định</option>

            <option value="time_asc">Thời gian: Ngắn → Dài</option>

            <option value="time_desc">Thời gian: Dài → Ngắn</option>

          </select>

          <div style={{ position: "relative" }}>

            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>

            <input style={{ ...darkInput, paddingLeft: 36, width: 220 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên bài tập..." />

          </div>

          <button onClick={openCreate} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>+ New Exercise</button>

        </div>

      </div>



      {/* Table Danh Sách */}

      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {loading ? <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)", minHeight: 400 }}>⏳ Đang tải...</div> : (

          <>

            <div style={{ overflowX: "auto", flex: 1, minHeight: 550 }}>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>

                <thead>

                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>

                    <th style={thStyle}>Exercise Info</th>

                    <th style={thStyle}>Description</th>

                    <th style={thStyle}>Duration</th>

                    <th style={thStyle}>Type</th>

                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedData.map((ex, i) => {

                    const id = ex.id || ex._id || ex.exercise_id;

                    const mainType = ex.type || "relaxation";

                    const muscles = Array.isArray(ex.target_muscle) ? ex.target_muscle : [];

                    const vids = Array.isArray(ex.video_url) ? ex.video_url : (ex.video_url ? [ex.video_url] : []);

                    return (

                      <tr key={id || i} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                        <td style={tdStyle}>

                          <div style={{ fontWeight: 700, color: "#fff" }}>{ex.title}</div>

                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>ID: {String(id).substring(0, 8)}...</div>

                          {muscles.length > 0 && (

                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>

                              {muscles.map((m, idx) => <span key={idx} style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{m}</span>)}

                            </div>

                          )}

                          {vids.length > 0 && (

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>

                              {vids.map((v, idx) => <a key={idx} href={v} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#60a5fa" }}>Video {idx + 1} ↗</a>)}

                            </div>

                          )}

                        </td>

                        <td style={{ ...tdStyle, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.5)" }}>{ex.description || "---"}</td>

                        <td style={tdStyle}><span style={{ color: "#f59e0b", fontWeight: 700 }}>{ex.duration || ex.duration_seconds || 0}s</span></td>

                        <td style={tdStyle}>

                          <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-start" }}>

                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{mainType === "recover" ? "Phục hồi (Drive)" : "Giãn cơ (Ảnh)"}</span>

                          </div>

                        </td>

                        <td style={{ ...tdStyle, textAlign: "right" }}>

                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>

                            <button onClick={() => openEdit(ex)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>

                            <button onClick={() => remove(ex)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Del</button>

                          </div>

                        </td>

                      </tr>

                    );

                  })}

                  {filteredAndSorted.length === 0 && (

                    <tr>

                      <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>

                        Chưa có bài tập nào. Hãy bấm "+ New Exercise" để tạo nhé!

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>



            {/* ĐÃ FIX: THÊM LẠI THANH PHÂN TRANG (PAGINATION) Ở DƯỚI BẢNG */}

            {filteredAndSorted.length > 0 && (

              <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>

                  Hiển thị {paginatedData.length} / {filteredAndSorted.length} bài tập

                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: currentPage === 1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)", color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>← Trước</button>

                  <div style={{ display: "flex", gap: 4 }}>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (

                      <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: currentPage === page ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, minWidth: 36 }}>{page}</button>

                    ))}

                  </div>

                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: currentPage === totalPages ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)", color: currentPage === totalPages ? "rgba(255,255,255,0.3)" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>Tiếp →</button>

                </div>

              </div>

            )}

          </>

        )}

      </div>



      {/* MODAL THÊM / SỬA MỚI */}

      <DarkModal open={open} onClose={() => setOpen(false)} title={editing ? "✏️ Edit Exercise" : "➕ Create New Exercise"}>

        <div style={{ display: "grid", gap: 16 }}>

          

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>

            <FG label="Tên bài tập">

              <input style={darkInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Bài tập cơ cổ" />

            </FG>

            <FG label="Loại Bài (Type)">

              <select style={darkInput} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>

                <option value="relaxation">Giãn cơ (Relaxation)</option>

                <option value="recover">Phục hồi (Recover)</option>

              </select>

            </FG>

          </div>



          <FG label="Mô tả chi tiết">

            <textarea style={{ ...darkInput, minHeight: 70, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Nhập mô tả..." />

          </FG>

          

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <FG label="Nhóm cơ (cách nhau dấu phẩy)">

              <input style={darkInput} value={typeof form.target_muscle === 'string' ? form.target_muscle : form.target_muscle.join(', ')} onChange={e => setForm({ ...form, target_muscle: e.target.value })} placeholder="VD: cổ, vai" />

            </FG>

            <FG label="Thời lượng (giây)">

              <input type="number" style={darkInput} value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />

            </FG>

          </div>



          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />



          {/* VÙNG UI: PHỤC HỒI (DÁN LINK DRIVE) */}

          {form.type === "recover" && (

            <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: 16, borderRadius: 12 }}>

              <FG label="🔗 Link Google Drive (Bắt buộc phải set 'Anyone with the link')">

                <input 

                  style={{ ...darkInput, background: "rgba(0,0,0,0.5)" }} 

                  value={form.video_url[0] || ""} 

                  onChange={e => setForm({ ...form, video_url: [e.target.value] })} 

                  placeholder="Dán link Drive vào đây (VD: https://drive.google.com/file/d/...)" 

                />

              </FG>

              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>

                💡 Hệ thống sẽ tự động bóc tách ID và chuyển thành Direct Link để App Mobile có thể phát được.

              </div>

              {form.video_url[0] && (

                <div style={{ color: "#34d399", fontSize: 12, marginTop: 12, padding: "8px 12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: 8, wordBreak: "break-all" }}>

                  ✅ Đã nhận link (Sẽ tự động format khi nhấn Lưu)

                </div>

              )}

            </div>

          )}



          {/* UI UPLOAD: GIÃN CƠ (NHIỀU ẢNH LÊN CLOUDINARY) */}

          {form.type === "relaxation" && (

            <div style={{ display: "grid", gap: 16 }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

                <FG label="Target Value"><input type="number" style={darkInput} value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} /></FG>

                <FG label="Rest After"><input type="number" style={darkInput} value={form.rest_after} onChange={e => setForm({ ...form, rest_after: e.target.value })} /></FG>

                <FG label="Loop Type">

                  <select style={darkInput} value={form.loop_type} onChange={e => setForm({ ...form, loop_type: e.target.value })}>

                    <option value="reps">Reps</option>

                    <option value="duration">Duration</option>

                  </select>

                </FG>

              </div>



              {/* Thẻ input bị ẩn */}

              <input id="image-upload" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFileUpload(e, "image")} />

              

              {/* Thẻ label biến thành khung bấm bự */}

              <label htmlFor="image-upload" style={{ cursor: "pointer", display: "block", background: "rgba(16, 185, 129, 0.05)", border: "2px dashed rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: 24, textAlign: "center", transition: "all 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.8)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)"}>

                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>

                <div style={{ color: "#34d399", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>

                  {uploading ? "⏳ Đang tải ảnh lên..." : "Bấm vào đây để tải Ảnh (Cho phép chọn nhiều file)"}

                </div>

                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Hỗ trợ: JPG, PNG, WEBP</div>

              </label>



              {/* Danh sách ảnh nhỏ gọn */}

              {form.img_list.length > 0 && (

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>

                  {form.img_list.map((img, idx) => (

                    <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>

                      <img src={img} alt="step" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, textAlign: "center", padding: "2px 0", fontWeight: "bold" }}>#{idx}</div>

                      <button onClick={(e) => {

                        e.preventDefault(); 

                        const newList = [...form.img_list];

                        newList.splice(idx, 1);

                        // Update time_line nếu xóa ảnh - xóa các step dùng ảnh này và adjust index

                        const newTimeLine = (form.time_line || []).filter(t => t.imageIndex !== idx).map(t =>({

                          ...t,

                          imageIndex: t.imageIndex > idx ? t.imageIndex - 1 : t.imageIndex

                        }));

                        setForm({...form, img_list: newList, time_line: newTimeLine});

                      }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(239, 68, 68, 0.9)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, width: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                    </div>

                  ))}

                </div>

              )}

              {/* TIMELINE EDITOR - Kịch bản chiếu ảnh */}

              <div style={{ background: "rgba(16, 185, 129, 0.05)", borderRadius: 12, padding: 16, border: "1px solid rgba(16, 185, 129, 0.2)" }}>

                <div style={{ fontWeight: 700, color: "#34d399", marginBottom: 12, fontSize: 14 }}>🎬 Kịch bản chiếu ảnh (TimeLine)</div>

                {(form.time_line || []).map((step, idx) => (

                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8 }}>

                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, minWidth: 50 }}>Step {idx + 1}</span>

                    <select

                      style={{ ...darkInput, flex: 1 }}

                      value={step.imageIndex}

                      onChange={e => {

                        const newTimeLine = [...form.time_line];

                        newTimeLine[idx].imageIndex = Number(e.target.value);

                        setForm({ ...form, time_line: newTimeLine });

                      }}

                    >

                      {form.img_list.map((_, imgIdx) => (

                        <option key={imgIdx} value={imgIdx}>Ảnh #{imgIdx} ({imgIdx + 1})</option>

                      ))}

                    </select>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

                      <input

                        type="number"

                        style={{ ...darkInput, width: 80 }}

                        value={step.duration}

                        onChange={e => {

                          const newTimeLine = [...form.time_line];

                          newTimeLine[idx].duration = Number(e.target.value);

                          setForm({ ...form, time_line: newTimeLine });

                        }}

                        placeholder="ms"

                      />

                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>ms</span>

                    </div>

                    <button

                      onClick={() => {

                        const newTimeLine = [...form.time_line];

                        newTimeLine.splice(idx, 1);

                        setForm({ ...form, time_line: newTimeLine });

                      }}

                      style={{ background: "rgba(239,68,68,0.2)", border: "none", color: "#f87171", cursor: "pointer", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}

                    >

                      ✕

                    </button>

                  </div>

                ))}

                <button

                  onClick={() => {

                    const newStep = {

                      imageIndex: 0,

                      duration: 10000

                    };

                    setForm({ ...form, time_line: [...(form.time_line || []), newStep] });

                  }}

                  disabled={form.img_list.length === 0}

                  style={{

                    width: "100%",

                    padding: "10px",

                    borderRadius: 8,

                    border: "1px dashed rgba(16, 185, 129, 0.4)",

                    background: "rgba(16, 185, 129, 0.1)",

                    color: form.img_list.length === 0 ? "rgba(255,255,255,0.3)" : "#34d399",

                    cursor: form.img_list.length === 0 ? "not-allowed" : "pointer",

                    fontSize: 13,

                    fontWeight: 600

                  }}

                >

                  + Thêm bước chiếu (Cần có ảnh trước)

                </button>

              </div>

            </div>

          )}



          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>

            <button onClick={() => setOpen(false)} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy bỏ</button>

            <button onClick={save} disabled={uploading} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: uploading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#10b981,#059669)", color: uploading ? "#aaa" : "#fff", fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", boxShadow: uploading ? "none" : "0 4px 16px rgba(16,185,129,0.3)" }}>

              {uploading ? "Đang xử lý file..." : "Lưu thay đổi"}

            </button>

          </div>

        </div>

      </DarkModal>

    </div>

  );

}