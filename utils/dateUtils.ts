import {
  endOfWeek,
  format,
  getWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const date = new Date();
// Week options (Monday is first day)
const options = { weekStartsOn: 1 as const };

// Get which week of the month (1,2,3 or 4)
export function getCurrentWeekOfMonth() {
  const currentWeekNumberOfYear = getWeek(date, options);
  const firstDayOfMonth = startOfMonth(date);
  const firstWeekNumberOfYear = getWeek(firstDayOfMonth, options);
  const currentWeekOfMonth =
    currentWeekNumberOfYear - firstWeekNumberOfYear + 1;

  return currentWeekOfMonth;
}

// Get formatted date range (9 Dec - 15 Dec)
export function getWeekDateRange() {
  const monday = startOfWeek(date, options);
  const sunday = endOfWeek(date, options);
  const formattedMonday = format(monday, "d MMM");
  const formattedSunday = format(sunday, "d MMM");
  const dateRange = `${formattedMonday} - ${formattedSunday}`;

  return dateRange;
}

export function getWeekStart(date = new Date()) {
  return startOfWeek(date, options);
}

export function getWeekEnd(date = new Date()) {
  return endOfWeek(date, options);
}
