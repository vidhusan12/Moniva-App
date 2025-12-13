import { Transaction } from "@/services/transaction";
import { isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";

// --- Type Definitions ---
// Add any extended types here if needed
// Example: export type TransactionWithCategory = Transaction & { ... }

/**
 * Groups transactions by date.
 * Returns an object where keys are dates and values are arrays of transactions.
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  // Your code here
  return {};
}



/**
 * Calculates the total amount for a list of transactions.
 */
export function calculateTransactionTotal(transactions: Transaction[]): number {

  const TransactionTotalMonth = transactions.filter((transaction) => {
    return transaction.date && isThisMonth(parseISO(transaction.date))
  });
  
  return TransactionTotalMonth.length
}

/**
 * Calculates total spending for today.
 */
export function calculateTodaySpending(transactions: Transaction[]): number {
  const todayTransactions = transactions.filter((transaction) => {
    return transaction.date && isToday(parseISO(transaction.date));
  });

  const total = todayTransactions.reduce((accumulator, transaction) => {
    return accumulator + transaction.amount;
  }, 0);
  return total;
}

/**
 * Calculates total spending for this week.
 */
export function calculateWeeklySpending(transactions: Transaction[]): number {
  const weekTransactions = transactions.filter((transaction) => {
    return transaction.date && isThisWeek(parseISO(transaction.date));
  });

  const weekTotal = weekTransactions.reduce((accumulator, transaction) => {
    return accumulator + transaction.amount;
  }, 0);

  return weekTotal;
}

/**
 * Calculates total spending for this month.
 */
export function calculateMonthlySpending(transactions: Transaction[]): number {
  const TotalMonthSpending = transactions.filter((transaction) => {
    return transaction.date && isThisMonth(parseISO(transaction.date));
  });

  let monthTransactions = TotalMonthSpending.reduce((accumulator, transaction) => {
    return accumulator + transaction.amount;
  }, 0);
  return monthTransactions;
}

/**
 * Calculates average daily spending for the current month.
 */
export function calculateAverageDailySpending(
  transactions: Transaction[]
): number {
  const daysPassed = new Date().getDate();
  const averageSpending = calculateMonthlySpending(transactions) / daysPassed;
  return averageSpending;
}

/**
 * Filters transactions by category.
 */
export function filterByCategory(
  transactions: Transaction[],
  category: string
): Transaction[] {
  // Your code here
  return [];
}

/**
 * Filters transactions by search query (searches in description).
 */
export function filterBySearchQuery(
  transactions: Transaction[],
  query: string
): Transaction[] {
  // Your code here
  return [];
}
