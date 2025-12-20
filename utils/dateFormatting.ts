import {
  differenceInDays,
  endOfWeek,
  format,
  getWeek,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

// 📅 Global Config: Monday is the first day of the week
const options = { weekStartsOn: 1 as const };

/**
 * getCurrentWeekOfMonth: Identifies if we are in Week 1, 2, 3, or 4.
 */
export function getCurrentWeekOfMonth() {
  const now = new Date();
  const currentWeekNumberOfYear = getWeek(now, options);
  const firstDayOfMonth = startOfMonth(now);
  const firstWeekNumberOfYear = getWeek(firstDayOfMonth, options);
  
  return currentWeekNumberOfYear - firstWeekNumberOfYear + 1;
}

/**
 * getWeekDateRange: Returns a string like "15 Dec - 21 Dec".
 */
export function getWeekDateRange() {
  const now = new Date();
  const monday = startOfWeek(now, options);
  const sunday = endOfWeek(now, options);
  
  const formattedMonday = format(monday, "d MMM");
  const formattedSunday = format(sunday, "d MMM");
  
  return `${formattedMonday} - ${formattedSunday}`;
}

/**
 * formatDisplayDate: Standardizes ISO strings to DD/MM/YYYY.
 */
export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const dateObject = parseISO(dateString);
    if (isNaN(dateObject.getTime())) return "Invalid Date";
    return format(dateObject, "dd/MM/yyyy");
  } catch (e) {
    return "Invalid Date";
  }
}

/**
 * formatFriendlyDate: Returns "Today", "Yesterday", or the date.
 */
export function formatFriendlyDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const dateObject = parseISO(dateString);
    if (isNaN(dateObject.getTime())) return "";

    const today = startOfDay(new Date());
    const inputDate = startOfDay(dateObject);
    const daysDiff = differenceInDays(today, inputDate);

    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Yesterday";
    return format(inputDate, "dd/MM/yyyy");
  } catch (e) {
    return "";
  }
}

// 🔄 Legacy Support: Alias the old name to the new function
// This stops the "Cannot find formatMongoDate" error in your tabs.
export const formatMongoDate = formatDisplayDate;