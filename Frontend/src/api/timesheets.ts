import apiClient from "./client";
import type { Timesheet } from "../types/api";

export const timesheetApi = {
  createOrUpdate: async (timesheet: Timesheet): Promise<Timesheet> => {
    const response = await apiClient.post<Timesheet>("/timesheets", timesheet);
    return response.data;
  },
};
