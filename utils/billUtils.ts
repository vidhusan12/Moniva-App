import { Bill } from "@/services/bill";
import { parseISO, startOfDay, addDays } from "date-fns";
import { getWeekEnd, getWeekStart } from "./dateUtils";

/**
 * 1. Filters and sorts bills that are due within the current calendar week.
 * This is the function that was missing!
 */
export function getWeeklyBillSummary(allBills: Bill[]) {

  const today = startOfDay(new Date());
  const next7DaysEnd = addDays(today, 7);

  // Map: Convert the bill's startDate string to a reliable Date object (dueDateObj)
  const billsWithDate = allBills
    .map((bill) => {
      if (!bill.startDate) {
        return null; // Skip if date is missing
      }
      const dueDateObj = startOfDay(parseISO(bill.startDate));
      if (isNaN(dueDateObj.getTime())) {
        return null; // Skip if date is invaild
      }
      return { ...bill, dueDateObj };
    })
    .filter((bill): bill is Bill & { dueDateObj: Date } => bill !== null);

  // Filter: Keep bills where dueDateObj is >= thisWeekStart AND <= thisWeekEnd.
  const filteredBills = billsWithDate.filter((bill) => {
    const dueDate = bill.dueDateObj;
    const isWithinWeek =
      dueDate.getTime() >= today.getTime() &&
      dueDate.getTime() <= next7DaysEnd.getTime();
    return isWithinWeek;
  });

  // Sort: Sort the filtered bills by due date (Earliest First)
  const sortedBills = filteredBills.sort(
    (a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()
  );

  return sortedBills;
}

/**
 * 2. Calculates the total cost of a list of bills.
 */
export function calculateWeeklyBillTotal(weeklyBills: Bill[]) {
  return weeklyBills.reduce((total, bill) => total + bill.amount, 0);
}

/**
 * 3. The main Hybrid Budgeting Algorithm.
 */
export function getWeeklySavingsPlan(allBills: Bill[]) {
  // 1. Calculate the Monthly Total
  const totalMonthlyBill = allBills.reduce(
    (total, bill) => total + bill.amount,
    0
  );

  // 2. Calculate the Security Baseline (Weekly Average)
  const weeklyAverageTarget = totalMonthlyBill / 4;

  // 3. Get the list of bills due this week (using the function defined above!)
  const billsDueThisWeekList = getWeeklyBillSummary(allBills);

  // 4. Calculate the total dollar amount for this week's urgent bills
  const billsDueThisWeekTotal = calculateWeeklyBillTotal(billsDueThisWeekList);

  // 5. Determine the Final Savings Target (MAX of Urgency vs. Average)
  const finalWeeklyTarget = Math.max(
    weeklyAverageTarget,
    billsDueThisWeekTotal
  );

  // 6. Calculate the Buffer Contribution
  const futureBufferContribution = finalWeeklyTarget - billsDueThisWeekTotal;

  return {
    finalWeeklyTarget,
    billsDueThisWeekTotal,
    weeklyAverageTarget,
    futureBufferContribution,
    billsDueThisWeekList,
  };
}
