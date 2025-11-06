export function calculateTax(gross: number): number {
  let tax = 0;

  if (gross <= 370) {
    tax = 0;
  } else if (gross <= 900) {
    tax = (gross - 370) * 0.1;
  } else if (gross <= 1500) {
    tax = (900 - 370) * 0.1 + (gross - 900) * 0.19;
  } else if (gross <= 3000) {
    tax = 167 + (gross - 1500) * 0.325;
  } else if (gross <= 5000) {
    tax = 654.5 + (gross - 3000) * 0.37;
  } else {
    tax = 1394.5 + (gross - 5000) * 0.45;
  }

  return Math.round(tax * 100) / 100;
}
