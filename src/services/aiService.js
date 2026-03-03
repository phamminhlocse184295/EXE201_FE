import api from "./api"; // File cấu hình axios của bạn (đã đính kèm sẵn Token)

export const askAiQuestion = (question) => {
  return api.post("/ai/question", { question });
};
