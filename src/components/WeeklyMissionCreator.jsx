import React, { useState } from "react";
import { createMission, addExerciseToMission } from "../services/missionService";
import { getAllExercises } from "../services/exerciseService";

const WeeklyMissionCreator = ({ onRefresh }) => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createWeeklyMissions = async () => {
    setIsLoading(true);
    setStatus("🚀 Đang tạo missions cho tuần...");
    
    try {
      // 1. Lấy tất cả exercises
      const allExercisesRes = await getAllExercises();
      const allExercises = allExercisesRes.data?.data || allExercisesRes.data || [];
      
      if (allExercises.length === 0) {
        setStatus("❌ Không có bài tập nào trong hệ thống!");
        setIsLoading(false);
        return;
      }
      
      console.log(`🏋️ Found ${allExercises.length} exercises in system`);
      
      // 2. Tạo 7 missions từ ngày hôm nay trở đi
      const today = new Date();
      
      const missionTemplates = [
        { 
          title: "Thứ 2: Khởi động cơ bản", 
          description: "Khởi động nhẹ nhàng đánh thức cơ thể, sẵn sàng năng lượng cho tuần mới.", 
          level: "beginner", 
          stations: [
            ["vươn vai", "giường", "ngửa", "khởi động"], 
            ["nhón gót", "chân", "đứng"],
            ["cổ tay", "xoay vai", "nhún"],
            ["nghiêng lườn", "căng ngực", "cửa"],
            ["vươn tay", "tay sau", "kéo"],
            ["vặn cột sống", "vặn", "ngủ"]
          ] 
        },
        { 
          title: "Thứ 3: Tập trung cổ - vai", 
          description: "Giải phóng áp lực vùng cổ vai sau những giờ 'cày' deadline.", 
          level: "intermediate", 
          stations: [
            ["mở sách", "nghiêng", "vai"], 
            ["cơ cổ", "gập cằm", "cổ"],
            ["căng vai", "sau gáy", "ngực"],
            ["đẩy ngực", "sau lưng", "nâng tay"],
            ["xoay vai", "nhún vai", "tay sau"],
            ["luồn kim", "giường", "ngủ"]
          ] 
        },
        { 
          title: "Thứ 4: Giải cứu lưng - hông", 
          description: "Bảo trì cột sống và thắt lưng, chống 'thoát vị' cho dân văn phòng.", 
          level: "intermediate", 
          stations: [
            ["mèo bò", "mèo", "bò", "lưng"], 
            ["lắc hông", "nhón gót", "tròn"],
            ["vặn mình", "ghế", "xoay"],
            ["ngả lưng", "chống tay", "đứng"],
            ["số 4", "vắt chéo", "mông", "hông"],
            ["em bé", "child", "quỳ"]
          ] 
        },
        { 
          title: "Thứ 5: Giãn cơ chân & Máu oxy", 
          description: "Giảm tê bì chân và giúp máu lưu thông về tim tốt hơn.", 
          level: "beginner", 
          stations: [
            ["xoay khớp háng", "gối", "háng"], 
            ["nhón gót", "chân", "đứng"],
            ["duỗi chân", "gập mũi chân", "đùi sau"],
            ["đùi trước", "gót", "cổ chân"],
            ["bắp chân", "ép tường", "tường"],
            ["gác chân", "số 4", "ngửa", "tường"]
          ] 
        },
        { 
          title: "Thứ 6: Xả stress toàn thân", 
          description: "Reset lại hệ thống thần kinh và cơ bắp để đón cuối tuần rực rỡ.", 
          level: "beginner", 
          stations: [
            ["vươn vai", "hít sâu", "lăn lưng"], 
            ["cổ", "hướng", "đầu"],
            ["hít thở", "thở", "hộp"],
            ["lắc hông", "rũ tay", "thả lỏng"],
            ["ragdoll", "gập người", "tay"],
            ["savasana", "thả lỏng", "ngủ"]
          ] 
        },
        { 
          title: "Thứ 7: Ngày linh hoạt & dọn dẹp", 
          description: "Khởi động và làm nóng các khớp cho một ngày cuối tuần năng động.", 
          level: "intermediate", 
          stations: [
            ["vươn vai", "vặn", "lưng"], 
            ["xoay khớp", "cổ", "gối"],
            ["mèo bò", "em bé", "lưng"],
            ["bươm bướm", "butterfly", "số 4"],
            ["đùi", "căng trước", "chân"],
            ["gác chân", "số 4", "ngủ"]
          ] 
        },
        { 
          title: "Chủ nhật: Ngày phục hồi sâu", 
          description: "Phục hồi toàn bộ cơ thể, sẵn sàng cho tuần mới.", 
          level: "beginner", 
          stations: [
            ["vươn vai", "hít thở", "sâu"], 
            ["nghiêng lườn", "ngực", "tay"],
            ["hít thở", "cổ", "hướng"],
            ["cổ tay", "bả vai", "xoay"],
            ["gập người", "duỗi chân", "vặn"],
            ["tường", "savasana", "thả lỏng"]
          ] 
        }
      ];
      
      let successCount = 0;
      
      // 3. Tạo từng mission
      for (let i = 0; i < 7; i++) {
        const template = missionTemplates[i];
        
        // Tính ngày target: hôm nay + i ngày
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const targetDateStr = targetDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        console.log(`🎯 Tạo mission ${i + 1}: ${template.title} cho ngày ${targetDateStr}`);
        
        try {
          // Lấy tối đa 6 exercises phù hợp (tương ứng 6 trạm)
          let assignedExercises = [];
          
          for (const stationKeywords of template.stations) {
            let found = null;
            
            // Thử tìm bài tập theo từ khóa của trạm này
            for (const kw of stationKeywords) {
              found = allExercises.find(ex => 
                !assignedExercises.some(a => a.exercise_id === (ex.id || ex._id)) &&
                ((ex.title && ex.title.toLowerCase().includes(kw.toLowerCase())) ||
                 (ex.description && ex.description.toLowerCase().includes(kw.toLowerCase())))
              );
              if (found) break;
            }
            
            // Nếu không tìm thấy, lấy 1 bài chưa được gán bất kỳ
            if (!found) {
              found = allExercises.find(ex => !assignedExercises.some(a => a.exercise_id === (ex.id || ex._id)));
            }
            
            // Nếu tìm thấy thì thêm vào assignedExercises
            if (found) {
              assignedExercises.push({
                exercise_id: found.id || found._id,
                point: 10
              });
            }
          }
          
          console.log(`🏋️ Selected ${assignedExercises.length} exercises for ${template.title}:`, assignedExercises);
          
          // Tạo mission
          const missionRes = await createMission({
            title: template.title,
            description: template.description,
            level: template.level,
            target_date: targetDateStr
          });
          
          console.log("✅ Mission response:", missionRes.data);
          
          const missionId = missionRes.data?.id || missionRes.data?._id;
          
          if (!missionId) {
            throw new Error("Không nhận được mission ID");
          }
          
          console.log("🆔 Mission ID:", missionId);
          console.log(`✅ Đã tạo mission ${template.title}`);
          
          // Thêm exercises vào mission (nếu có)
          if (assignedExercises.length > 0) {
            console.log("📝 Exercise assignment bulk:", assignedExercises);
            
            const addExRes = await addExerciseToMission(missionId, { exercises: assignedExercises });
            console.log("✅ Add exercise bulk response:", addExRes.data);
            console.log(`✅ Đã gán ${assignedExercises.length} bài tập cho mission ${template.title}`);
            
            // Đợi 0.5 giây để backend xử lý xong
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          successCount++;
          
        } catch (error) {
          console.error(`❌ Lỗi tạo mission ${template.title}:`, error);
          setStatus(`❌ Lỗi tạo mission ${template.title}: ${error.message}`);
        }
      }
      
      setStatus(`✅ Đã tạo thành công ${successCount}/7 missions cho tuần!`);
      console.log(`🎉 Hoàn thành! ${successCount}/7 missions đã tạo`);
      
      // Refresh data sau 2 giây vì chỉ cần 1 exercise
      setTimeout(() => {
        console.log("🔄 Refreshing data...");
        if (onRefresh) {
          onRefresh();
          // Force refresh lại sau 1 giây để đảm bảo exercises được load
          setTimeout(() => {
            console.log("🔄 Force refreshing exercises...");
            if (onRefresh) onRefresh();
            setStatus("");
          }, 1000);
        }
      }, 2000);
      
    } catch (error) {
      console.error("❌ Lỗi tạo missions:", error);
      setStatus(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={createWeeklyMissions}
      disabled={isLoading}
      style={{
        padding: "10px 20px",
        borderRadius: 10,
        border: "none",
        background: isLoading 
          ? "linear-gradient(135deg,#6b7280,#9ca3af)" 
          : "linear-gradient(135deg,#10b981,#34d399)",
        color: "#fff",
        fontWeight: 700,
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: 14,
        boxShadow: isLoading 
          ? "none" 
          : "0 4px 16px rgba(16,185,129,0.3)",
        opacity: isLoading ? 0.7 : 1,
        transition: "all 0.3s ease"
      }}
    >
      {isLoading ? "⏳ Đang tạo..." : "🚀 Tạo tuần (7 missions + exercises)"}
    </button>
  );
};

export default WeeklyMissionCreator;
