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
        { title: "Ngày 1: Khởi động cơ bản", description: "Các bài tập khởi động nhẹ nhàng", level: "beginner", keywords: ["khởi động", "warm up", "năng lượng"] },
        { title: "Ngày 2: Tăng sức mạnh", description: "Bài tập xây dựng sức mạnh", level: "intermediate", keywords: ["sức mạnh", "strength", "power"] },
        { title: "Ngày 3: Dãn cơ linh hoạt", description: "Tăng sự linh hoạt và dãn cơ", level: "beginner", keywords: ["dãn cơ", "flexibility", "stretching"] },
        { title: "Ngày 4: Cardio", description: "Bài tập tim mạch", level: "intermediate", keywords: ["cardio", "tim mạch", "nhịp tim"] },
        { title: "Ngày 5: Cơ lõi", description: "Tập trung vào cơ lõi", level: "intermediate", keywords: ["cơ lõi", "core", "bụng"] },
        { title: "Ngày 6: Thư giãn", description: "Các bài tập thư giãn nhẹ nhàng", level: "beginner", keywords: ["thư giãn", "relax", "yoga"] },
        { title: "Ngày 7: Phục hồi", description: "Bài tập phục hồi cơ thể", level: "beginner", keywords: ["phục hồi", "recovery", "massage"] }
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
          // Tìm 1 exercise phù hợp
          let selectedExercise = null;
          
          // Thử tìm exercise theo keywords
          for (const keyword of template.keywords) {
            const found = allExercises.find(ex => 
              (ex.title && ex.title.toLowerCase().includes(keyword.toLowerCase())) ||
              (ex.description && ex.description.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (found) {
              selectedExercise = found;
              break; // Chỉ cần 1 exercise
            }
          }
          
          // Nếu không tìm thấy theo keywords, lấy exercise đầu tiên
          if (!selectedExercise && allExercises.length > 0) {
            selectedExercise = allExercises[0];
          }
          
          console.log(`🏋️ Selected exercise for ${template.title}:`, selectedExercise);
          
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
          
          // Thêm exercise vào mission (nếu có)
          if (selectedExercise) {
            const exerciseAssignment = {
              exercise_id: selectedExercise.id || selectedExercise._id,
              point: 10
            };
            
            console.log("📝 Exercise assignment:", exerciseAssignment);
            
            const addExRes = await addExerciseToMission(missionId, { exercises: [exerciseAssignment] });
            console.log("✅ Add exercise response:", addExRes.data);
            console.log(`✅ Đã gán exercise cho mission ${template.title}`);
            
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
