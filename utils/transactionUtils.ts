import { Transaction } from "@/types/database"; // 🏆 Centralized Firebase Type
import { isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";

/**
 * groupTransactionsByDate: Groups transactions for the UI list.
 * Logic: Uses ISO strings as keys to group spending by day.
 */
export function groupTransactionsByDate(transactions: Transaction[]): Array<{
  date: string;
  transactions: Transaction[];
}> {
  const groups: Record<string, Transaction[]> = {};

  for (const transaction of transactions) {
    const date = transaction.date || "Unknown";

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  }

  const groupedArray = [];
  for (const date in groups) {
    // Sort transactions within each group (newest first)
    const sortedTransactions = groups[date].sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime();
      const timeB = new Date(b.date || 0).getTime();
      return timeB - timeA;
    });

    groupedArray.push({
      date: date,
      transactions: sortedTransactions,
    });
  }

  // Sort the date groups themselves (most recent days at the top)
  groupedArray.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return groupedArray;
}

/**
 * calculateTransactionTotal: Returns the COUNT of transactions this month.
 */
export function calculateTransactionTotal(transactions: Transaction[]): number {
  const TransactionTotalMonth = transactions.filter((transaction) => {
    return transaction.date && isThisMonth(parseISO(transaction.date));
  });

  return TransactionTotalMonth.length;
}

/**
 * calculateTodaySpending: Sum of all spending today.
 */
export function calculateTodaySpending(transactions: Transaction[]): number {
  const todayTransactions = transactions.filter((transaction) => {
    return transaction.date && isToday(parseISO(transaction.date));
  });

  return todayTransactions.reduce((acc, t) => acc + t.amount, 0);
}

/**
 * calculateWeeklySpending: Sum of all spending this week.
 */
export function calculateWeeklySpending(transactions: Transaction[]): number {
  const weekTransactions = transactions.filter((transaction) => {
    return transaction.date && isThisWeek(parseISO(transaction.date));
  });

  return weekTransactions.reduce((acc, t) => acc + t.amount, 0);
}

/**
 * calculateMonthlySpending: Sum of all spending this month.
 */
export function calculateMonthlySpending(transactions: Transaction[]): number {
  const monthTransactions = transactions.filter((transaction) => {
    return transaction.date && isThisMonth(parseISO(transaction.date));
  });

  return monthTransactions.reduce((acc, t) => acc + t.amount, 0);
}

/**
 * calculateAverageDailySpending: Month total divided by days passed.
 */
export function calculateAverageDailySpending(
  transactions: Transaction[]
): number {
  const daysPassed = new Date().getDate();
  const monthlyTotal = calculateMonthlySpending(transactions);
  return monthlyTotal / daysPassed;
}
