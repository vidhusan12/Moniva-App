import React, { createContext, useContext, useState } from "react";

// Bill for onBoarding
export interface OnboardingBill {
  id: string;
  description: string;
  amount: string;
  frequency: string;
  date: Date;
}

// 1. Define the Shape of our Brain(TypeScript Interface)
// This tells code editors what data is available so they can autocomplete
interface UserContextType {
  balance: string;
  setBalance: (amount: string) => void;
  // Income Stuff
  incomeAmount: string;
  setIncomeAmount: (amount: string) => void;
  incomeFrequency: string;
  setIncomeFrequency: (freq: string) => void;
  nextPayDate: Date;
  setNextPayDate: (date: Date) => void;
  incomeDescription: string;
  setIncomeDescription: (text: string) => void;

  // Bill Stuff
  bills: OnboardingBill[];
  addBill: (bill: OnboardingBill) => void;
  removeBill: (id: string) => void;
}

// 2. Create teh Context (The empty box)
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3. Create the Provider (The Component that holds the data)
export function UserProvider({ children }: { children: React.ReactNode }) {
  // This state now lives "Global", not inside a specific screen
  const [balance, setBalance] = useState("");

  // Income State
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeFrequency, setIncomeFrequency] = useState("Weekly")
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [incomeDescription, setIncomeDescription] = useState("")

  // Bill State
  const [bills, setBills] = useState<OnboardingBill[]>([]);
  const addBill = (bill: OnboardingBill) => {
    setBills((prev) => [...prev, bill]);
  }
  const removeBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id))
  };

  return (
    <UserContext.Provider value={{ 
      balance, 
      setBalance, 
      incomeAmount, 
      setIncomeAmount,
      incomeFrequency,
      setIncomeFrequency,
      nextPayDate,
      setNextPayDate,
      incomeDescription,
      setIncomeDescription,
      bills,
      addBill,
      removeBill
    }}>
      {children}
    </UserContext.Provider>
  );
}

// 4. Create a Custom Hook (The easy way to access the brain)
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}