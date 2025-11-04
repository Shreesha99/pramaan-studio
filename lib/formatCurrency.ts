export function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}
