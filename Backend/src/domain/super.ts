export function calculateSuper(gross: number, superRate: number): number {
  const superAmount = gross * superRate;
  return Math.round(superAmount * 100) / 100;
}
