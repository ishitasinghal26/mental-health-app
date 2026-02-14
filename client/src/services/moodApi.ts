import { apiClient } from "./apiClient";

export async function addMood(data: {
  mood: string;
  emoji: string;
  note?: string;
}) {
  const res = await apiClient.post("/moods", data);
  return res.data;
}

export async function getMyMoods() {
  const res = await apiClient.get("/moods");
  return res.data;
}
