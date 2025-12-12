import { Bill } from "@/services/bill";
import {
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";

// --- Type Definition ---
export type BillWithDueDate = Bill & {
  dueDateObj: Date;
  isOverdue: boolean;
};

/**
 * Calculates the total amount for a list of bills.
 */
export function calculateBillTotal(bills: Bill[] | BillWithDueDate[]): number {
  return bills.reduce((total, bill) => total + bill.amount, 0);
}

/**
 * Calculates the next due date for a bill based on its original date and frequency.
 * Increments the date until it is on or after today (startOfDay).
 */
export function calculateNextDueDate(
  originalDateIso: string,
  frequency: string
): Date {
  let nextDate = startOfDay(parseISO(originalDateIso));
  const today = startOfDay(new Date());

  if (isNaN(nextDate.getTime())) {
    return today;
  }

  const normFrequency = frequency.toLowerCase();

  while (nextDate.getTime() < today.getTime()) {
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
        return nextDate;
    }
  }

  return nextDate;
}

/**
 * Calculates the previous due date for a bill. Used for reverting a 'paid' status.
 */
export function calculatePreviousDueDate(
  currentDateIso: string,
  frequency: string
): Date {
  let prevDate = startOfDay(parseISO(currentDateIso));
  const normFrequency = frequency.toLowerCase();

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

// --- Filtering and Summary Functions ---

/**
 * Returns all bills that have been marked as paid in the current month.
 * Relies strictly on a non-empty, current-month lastPaidDate.
 */
export function getPaidBillsThisMonth(allBills: Bill[]): Bill[] {
  const today = new Date();

  return allBills.filter((bill) => {
    if (!bill.lastPaidDate || bill.lastPaidDate.trim() === "") return false;

    const paidDate = parseISO(bill.lastPaidDate);

    if (isNaN(paidDate.getTime())) return false;
    return isSameMonth(paidDate, today);
  });
}

/**
 * Filters and sorts bills that are due within the current calendar month
 * or are overdue (based on the *calculated* next due date).
 */
/**
 * Filters and sorts bills that are due within the current calendar month
 * or are overdue (based on the *calculated* next due date).
 */
/**
 * Filters and sorts bills that are due within the current calendar month.
 * This function determines the NEXT payment date (current cycle) and handles overdue status.
 */
/**
 * Filters and sorts bills that are due within the current calendar month
 * or are overdue (based on the *calculated* next due date).
 */
export function getMonthlyUpcomingBills(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());

  const billsWithDate: BillWithDueDate[] = allBills
    .map((bill) => {
      if (!bill.startDate) return null;

      // 1. Calculate the next due date based on the bill's frequency and current startDate.
      // This date is guaranteed to be TODAY or a future date (unless frequency is 'One Time').
      const calculatedDueDate = calculateNextDueDate(
        bill.startDate,
        bill.frequency
      );

      if (isNaN(calculatedDueDate.getTime())) {
        return null;
      }

      // 2. Overdue check: Only 'One Time' bills can technically be overdue here.
      const isOverdue = calculatedDueDate.getTime() < today.getTime();

      return {
        ...bill,
        dueDateObj: calculatedDueDate,
        isOverdue,
      } as BillWithDueDate;
    })
    .filter((bill): bill is BillWithDueDate => bill !== null);

  // 3. FINAL FILTER: Keep only bills that are due in the current calendar month OR are overdue.
  // This ensures the list doesn't show bills due far in the future.
  const filteredBills = billsWithDate.filter((bill) => {
    const isDueThisMonth = isSameMonth(bill.dueDateObj, today);
    return isDueThisMonth || bill.isOverdue;
  });

  // 4. SORTING: Overdue first, then chronological.
  return filteredBills.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    return a.dueDateObj.getTime() - b.dueDateObj.getTime();
  });
}

/**
 * Returns a sorted list of bills due within the next 7 days (including today).
 * Bills are advanced using calculateNextDueDate to find their *next* payment cycle.
 */
export function getWeeklyBillSummary(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const next7DaysEnd = addDays(today, 6);

  const billsWithDate = allBills
    .map((bill) => {
      if (!bill.startDate) return null;

      const dueDateObj = calculateNextDueDate(bill.startDate, bill.frequency);

      if (isNaN(dueDateObj.getTime())) return null;

      return {
        ...bill,
        dueDateObj,
        isOverdue: dueDateObj.getTime() < today.getTime(),
      } as BillWithDueDate;
    })
    .filter((bill): bill is BillWithDueDate => bill !== null);

  // Filter bills due within the next 7 days (today is included)
  const filteredBills = billsWithDate.filter((bill) => {
    const dueDate = bill.dueDateObj;

    return (
      dueDate.getTime() >= today.getTime() &&
      dueDate.getTime() <= next7DaysEnd.getTime()
    );
  });

  // Sort bills by due date (earliest first)
  return filteredBills.sort(
    (a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()
  );
}

/**
 * Calculates the recommended weekly savings target using a hybrid budgeting algorithm.
 */
export function getWeeklySavingsPlan(allBills: Bill[]) {
  const totalMonthlyBill = calculateBillTotal(allBills);
  const weeklyAverageTarget = totalMonthlyBill / 4;

  const billsDueThisWeekList = getWeeklyBillSummary(allBills);
  const billsDueThisWeekTotal = calculateBillTotal(billsDueThisWeekList);

  const finalWeeklyTarget = Math.max(
    weeklyAverageTarget,
    billsDueThisWeekTotal
  );
  const futureBufferContribution = finalWeeklyTarget - billsDueThisWeekTotal;

  return {
    finalWeeklyTarget,
    billsDueThisWeekTotal,
    weeklyAverageTarget,
    futureBufferContribution,
    billsDueThisWeekList,
  };
}
