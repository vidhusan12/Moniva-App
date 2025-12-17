import { create } from "zustand";

import { Bill, fetchAllBill } from "@/services/bill";
import { Income, fetchAllIncome } from "@/services/income";
import { Transaction, fetchAllTransaction } from "@/services/transaction";

// 🏆 FIXED: The interface now includes all optimistic actions
interface FinanceState {
  // Data Arrays (The source of truth)
  incomes: Income[];
  bills: Bill[];
  transactions: Transaction[];

  // State Flags
  loading: boolean; // General loading state for initial load

  // Actions
  loadInitialData: () => Promise<void>; // Loads all data at once
  refetchBills: () => Promise<void>;
  refetchIncomes: () => Promise<void>;
  refetchTransactions: () => Promise<void>;

  // --- NEW OPTIMISTIC ACTIONS (Added to Interface) ---
  // Transactions
  optimisticallyAddTransaction: (transaction: Transaction) => void;
  optimisticallyRemoveTransaction: (tempId: string) => void;
  // Bills
  optimisticallyAddBill: (bill: Bill) => void;
  optimisticallyRemoveBill: (tempId: string) => void;
  // Incomes
  optimisticallyAddIncome: (income: Income) => void;
  optimisticallyRemoveIncome: (tempId: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  incomes: [],
  bills: [],
  transactions: [],
  loading: false, // Initial state

  // 1. Load All Data (for index.tsx)
  loadInitialData: async () => {
    // Only load if the store is empty (e.g., check for bills)
    if (get().bills.length > 0) return;

    set({ loading: true });
    try {
      const [incomeData, billData, transactionData] = await Promise.all([
        fetchAllIncome(),
        fetchAllBill(),
        fetchAllTransaction(),
      ]);
      set({
        incomes: incomeData,
        bills: billData,
        transactions: transactionData,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load initial data:", error);
      set({ loading: false });
    }
  },

  // 2. Focused Refetchers (for specific screen updates)
  refetchBills: async () => {
    const billData = await fetchAllBill();
    set({ bills: billData });
  },

  refetchIncomes: async () => {
    const incomeData = await fetchAllIncome();
    set({ incomes: incomeData });
  },

  refetchTransactions: async () => {
    const transactionData = await fetchAllTransaction();
    set({ transactions: transactionData });
  },

  // --- OPTIMISTIC IMPLEMENTATIONS ---

  // Transactions
  optimisticallyAddTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [
        { ...transaction, _id: `temp-${Date.now()}` },
        ...state.transactions,
      ],
    }));
  },
  optimisticallyRemoveTransaction: (tempId: string) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t._id !== tempId),
    }));
  },

  // Bills (NEW)
  optimisticallyAddBill: (bill: Bill) => {
    set((state) => ({
      bills: [
        { ...bill, _id: `temp-${Date.now()}` },
        ...state.bills,
      ],
    }));
  },
  optimisticallyRemoveBill: (tempId: string) => {
    set((state) => ({
      bills: state.bills.filter((b) => b._id !== tempId),
    }));
  },

  // Incomes (NEW)
  optimisticallyAddIncome: (income: Income) => {
    set((state) => ({
      incomes: [
        { ...income, _id: `temp-${Date.now()}` },
        ...state.incomes,
      ],
    }));
  },
  optimisticallyRemoveIncome: (tempId: string) => {
    set((state) => ({
      incomes: state.incomes.filter((i) => i._id !== tempId),
    }));
  },
}));