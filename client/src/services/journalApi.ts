import { apiClient } from "./apiClient";

export const createJournal = (data: any) =>
  apiClient.post("/journals", data);

export const getMyJournals = () =>
  apiClient.get("/journals");

export const deleteJournal = (id: number) =>
  apiClient.delete(`/journals/${id}`);

export const updateJournal = (id: number, data: any) =>
  apiClient.put(`/journals/${id}`, data);
