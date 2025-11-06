import { format as formatDate, parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateReadable(dateString: string): string {
  try {
    return formatDate(parseISO(dateString), "dd MMM yyyy");
  } catch {
    return dateString;
  }
}

export function formatHours(hours: number): string {
  return hours.toFixed(2);
}
