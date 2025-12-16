import { Bill } from "@/services/bill";
import {
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";

// --- Type Definitions ---
export type BillFrequency =
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | "Quarterly"
  | "Annual"
  | "One Time";

export type BillWithDueDate = Bill & {
  dueDateObj: Date;
  isOverdue: boolean;
};

// --- Helper Functions ---

/**
 * Normalizes frequency string to lowercase for consistent comparisons.
 */
const normalizeFrequency = (frequency: string): string => {
  return frequency.toLowerCase().trim();
};

/**
 * Internal helper: Maps bills to BillWithDueDate objects.
 * Calculates due dates and determines overdue status.
 */
function mapBillsWithDueDate(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());

  return allBills
    .map((bill) => {
      if (!bill.startDate) return null;

      const rawDueDate = startOfDay(parseISO(bill.startDate));
      const calculatedDueDate = calculateNextDueDate(
        bill.startDate,
        bill.frequency
      );

      if (isNaN(rawDueDate.getTime()) || isNaN(calculatedDueDate.getTime())) {
        console.warn(`Invalid date for bill ${bill._id}:`, bill.startDate);
        return null;
      }

      const isOverdue = rawDueDate.getTime() < today.getTime();
      const dateToDisplay = rawDueDate;

      return {
        ...bill,
        dueDateObj: dateToDisplay,
        isOverdue,
      } as BillWithDueDate;
    })
    .filter((bill): bill is BillWithDueDate => bill !== null);
}

// --- Exported Functions ---

/**
 * Calculates the total amount for a list of bills.
 *
 * @param bills - Array of bills to sum
 * @returns Total amount of all bills
 */
export function calculateBillTotal(bills: Bill[] | BillWithDueDate[]): number {
  return bills.reduce((total, bill) => total + bill.amount, 0);
}

/**
 * Calculates the next due date for a bill based on its original date and frequency.
 * Increments the date until it is on or after today (startOfDay).
 *
 * @example
 * // Bill due on Jan 1, 2025, Monthly frequency, today is Feb 15, 2025
 * calculateNextDueDate('2025-01-01', 'Monthly')
 * // Returns: March 1, 2025
 *
 * @param originalDateIso - ISO date string (e.g., "2025-01-01")
 * @param frequency - Bill frequency (Weekly, Monthly, etc.)
 * @returns The next due date as a Date object
 */
export function calculateNextDueDate(
  originalDateIso: string,
  frequency: string
): Date {
  let nextDate = startOfDay(parseISO(originalDateIso));
  const today = startOfDay(new Date());

  if (isNaN(nextDate.getTime())) {
    console.warn(`Invalid date: ${originalDateIso}`);
    return today;
  }

  const normFrequency = normalizeFrequency(frequency);

  while (nextDate.getTime() <= today.getTime()) {
    switch (normFrequency) {
      case "weekly":
        nextDate = addWeeks(nextDate, 1);
        break;
      case "fortnightly":
        nextDate = addWeeks(nextDate, 2);
        break;
      case "monthly":
        nextDate = addMonths(nextDate, 1);
        break;
      case "quarterly":
        nextDate = addMonths(nextDate, 3);
        break;
      case "annual":
        nextDate = addMonths(nextDate, 12);
        break;
      default:
        // For 'One Time' or unknown, stop. The date is meant to be static.
        return nextDate;
    }
  }

  return nextDate;
}

/**
 * Calculates the previous due date for a bill. Used for reverting a 'paid' status.
 *
 * @param currentDateIso - Current due date in ISO format
 * @param frequency - Bill frequency
 * @returns Previous due date as a Date object
 */
export function calculatePreviousDueDate(
  currentDateIso: string,
  frequency: string
): Date {
  let prevDate = startOfDay(parseISO(currentDateIso));
  const normFrequency = normalizeFrequency(frequency);

  switch (normFrequency) {
    case "weekly":
      prevDate = addWeeks(prevDate, -1);
      break;
    case "fortnightly":
      prevDate = addWeeks(prevDate, -2);
      break;
    case "monthly":
      prevDate = addMonths(prevDate, -1);
      break;
    case "quarterly":
      prevDate = addMonths(prevDate, -3);
      break;
    case "annual":
      prevDate = addMonths(prevDate, -12);
      break;
    default:
      break;
  }
  return prevDate;
}


/**
 * Returns all bills that have been marked as paid in the current month.
 * Relies strictly on a non-empty, current-month lastPaidDate.
 *
 * @param allBills - Array of all bills
 * @returns Array of bills paid this month
 */
export function getPaidBillsThisMonth(allBills: Bill[]): Bill[] {
  const today = new Date();

  return allBills.filter((bill) => {
    // Must have a last paid date and it must NOT be empty
    if (!bill.lastPaidDate?.trim()) return false;

    try {
      const paidDate = parseISO(bill.lastPaidDate);
      if (isNaN(paidDate.getTime())) return false;
      return isSameMonth(paidDate, today);
    } catch (error) {
      console.error(`Invalid date format for bill ${bill._id}:`, error);
      return false;
    }
  });
}

/**
 * Filters and sorts bills that are due within the current or next calendar month.
 * Uses the RAW startDate to determine Overdue status for recurring bills.
 * This is used for DISPLAY purposes (shows current month + next month bills).
 *
 * @param allBills - Array of all bills
 * @returns Array of upcoming bills with due dates and overdue status
 */
export function getMonthlyUpcomingBills(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const nextMonth = addMonths(today, 1);
  const billsWithDate = mapBillsWithDueDate(allBills);

  // Keep bills that are overdue OR due this month OR due next month
  const filteredBills = billsWithDate.filter((bill) => {
    if (bill.isOverdue) return true;
    const isDueThisMonth = isSameMonth(bill.dueDateObj, today);
    const isDueNextMonth = isSameMonth(bill.dueDateObj, nextMonth);
    return isDueThisMonth || isDueNextMonth;
  });

  // Sort: Overdue first, then chronological
  return filteredBills.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.dueDateObj.getTime() - b.dueDateObj.getTime();
  });
}

/**
 * Filters bills to include ONLY those due in the current calendar month
 * or bills that are explicitly overdue (from previous months).
 * This is used ONLY for calculating the correct "Total Monthly Bill" sum.
 *
 * @param allBills - Array of all bills
 * @returns Array of bills due this month (for budget calculations)
 */
export function getBillsDueCurrentMonth(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const billsWithDate = mapBillsWithDueDate(allBills);

  // Keep only bills due in current month OR overdue
  return billsWithDate.filter((bill) => {
    if (bill.isOverdue) return true;
    return isSameMonth(bill.dueDateObj, today);
  });
}

/**
 * Returns a sorted list of bills due within the next 7 days (including today).
 *
 * @param allBills - Array of all bills
 * @returns Array of bills due in the next week
 */
export function getWeeklyBillSummary(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const next7DaysEnd = addDays(today, 6);

  const billsWithDate = allBills
    .map((bill) => {
      if (!bill.startDate) return null;

      const dueDateObj = startOfDay(parseISO(bill.startDate));

      if (isNaN(dueDateObj.getTime())) return null;

      return {
        ...bill,
        dueDateObj,
        isOverdue: dueDateObj.getTime() < today.getTime(),
      } as BillWithDueDate;
    })
    .filter((bill): bill is BillWithDueDate => bill !== null);

  // Filter bills due within the next 7 days
  const filteredBills = billsWithDate.filter((bill) => {
    const dueDate = bill.dueDateObj;
    return (
      dueDate.getTime() >= today.getTime() &&
      dueDate.getTime() <= next7DaysEnd.getTime()
    );
  });

  // Sort by due date (earliest first)
  return filteredBills.sort(
    (a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()
  );
}

/**
 * Calculates the recommended weekly savings target using a hybrid budgeting algorithm.
 * Returns the target, actual urgent bills, average, buffer, and the list of urgent bills.
 *
 * @param allBills - Array of all bills
 * @returns Object containing weekly savings plan details
 */
export function getWeeklySavingsPlan(allBills: Bill[]) {
  // Use current month bills only for accurate monthly total calculation
  const currentMonthBills = getBillsDueCurrentMonth(allBills);

  const totalMonthlyBill = calculateBillTotal(currentMonthBills);
  const weeklyAverageTarget = totalMonthlyBill / 4;

  const billsDueThisWeekList = getWeeklyBillSummary(allBills);
  const billsDueThisWeekTotal = calculateBillTotal(billsDueThisWeekList);

  // Final target is the greater of average or immediate needs
  const finalWeeklyTarget = Math.max(
    weeklyAverageTarget,
    billsDueThisWeekTotal
  );

  // Money saved this week for future bills
  const futureBufferContribution = finalWeeklyTarget - billsDueThisWeekTotal;

  return {
    finalWeeklyTarget,
    billsDueThisWeekTotal,
    weeklyAverageTarget,
    futureBufferContribution,
    billsDueThisWeekList,
  };
}
