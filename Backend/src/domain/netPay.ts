export function calculateNetPay(gross: number, tax: number): number {
  const net = gross - tax;
  return Math.round(net * 100) / 100;
}
