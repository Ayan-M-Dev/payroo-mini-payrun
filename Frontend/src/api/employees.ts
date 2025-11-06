import apiClient from "./client";
import type { Employee } from "../types/api";

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>("/employees");
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  createOrUpdate: async (employee: Employee): Promise<Employee> => {
    const response = await apiClient.post<Employee>("/employees", employee);
    return response.data;
  },
};
