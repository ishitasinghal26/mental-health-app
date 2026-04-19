import axios from "axios";

// Python FastAPI AI bot runs on port 8000
const BOT_BASE = "http://localhost:8000";

export type BotMessage = {
  role: "user" | "bot";
  text: string;
  time: string;
};

export type Conversation = {
  id: number;
  title: string;
};

function authHeaders() {
  const raw = localStorage.getItem("mindkare_auth");
  if (!raw) return {};
  try {
    const { token } = JSON.parse(raw);
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

function getUserId(): number | null {
  const raw = localStorage.getItem("mindkare_auth");
  if (!raw) return null;
  try {
    const { user } = JSON.parse(raw);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getConversations(): Promise<Conversation[]> {
  const userId = getUserId();
  if (!userId) return [];
  const res = await axios.get(`${BOT_BASE}/conversations`, { params: { user_id: userId } });
  return res.data;
}

export async function createConversation(): Promise<{ id: number }> {
  const userId = getUserId();
  const res = await axios.post(`${BOT_BASE}/new-chat`, null, { params: { user_id: userId } });
  return res.data;
}

export async function getBotHistory(conversationId: number): Promise<BotMessage[]> {
  const userId = getUserId();
  const res = await axios.get(`${BOT_BASE}/history`, {
    params: { user_id: userId, conversation_id: conversationId },
  });
  // returns array of {role, text, timestamp}
  return (res.data || []).map((m: any) => ({
    role: m.role as "user" | "bot",
    text: m.text,
    time: m.timestamp || new Date().toISOString(),
  }));
}

export async function sendBotMessage(
  message: string,
  conversationId: number
): Promise<{ reply: string; crisis: boolean; timestamp: string }> {
  const userId = getUserId();
  const res = await axios.post(`${BOT_BASE}/chat`, null, {
    params: { user_id: userId, message, conversation_id: conversationId },
  });
  return res.data;
}
