import { Transaction } from "@/services/transaction";
import { isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";

// --- Type Definitions ---
// Add any extended types here if needed
// Example: export type TransactionWithCategory = Transaction & { ... }

/**
 * Groups transactions by date.
 * Returns an array of objects with date and transactions for that date.
 * Sorted with newest dates first.
 */
export function groupTransactionsByDate(transactions: Transaction[]): Array<{
  date: string;
  transactions: Transaction[];
}> {
  // Step 1: Create groups object
  const groups: Record<string, Transaction[]> = {};

  // Step 2: Loop through all transactions and group by date
  for (const transaction of transactions) {
    const date = transaction.date || "Unknown";

    // If this date doesn't exist yet, create an empty array
    if (!groups[date]) {
      groups[date] = [];
    }

    // Add this transaction to the date's array
    groups[date].push(transaction);
  }

  // Step 3: Convert to array format and sort transactions within each group
  const groupedArray = [];
  for (const date in groups) {
    // Sort transactions within this date group (newest first)
    const sortedTransactions = groups[date].sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime();
      const timeB = new Date(b.date || 0).getTime();
      return timeB - timeA; // newest first
    });

    groupedArray.push({
      date: date,
      transactions: sortedTransactions,
    });
  }

  // Step 4: Sort date groups (newest first)
  groupedArray.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime(); // newest first
  });

  return groupedArray;
}

/**
 * Calculates the total amount for a list of transactions.
 */
export function calculateTransactionTotal(transactions: Transaction[]): number {
  const TransactionTotalMonth = transactions.filter((transaction) => {
    return transaction.date && isThisMonth(parseISO(transaction.date));
  });

  return TransactionTotalMonth.length;
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

  let monthTransactions = TotalMonthSpending.reduce(
    (accumulator, transaction) => {
      return accumulator + transaction.amount;
    },
    0
  );
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
