import { create } from "zustand";
import { auth } from "@/config/firebase"; 
import { FinanceService } from "@/services/financeService"; 
import { Bill, Income, Transaction, SavingsGoal } from "@/types/database"; 

interface FinanceState {
  incomes: Income[];
  bills: Bill[];
  transactions: Transaction[];
  savings: SavingsGoal[]; 
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
  refetchSavings: () => Promise<void>; 

  // Optimistic Actions
  optimisticallyAddTransaction: (transaction: Transaction) => void;
  optimisticallyRemoveTransaction: (tempId: string) => void;
  optimisticallyAddBill: (bill: Bill) => void;
  optimisticallyRemoveBill: (tempId: string) => void;
  optimisticallyAddIncome: (income: Income) => void;
  optimisticallyRemoveIncome: (tempId: string) => void;
  optimisticallyAddSaving: (saving: SavingsGoal) => void; 
  optimisticallyRemoveSaving: (tempId: string) => void;   
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  incomes: [],
  bills: [],
  transactions: [],
  savings: [], // 🆕 Init
  loading: false,
  onboardingDraft: {
    walletBalance: null,
    income: null,
    bills: [],
    savings: []
  },

  // 1. Initial Load
  loadInitialData: async () => {
    const user = auth.currentUser;
    if (!user) return;

    set({ loading: true });
    try {
      // Added Savings fetch to Promise.all
      const [incomeData, billData, transactionData, savingsData] = await Promise.all([
        FinanceService.getAllItems<Income>("incomes", user.uid),
        FinanceService.getAllItems<Bill>("bills", user.uid),
        FinanceService.getAllItems<Transaction>("transactions", user.uid),
        FinanceService.getAllItems<SavingsGoal>("savings", user.uid),
      ]);

      set({
        incomes: incomeData,
        bills: billData,
        transactions: transactionData,
        savings: savingsData, 
        loading: false,
      });
    } catch (error) {
      console.error("Store Error: Initial Load Failed", error);
      set({ loading: false });
    }
  },

  // 2. Refetchers
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

  // Added Savings Refetcher
  refetchSavings: async () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = await FinanceService.getAllItems<SavingsGoal>("savings", user.uid);
    set({ savings: data });
  },

  // 3. Optimistic Logic
  optimisticallyAddBill: (bill) => 
    set((state) => ({ bills: [{ ...bill, id: `temp-${Date.now()}` }, ...state.bills] })),

  optimisticallyRemoveBill: (tempId) => 
    set((state) => ({ bills: state.bills.filter((b) => b.id !== tempId) })),

  optimisticallyAddTransaction: (transaction) => 
    set((state) => ({ transactions: [{ ...transaction, id: `temp-${Date.now()}` }, ...state.transactions] })),

  optimisticallyRemoveTransaction: (tempId) => 
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== tempId) })),

  optimisticallyAddIncome: (income) => 
    set((state) => ({ incomes: [{ ...income, id: `temp-${Date.now()}` }, ...state.incomes] })),

  optimisticallyRemoveIncome: (tempId) => 
    set((state) => ({ incomes: state.incomes.filter((i) => i.id !== tempId) })),

  optimisticallyAddSaving: (saving) => 
    set((state) => ({ savings: [{ ...saving, id: `temp-${Date.now()}` }, ...state.savings] })),

  optimisticallyRemoveSaving: (tempId) => 
    set((state) => ({ savings: state.savings.filter((s) => s.id !== tempId) })),
}));