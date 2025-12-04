export const formatMongoDate = (iosDate: string): string => {
  try {
    const dateObj = new Date(iosDate);

    if (isNaN(dateObj.getTime())) {
      return "Invaild Date";
    }

    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Error";
  }
};

export const calculateDaysUntilPay = (nextPayIsoDate: string): string => {
  try {
    const nextPayDate = new Date(nextPayIsoDate);
    const today = new Date();

    // Reset hours/minutes/seconds of both dates for accurate day comparison
    nextPayDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = nextPayDate.getTime() - today.getTime();
    // Convert milliseconds to days (Math.ceil rounds up, so 1.5 days is 2 days away)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
