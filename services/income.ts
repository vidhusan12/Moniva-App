// What an income looks like
export type Income = {
  _id?: string;
  amount: number;
  description: string;
  frequency: string;
  startDate?: string;
  date?: string;
};

// Your backend URL
const API_URL = "https://moniva-backend.onrender.com";

// Add new income to database
export const addIncome = async (incomeData: Income): Promise<Income> => {
  const response = await fetch(`${API_URL}/api/incomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incomeData),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Get all incomes from database
export const fetchAllIncome = async (): Promise<Income[]> => {
  const response = await fetch(`${API_URL}/api/incomes`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Delete income from database
export const deleteIncome = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/incomes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete: ${response.status}`);
  }
};
