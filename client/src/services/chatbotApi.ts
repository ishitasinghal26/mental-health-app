import { apiClient } from "./apiClient";

export type ChatMessage = {
  id: number;
  user_message: string;
  bot_response: string;
  created_at: string;
};

export async function getChatHistory(): Promise<ChatMessage[]> {
  const res = await apiClient.get("/chatbot/history");
  return res.data;
}

export async function sendChatMessage(message: string): Promise<{ response: string }> {
  const res = await apiClient.post("/chatbot/message", { message });
  return res.data;
}
