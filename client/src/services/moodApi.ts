import { apiClient } from "./apiClient";

export type MoodEntry = {
  id: number;
  user_id: number;
  mood: string;
  intensity: number;
  note: string;
  created_at: string;
};

export async function getMoods(): Promise<MoodEntry[]> {
  const res = await apiClient.get("/moods");
  return res.data;
}

export async function addMood(data: {
  mood: string;
  intensity: number;
  note: string;
}): Promise<MoodEntry> {
  const res = await apiClient.post("/moods", data);
  return res.data;
}

export async function updateMood(id: number, data: Partial<MoodEntry>): Promise<MoodEntry> {
  const res = await apiClient.put(`/moods/${id}`, data);
  return res.data;
}

export async function deleteMood(id: number): Promise<void> {
  await apiClient.delete(`/moods/${id}`);
}
