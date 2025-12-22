import { SavingsGoal } from "@/types/database";


export const calculateTotalSavings = (savings: SavingsGoal[]): number => {
  if (!savings || savings.length === 0) return 0;

  // Loops through all goals and adds up the 'currentAmount'
  return savings.reduce((total, goal) => {
    return total + (goal.currentAmount || 0);
  }, 0);
};

