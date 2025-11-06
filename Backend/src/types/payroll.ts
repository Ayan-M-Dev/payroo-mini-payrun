export interface TimesheetEntryInput {
  date: string;
  start: string;
  end: string;
  unpaidBreakMins: number;
}

export interface HoursBreakdown {
  normalHours: number;
  overtimeHours: number;
  totalHours: number;
}

export interface PayCalculation {
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
}

export interface EmployeeData {
  baseHourlyRate: number;
  superRate: number;
}

export interface TimesheetData {
  entries: TimesheetEntryInput[];
  allowances: number;
}
