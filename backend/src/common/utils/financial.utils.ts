/**
 * Financial calculation and formatting utilities for BAMS
 */

export function calculateNetProfit(income: number | string, expenses: number | string): number {
  const inc = typeof income === 'string' ? parseFloat(income) : income;
  const exp = typeof expenses === 'string' ? parseFloat(expenses) : expenses;
  const safeInc = isNaN(inc) ? 0 : inc;
  const safeExp = isNaN(exp) ? 0 : exp;
  return Number((safeInc - safeExp).toFixed(2));
}

export function calculateBalance(
  openingBalance: number | string,
  totalIncome: number | string,
  totalExpenses: number | string,
  totalInvestments: number | string = 0,
): number {
  const op = typeof openingBalance === 'string' ? parseFloat(openingBalance) : openingBalance;
  const inc = typeof totalIncome === 'string' ? parseFloat(totalIncome) : totalIncome;
  const exp = typeof totalExpenses === 'string' ? parseFloat(totalExpenses) : totalExpenses;
  const inv = typeof totalInvestments === 'string' ? parseFloat(totalInvestments) : totalInvestments;

  const safeOp = isNaN(op) ? 0 : op;
  const safeInc = isNaN(inc) ? 0 : inc;
  const safeExp = isNaN(exp) ? 0 : exp;
  const safeInv = isNaN(inv) ? 0 : inv;

  return Number((safeOp + safeInc - safeExp - safeInv).toFixed(2));
}

export function formatCurrency(
  amount: number | string,
  locale: 'en' | 'gu' = 'en',
  currency: string = 'INR',
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const safeNum = isNaN(num) ? 0 : num;

  if (locale === 'gu') {
    // Format Gujarati numerals or Gujarati currency symbol
    const formatted = new Intl.NumberFormat('gu-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(safeNum);
    return formatted;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(safeNum);
}
