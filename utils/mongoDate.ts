import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

export const formatMongoDate = (isoDate: string): string => {
  try {
    const date = startOfDay(parseISO(isoDate));
    return format(date, "dd/MM/yyyy");
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Error";
  }
};

export const calculateDaysUntilPay = (nextPayIsoDate: string): string => {
  try {
    const nextPayDate = startOfDay(parseISO(nextPayIsoDate));
    const today = startOfDay(new Date());

    const diffDays = differenceInDays(nextPayDate, today);

    if (diffDays === 0) {
      return "Pay due today";
    } else if (diffDays < 0) {
      return "Payment overdue";
    } else {
      return `${diffDays} days`;
    }
  } catch (e) {
    console.error("Error calculating days until pay:", e);
    return "Date Error";
  }
};
