import prisma from "../lib/db";
import { EmployeeInput } from "../lib/validation";

export async function getAllEmployees() {
  return prisma.employee.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
  });
}

export async function upsertEmployee(data: EmployeeInput) {
  return prisma.employee.upsert({
    where: { id: data.id },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      type: data.type,
      baseHourlyRate: data.baseHourlyRate,
      superRate: data.superRate,
      bankBsb: data.bank?.bsb || "",
      bankAccount: data.bank?.account || "",
    },
    create: {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      type: data.type,
      baseHourlyRate: data.baseHourlyRate,
      superRate: data.superRate,
      bankBsb: data.bank?.bsb || "",
      bankAccount: data.bank?.account || "",
    },
  });
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({
    where: { id },
  });
}
