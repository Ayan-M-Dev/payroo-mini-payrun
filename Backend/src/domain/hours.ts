import { TimesheetEntryInput, HoursBreakdown } from "../types/payroll";

const WEEKLY_OVERTIME_THRESHOLD = 38;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateEntryHours(entry: TimesheetEntryInput): number {
  const startMinutes = parseTimeToMinutes(entry.start);
  const endMinutes = parseTimeToMinutes(entry.end);
  const paidMinutes = endMinutes - startMinutes - entry.unpaidBreakMins;
  return paidMinutes / 60;
}

export function calculateHours(entries: TimesheetEntryInput[]): HoursBreakdown {
  const totalHours = entries.reduce((sum, entry) => {
    return sum + calculateEntryHours(entry);
  }, 0);

  const normalHours = Math.min(totalHours, WEEKLY_OVERTIME_THRESHOLD);
  const overtimeHours = Math.max(0, totalHours - WEEKLY_OVERTIME_THRESHOLD);

  return {
    normalHours: Math.round(normalHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
  };
}
