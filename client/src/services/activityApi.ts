import { apiClient } from "./apiClient";

export const getActivities = (params?: any) =>
  apiClient.get("/activities", { params });
