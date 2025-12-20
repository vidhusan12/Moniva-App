// types/database.ts

export type Transaction = {
  id?: string; // Firebase uses 'id', not '_id'
  description: string;
  amount: number;
  category: string;
  date?: any; // Can be a string or Firebase Timestamp
  userId: string; // Vital for security!
};

export type Bill = {
  id?: string;
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  date: string;
  status: "paid" | "unpaid";
  lastPaidDate?: string;
  userId: string;
};

export type Income = {
  id?: string;
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  date: string;
  userId: string;
};
