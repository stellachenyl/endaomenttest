
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUsdc = (amount: string) => {
  return formatter.format(Number(amount) / 1_000_000);
}
