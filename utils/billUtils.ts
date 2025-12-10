import { Bill } from "@/services/bill";
import {
  addDays,
  addMonths,
  addWeeks,
  isPast,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";

/**
 * Returns a sorted list of bills due within the next 7 days.
 * Each bill is augmented with its next due date.
 */
export function getWeeklyBillSummary(allBills: Bill[]) {
  const today = startOfDay(new Date());
  const next7DaysEnd = addDays(today, 7);

  const billsWithDate = allBills
    .map((bill) => {
      if (!bill.startDate) return null;
      const dueDateObj = calculateNextDueDate(bill.startDate, bill.frequency);
      if (isNaN(dueDateObj.getTime())) return null;
      return { ...bill, dueDateObj };
    })
    .filter((bill): bill is Bill & { dueDateObj: Date } => bill !== null);

  // Filter bills due within the next 7 days
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
 * Calculates the total amount for a list of bills.
 */
export function calculateWeeklyBillTotal(weeklyBills: Bill[]) {
  return weeklyBills.reduce((total, bill) => total + bill.amount, 0);
}

/**
 * Calculates the recommended weekly savings target using a hybrid budgeting algorithm.
 * Returns the target, actual urgent bills, average, buffer, and the list of urgent bills.
 */
export function getWeeklySavingsPlan(allBills: Bill[]) {
  // Total of all bills (assumed monthly)
  const totalMonthlyBill = allBills.reduce(
    (total, bill) => total + bill.amount,
    0
  );

  // Average weekly target based on monthly total
  const weeklyAverageTarget = totalMonthlyBill / 4;

  // Bills due this week and their total
  const billsDueThisWeekList = getWeeklyBillSummary(allBills);
  const billsDueThisWeekTotal = calculateWeeklyBillTotal(billsDueThisWeekList);

  // Final target is the higher of the average or urgent bills
  const finalWeeklyTarget = Math.max(
    weeklyAverageTarget,
    billsDueThisWeekTotal
  );

  // Buffer is the difference between target and urgent bills
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
 * Calculates the next due date for a bill based on its original date and frequency.
 * Handles Weekly, Fortnightly, Monthly, Quarterly, Annual, and One-Time.
 */
export function calculateNextDueDate(
  originalDateIso: string,
  frequency: string
): Date {
  let nextDate = startOfDay(parseISO(originalDateIso));
  const today = startOfDay(new Date());

  if (isNaN(nextDate.getTime())) {
    return today; // Prevent crash if date is invalid
  }

  // Increment nextDate until it's today or in the future
  while (nextDate.getTime() < today.getTime()) {
    switch (frequency) {
      case "Weekly":
        nextDate = addWeeks(nextDate, 1);
        break;
      case "Fortnightly":
        nextDate = addWeeks(nextDate, 2);
        break;
      case "Monthly":
      case "monthly":
        nextDate = addMonths(nextDate, 1);
        break;
      case "Quarterly":
        nextDate = addMonths(nextDate, 3);
        break;
      case "Annual":
        nextDate = addMonths(nextDate, 12);
        break;
      default:
        // For One-Time or unknown, return the original date
        return nextDate;
    }
  }

  return nextDate;
}

/**
 * Returns all bills that have been marked as paid in the current month.
 */
export function getPaidBillsThisMonth(allBills: Bill[]): Bill[] {
  const today = new Date();

  return allBills.filter((bill) => {
    if (!bill.lastPaidDate) return false;
    const paidDate = parseISO(bill.lastPaidDate);
    return isSameMonth(paidDate, today);
  });
}

/**
 * Filters and sorts bills that are due within the current calendar month
 * and are NOT marked as paid for this month.
 */
export function getMonthlyUpcomingBills(
  allBills: Bill[]
): (Bill & { dueDateObj: Date; isOverdue: boolean })[] {
  const today = startOfDay(new Date());

  const billsWithDate = allBills
    .map((bill) => {
      if (!bill.startDate) {
        return null;
      }

      // 1. Calculate the official next due date (Jan 2nd/8th in your case)
      const dueDateObj = calculateNextDueDate(bill.startDate, bill.frequency);

      if (isNaN(dueDateObj.getTime())) {
        return null;
      }

      let isOverdue = false;
      let effectiveDueDate = dueDateObj;

      // Determine the date to compare against TODAY to find missed cycles.
      // Use lastPaidDate if available; otherwise, use the initial startDate.
      const comparisonDate = bill.lastPaidDate
        ? startOfDay(parseISO(bill.lastPaidDate))
        : startOfDay(parseISO(bill.startDate));

      // The due date for the *current* cycle must have been missed.
      // We check if the next expected due date (comparisonDate + 1 cycle) is in the past.

      // 2. Determine the date the bill was DUE FOR THIS CURRENT CYCLE
      let lastExpectedDueDate: Date | undefined;
      let tempDate = startOfDay(parseISO(bill.startDate));

      // Advance the date to the most recent date that is PAST DUE
      // This calculates the payment that was just missed (Dec 2nd, Dec 8th)
      while (tempDate.getTime() < today.getTime()) {
        lastExpectedDueDate = tempDate;
        switch (bill.frequency) {
          case "Weekly":
            tempDate = addWeeks(tempDate, 1);
            break;
          case "Fortnightly":
            tempDate = addWeeks(tempDate, 2);
            break;
          case "Monthly":
          case "monthly":
            tempDate = addMonths(tempDate, 1);
            break;
          case "Quarterly":
            tempDate = addMonths(tempDate, 3);
            break;
          case "Annual":
            tempDate = addMonths(tempDate, 12);
            break;
          default:
            tempDate = today; // Stop loop
        }
      }

      // If the last expected payment date (e.g., Dec 8th) is BEFORE today,
      // AND it hasn't been paid this cycle (checked later by ID),
      // it is overdue, even though the official next date is Jan 8th.
      if (lastExpectedDueDate && isPast(lastExpectedDueDate)) {
        isOverdue = true;
        // Use the missed date (Dec 2nd/8th) for the effective date
        effectiveDueDate = lastExpectedDueDate;
      } else {
        // If not a missed cycle, use the standard check for bills due today
        isOverdue = isPast(dueDateObj);
        effectiveDueDate = dueDateObj;
      }

      return { ...bill, dueDateObj: effectiveDueDate, isOverdue };
    })
    .filter(
      (bill): bill is Bill & { dueDateObj: Date; isOverdue: boolean } =>
        bill !== null
    );

  // 3. FINAL FILTER: Include all bills that are Overdue OR due in the current month.
  // By setting effectiveDueDate to the missed date (e.g., Dec 8th), the isSameMonth check works!
  const filteredBills = billsWithDate.filter((bill) => {
    const isDueThisMonth = isSameMonth(bill.dueDateObj, today);
    // 💡 FIX: This filter will now correctly catch the Dec 2nd/8th bills
    // because their effectiveDueDate is set to Dec 2nd/8th (in the current month).
    return isDueThisMonth || bill.isOverdue;
  });

  // 4. SORTING: Overdue first, then chronological (Earliest date first).
  const sortedBills = filteredBills.sort((a, b) => {
    // 1. Overdue bills (true) come first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    // 2. Earliest date first (a - b)
    return a.dueDateObj.getTime() - b.dueDateObj.getTime();
  });

  return sortedBills;
}
