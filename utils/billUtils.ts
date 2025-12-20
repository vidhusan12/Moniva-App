import { Bill } from "@/types/database"; 
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
 * Logic: Uses 'id' (Firebase) instead of '_id' (Mongo).
 */
function mapBillsWithDueDate(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());

  return allBills
    .map((bill) => {
      // Logic: Ensure startDate exists before parsing
      if (!bill.startDate) return null;

      const rawDueDate = startOfDay(parseISO(bill.startDate));

      if (isNaN(rawDueDate.getTime())) {
        // Use bill.id for robust logging
        console.warn(`Invalid date for bill ${bill.id}:`, bill.startDate);
        return null;
      }

      const isOverdue = rawDueDate.getTime() < today.getTime();

      return {
        ...bill,
        dueDateObj: rawDueDate,
        isOverdue,
      } as BillWithDueDate;
    })
    .filter((bill): bill is BillWithDueDate => bill !== null);
}

// --- Exported Functions ---

/**
 * Calculates the total amount for a list of bills.
 */
export function calculateBillTotal(bills: Bill[] | BillWithDueDate[]): number {
  return bills.reduce((total, bill) => total + bill.amount, 0);
}

/**
 * Calculates the next due date for a bill.
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
        return nextDate;
    }
  }

  return nextDate;
}

/**
 * Returns all bills marked as paid in the current month.
 * Logic: Matches ISO strings using date-fns isSameMonth.
 */
export function getPaidBillsThisMonth(allBills: Bill[]): Bill[] {
  const today = new Date();

  return allBills.filter((bill) => {
    if (!bill.lastPaidDate?.trim()) return false;

    try {
      const paidDate = parseISO(bill.lastPaidDate);
      if (isNaN(paidDate.getTime())) return false;
      return isSameMonth(paidDate, today);
    } catch (error) {
      console.error(`Invalid date format for bill ${bill.id}:`, error);
      return false;
    }
  });
}

/**
 * Filters and sorts bills due within the current or next month.
 */
export function getMonthlyUpcomingBills(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const nextMonth = addMonths(today, 1);
  const billsWithDate = mapBillsWithDueDate(allBills);

  const filteredBills = billsWithDate.filter((bill) => {
    if (bill.isOverdue) return true;
    const isDueThisMonth = isSameMonth(bill.dueDateObj, today);
    const isDueNextMonth = isSameMonth(bill.dueDateObj, nextMonth);
    return isDueThisMonth || isDueNextMonth;
  });

  return filteredBills.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.dueDateObj.getTime() - b.dueDateObj.getTime();
  });
}

/**
 * Filters bills due ONLY in current month or overdue.
 */
export function getBillsDueCurrentMonth(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const billsWithDate = mapBillsWithDueDate(allBills);

  return billsWithDate.filter((bill) => {
    if (bill.isOverdue) return true;
    return isSameMonth(bill.dueDateObj, today);
  });
}

/**
 * Returns bills due in the next 7 days.
 */
export function getWeeklyBillSummary(allBills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const next7DaysEnd = addDays(today, 6);

  const billsWithDate = mapBillsWithDueDate(allBills);

  const filteredBills = billsWithDate.filter((bill) => {
    const dueDate = bill.dueDateObj;
    return (
      dueDate.getTime() >= today.getTime() &&
      dueDate.getTime() <= next7DaysEnd.getTime()
    );
  });

  return filteredBills.sort(
    (a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()
  );
}

/**
 * Hybrid budgeting algorithm for weekly targets.
 */
export function getWeeklySavingsPlan(allBills: Bill[]) {
  const currentMonthBills = getBillsDueCurrentMonth(allBills);

  const totalMonthlyBill = calculateBillTotal(currentMonthBills);
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

/**
 * Gets bills due in next 7 days that aren't paid.
 */
export function getUpcomingBills(bills: Bill[]): BillWithDueDate[] {
  const today = startOfDay(new Date());
  const next7Days = addDays(today, 7);

  const billsWithDate = mapBillsWithDueDate(bills);

  return billsWithDate
    .filter((bill) => {
      const dueDate = bill.dueDateObj;
      const isDueInNext7Days =
        dueDate.getTime() >= today.getTime() &&
        dueDate.getTime() <= next7Days.getTime();

      const isPaidRecently = bill.lastPaidDate?.trim()
        ? (() => {
            try {
              const paidDate = parseISO(bill.lastPaidDate);
              return isSameMonth(paidDate, today);
            } catch {
              return false;
            }
          })()
        : false;

      return isDueInNext7Days && !isPaidRecently;
    })
    .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
}
