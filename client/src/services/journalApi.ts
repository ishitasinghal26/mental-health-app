import { apiClient } from "./apiClient";

export type JournalEntry = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  mood: string;
  intensity: number;
  tags: string[];
  created_at: string;
};

export async function getJournals(): Promise<JournalEntry[]> {
  const res = await apiClient.get("/journals");
  return res.data;
}

export async function createJournal(data: {
  title: string;
  content: string;
  mood: string;
  intensity: number;
  tags: string[];
}): Promise<JournalEntry> {
  const res = await apiClient.post("/journals", data);
  return res.data;
}

export async function updateJournal(id: number, data: Partial<JournalEntry>): Promise<JournalEntry> {
  const res = await apiClient.put(`/journals/${id}`, data);
  return res.data;
}

export async function deleteJournal(id: number): Promise<void> {
  await apiClient.delete(`/journals/${id}`);
}
