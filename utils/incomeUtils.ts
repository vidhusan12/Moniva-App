import { Income } from "@/services/income";
import {
  addMonths,
  addWeeks,
  endOfWeek,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";

// --- Type Definitions ---
export type IncomeFrequency = "Weekly" | "Fortnightly" | "Monthly" | "One Time";

export type IncomeWithNextPayDate = Income & {
  nextPayDateObj: Date;
};

// --- Helper Functions ---

/**
 * Calculates the next pay date based on start date and frequency.
 * Advances the date until it's in the future.
 */
export function calculateNextPayDate(
  startDate: string,
  frequency: string
): Date {
  let nextDate = startOfDay(parseISO(startDate));
  const today = startOfDay(new Date());

  // If it's a one time payment, just return the start date
  if (frequency === "One Time") {
    return nextDate;
  }

  // Keep advancing the date until it's in the future
  while (nextDate <= today) {
    if (frequency === "Weekly") {
      nextDate = addWeeks(nextDate, 1);
    } else if (frequency === "Fortnightly") {
      nextDate = addWeeks(nextDate, 2);
    } else if (frequency === "Monthly") {
      nextDate = addMonths(nextDate, 1);
    } else {
      // Unknown frequency, return original date
      break;
    }
  }

  return nextDate;
}

/**
 * Gets all income payments that were RECEIVED this week.
 * Checks the 'date' field (when income was last updated/received).
 */
export function getWeeklyIncome(allIncome: Income[]): IncomeWithNextPayDate[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

  return allIncome
    .map((income) => {
      if (!income.startDate) return null;

      const nextPayDate = calculateNextPayDate(
        income.startDate,
        income.frequency
      );

      return { ...income, nextPayDateObj: nextPayDate };
    })
    .filter((income): income is IncomeWithNextPayDate => income !== null)
    .filter((income) => {
      // Check if the 'date' field (last received) is within this week
      if (!income.date) return false;
      const receivedDate = startOfDay(parseISO(income.date));
      const isInWeek = isWithinInterval(receivedDate, {
        start: weekStart,
        end: weekEnd,
      });
      return isInWeek;
    });
}

/**
 * Calculates the total amount from an array of incomes.
 */
export function calculateIncomeTotal(incomes: Income[]): number {
  return incomes.reduce((total, income) => total + income.amount, 0);
}

/**
 * Gets all income payments that are due this month.
 */
export function getMonthlyIncome(allIncome: Income[]): IncomeWithNextPayDate[] {
  const today = new Date();

  return allIncome
    .map((income) => {
      if (!income.startDate) return null;

      const nextPayDate = calculateNextPayDate(
        income.startDate,
        income.frequency
      );

      return {
        ...income,
        nextPayDateObj: nextPayDate,
      };
    })
    .filter((income): income is IncomeWithNextPayDate => income !== null)
    .filter((income) => isSameMonth(income.nextPayDateObj, today));
}
