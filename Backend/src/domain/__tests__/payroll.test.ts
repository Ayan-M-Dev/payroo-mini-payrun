/**
 * Reference totals from Assessment.md:
 * Period: 2025-08-11 → 2025-08-17
 *
 * Alice: 37.0 normal hrs, gross $1,325.00, tax $133.75, super $152.38, net $1,191.25
 * Bob: 38.0 normal + 7.0 overtime, gross $2,328.00, tax $436.10, super $267.72, net $1,891.90
 *
 * Pay run totals: gross $3,653.00, tax $569.85, super $420.10, net $3,083.15
 */

import { calculatePayroll } from "../payroll";
import { TimesheetEntryInput } from "../../types/payroll";

const aliceEntries: TimesheetEntryInput[] = [
  { date: "2025-08-11", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
  { date: "2025-08-12", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
  { date: "2025-08-13", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
  { date: "2025-08-14", start: "09:00", end: "15:00", unpaidBreakMins: 30 },
  { date: "2025-08-15", start: "10:00", end: "18:00", unpaidBreakMins: 30 },
];

const bobEntries: TimesheetEntryInput[] = [
  { date: "2025-08-11", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
  { date: "2025-08-12", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
  { date: "2025-08-13", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
  { date: "2025-08-14", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
  { date: "2025-08-15", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
];

describe("Payroll Calculations", () => {
  describe("Alice's payroll", () => {
    const result = calculatePayroll(aliceEntries, 30.0, {
      baseHourlyRate: 35.0,
      superRate: 0.115,
    });

    test("should calculate correct normal hours", () => {
      expect(result.normalHours).toBe(37.0);
    });

    test("should calculate correct gross pay", () => {
      expect(result.gross).toBe(1325.0);
    });

    test("should calculate correct tax", () => {
      expect(result.tax).toBe(133.75);
    });

    test("should calculate correct super", () => {
      expect(result.super).toBeCloseTo(152.38, 2);
    });

    test("should calculate correct net pay", () => {
      expect(result.net).toBeCloseTo(1191.25, 2);
    });
  });

  describe("Bob's payroll", () => {
    const result = calculatePayroll(bobEntries, 0.0, {
      baseHourlyRate: 48.0,
      superRate: 0.115,
    });

    test("should calculate correct normal hours", () => {
      expect(result.normalHours).toBe(38.0);
    });

    test("should calculate correct overtime hours", () => {
      expect(result.overtimeHours).toBe(7.0);
    });

    test("should calculate correct gross pay", () => {
      expect(result.gross).toBe(2328.0);
    });

    test("should calculate correct tax", () => {
      expect(result.tax).toBeCloseTo(436.1, 2);
    });

    test("should calculate correct super", () => {
      expect(result.super).toBeCloseTo(267.72, 2);
    });

    test("should calculate correct net pay", () => {
      expect(result.net).toBeCloseTo(1891.9, 2);
    });
  });

  describe("Pay run totals", () => {
    const aliceResult = calculatePayroll(aliceEntries, 30.0, {
      baseHourlyRate: 35.0,
      superRate: 0.115,
    });

    const bobResult = calculatePayroll(bobEntries, 0.0, {
      baseHourlyRate: 48.0,
      superRate: 0.115,
    });

    const totalGross = aliceResult.gross + bobResult.gross;
    const totalTax = aliceResult.tax + bobResult.tax;
    const totalSuper = aliceResult.super + bobResult.super;
    const totalNet = aliceResult.net + bobResult.net;

    test("should calculate correct total gross", () => {
      expect(totalGross).toBe(3653.0);
    });

    test("should calculate correct total tax", () => {
      expect(totalTax).toBeCloseTo(569.85, 2);
    });

    test("should calculate correct total super", () => {
      expect(totalSuper).toBeCloseTo(420.1, 2);
    });

    test("should calculate correct total net", () => {
      expect(totalNet).toBeCloseTo(3083.15, 2);
    });
  });
});
