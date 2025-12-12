import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

/**
 * Converts a Date to 'YYYY-MM-DD' format for MongoDB.
 * Prevents timezone shifts by using local time instead of .toISOString().
 */
export function formatDateForMongo(date: Date | string): string {
  const dateObject = typeof date === "string" ? parseISO(date) : date;

  if (isNaN(dateObject.getTime())) {
    return "";
  }

  return format(dateObject, "yyyy-MM-dd");
}

/**
 * Converts MongoDB ISO date string to localized display format (DD/MM/YYYY).
 */
export function formatMongoDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "";
  }

  const dateObject = parseISO(dateString);

  if (isNaN(dateObject.getTime())) {
    return "";
  }

  return format(dateObject, "dd/MM/yyyy");
}

/**
 * Calculates days until a payment is due.
 * Returns a human-readable string.
 */
export function calculateDaysUntilPay(nextPayIsoDate: string): string {
  try {
    if (!nextPayIsoDate || nextPayIsoDate.trim() === "") {
      return "No date set";
    }

    const nextPayDate = startOfDay(parseISO(nextPayIsoDate));
    const today = startOfDay(new Date());

    if (isNaN(nextPayDate.getTime())) {
      return "Invalid date";
    }

    const diffDays = differenceInDays(nextPayDate, today);

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else {
      return `${diffDays} days`;
    }
  } catch (e) {
    console.error("Error calculating days until pay:", e);
    return "Date error";
  }
}

/**
 * Formats a date to a friendly display:
 * - "Today" for today's date
 * - "Yesterday" for yesterday
 * - "DD/MM/YYYY" for older dates
 */
export function formatFriendlyDate(
  dateString: string | null | undefined
): string {
  if (!dateString) {
    return "";
  }

  const dateObject = parseISO(dateString);

  if (isNaN(dateObject.getTime())) {
    return "";
  }

  const today = startOfDay(new Date());
  const inputDate = startOfDay(dateObject);
  const daysDiff = differenceInDays(today, inputDate);

  if (daysDiff === 0) {
    return "Today";
  } else if (daysDiff === 1) {
    return "Yesterday";
  } else {
    return format(inputDate, "dd/MM/yyyy");
  }
}
