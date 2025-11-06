import apiClient from "./client";
import type { Payrun, PayrunRequest, Payslip } from "../types/api";

export const payrunApi = {
  generate: async (request: PayrunRequest): Promise<Payrun> => {
    const response = await apiClient.post<Payrun>("/payruns", request);
    return response.data;
  },

  getAll: async (): Promise<Payrun[]> => {
    const response = await apiClient.get<Payrun[]>("/payruns");
    return response.data;
  },

  getById: async (id: string): Promise<Payrun> => {
    const response = await apiClient.get<Payrun>(`/payruns/${id}`);
    return response.data;
  },

  getPayslip: async (
    employeeId: string,
    payrunId: string
  ): Promise<Payslip> => {
    const response = await apiClient.get<Payslip>(
      `/payslips/${employeeId}/${payrunId}`
    );
    return response.data;
  },
};
