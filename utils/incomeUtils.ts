import { Income } from "@/types/database"; // 🏆 Centralized Firebase Type
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
 * Logic: Calculates if a payment occurs in the week based on startDate and frequency.
 */
export function getWeeklyIncome(
  allIncome: Income[],
  weekStart?: Date,
  weekEnd?: Date
): IncomeWithNextPayDate[] {
  // Use provided dates or default to current week
  const today = new Date();
  const effectiveWeekStart =
    weekStart || startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const effectiveWeekEnd = weekEnd || endOfWeek(today, { weekStartsOn: 1 }); // Sunday

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
      // For "One Time" payments, check if the date falls in the week
      if (income.frequency === "One Time") {
        const paymentDate = startOfDay(parseISO(income.startDate));
        return isWithinInterval(paymentDate, {
          start: effectiveWeekStart,
          end: effectiveWeekEnd,
        });
      }

      // For recurring income, check if a payment would occur this week
      // by walking through payment dates from startDate
      let currentPaymentDate = startOfDay(parseISO(income.startDate));

      // Walk forward until we're past the week we're checking
      while (currentPaymentDate <= effectiveWeekEnd) {
        // Check if this payment date falls within our target week
        if (
          isWithinInterval(currentPaymentDate, {
            start: effectiveWeekStart,
            end: effectiveWeekEnd,
          })
        ) {
          return true; // This income has a payment in this week
        }

        // Advance to next payment date
        if (income.frequency === "Weekly") {
          currentPaymentDate = addWeeks(currentPaymentDate, 1);
        } else if (income.frequency === "Fortnightly") {
          currentPaymentDate = addWeeks(currentPaymentDate, 2);
        } else if (income.frequency === "Monthly") {
          currentPaymentDate = addMonths(currentPaymentDate, 1);
        } else {
          break; // Unknown frequency
        }

        // Safety: don't loop forever
        if (currentPaymentDate > addWeeks(effectiveWeekEnd, 520)) break; // 10 years
      }

      return false; // No payment in this week
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
