import { create } from "zustand";
import { auth } from "@/config/firebase"; 
import { FinanceService } from "@/services/financeService"; 
import { Bill, Income, Transaction } from "@/types/database";

// 🏆 Interface: Defines what the store holds and what it can do
interface FinanceState {
  incomes: Income[];
  bills: Bill[];
  transactions: Transaction[];
  loading: boolean;
  onboardingDraft: {
    walletBalance: number | null;
    income: any | null;
    bills: any[];
    savings: any[];
  };

  // Actions
  loadInitialData: () => Promise<void>;
  refetchBills: () => Promise<void>;
  refetchIncomes: () => Promise<void>;
  refetchTransactions: () => Promise<void>;

  // Optimistic Actions
  optimisticallyAddTransaction: (transaction: Transaction) => void;
  optimisticallyRemoveTransaction: (tempId: string) => void;
  optimisticallyAddBill: (bill: Bill) => void;
  optimisticallyRemoveBill: (tempId: string) => void;
  optimisticallyAddIncome: (income: Income) => void;
  optimisticallyRemoveIncome: (tempId: string) => void;


}



export const useFinanceStore = create<FinanceState>((set, get) => ({
  incomes: [],
  bills: [],
  transactions: [],
  loading: false,
  onboardingDraft: {
    walletBalance: null,
    income: null,
    bills: [],
    savings: []
  },

  // 1️⃣ TOP: Initial Load Logic
  // Why async: Fetching from Firebase is a network request that takes time.
  loadInitialData: async () => {
    const user = auth.currentUser;
    // Guard: Prevent fetching if user is logged out (Firebase needs user.uid)
    if (!user) return;

    set({ loading: true });
    try {
      // Promise.all runs all three fetches at the same time for speed
      const [incomeData, billData, transactionData] = await Promise.all([
        FinanceService.getAllItems<Income>("incomes", user.uid),
        FinanceService.getAllItems<Bill>("bills", user.uid),
        FinanceService.getAllItems<Transaction>("transactions", user.uid),
      ]);

      set({
        incomes: incomeData,
        bills: billData,
        transactions: transactionData,
        loading: false,
      });
    } catch (error) {
      console.error("Store Error: Initial Load Failed", error);
      set({ loading: false });
    }
  },

  // 2️⃣ MIDDLE: Refetchers (Pointed to Firebase)
  refetchBills: async () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = await FinanceService.getAllItems<Bill>("bills", user.uid);
    set({ bills: data });
  },

  refetchIncomes: async () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = await FinanceService.getAllItems<Income>("incomes", user.uid);
    set({ incomes: data });
  },

  refetchTransactions: async () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = await FinanceService.getAllItems<Transaction>("transactions", user.uid);
    set({ transactions: data });
  },

  // 3️⃣ BOTTOM: Optimistic Logic (CLEANED)
  // Logic: We use 'id' (Firebase style) instead of '_id' (Mongo style)
  
  optimisticallyAddBill: (bill: Bill) => {
    set((state) => ({
      bills: [
        { ...bill, id: `temp-${Date.now()}` }, // id matches Firebase property
        ...state.bills,
      ],
    }));
  },

  optimisticallyRemoveBill: (tempId: string) => {
    set((state) => ({
      // Filter out the item using the correct 'id' property
      bills: state.bills.filter((b) => b.id !== tempId),
    }));
  },

  optimisticallyAddTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [{ ...transaction, id: `temp-${Date.now()}` }, ...state.transactions],
    }));
  },

  optimisticallyRemoveTransaction: (tempId: string) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== tempId),
    }));
  },

  optimisticallyAddIncome: (income: Income) => {
    set((state) => ({
      incomes: [{ ...income, id: `temp-${Date.now()}` }, ...state.incomes],
    }));
  },

  optimisticallyRemoveIncome: (tempId: string) => {
    set((state) => ({
      incomes: state.incomes.filter((i) => i.id !== tempId),
    }));
  },
}));