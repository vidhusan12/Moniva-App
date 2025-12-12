export type Transaction = {
  _id?: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
};

type UpdateTransactionData = Partial<Transaction>;

const API_URL = "https://moniva-backend.onrender.com";

// Adding New Transaction to the database
export const addTransaction = async (
  transactionData: Transaction
): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactionData),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Get all the transactions from the database
export const fetchAllTransaction = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/api/transactions`);

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  return await response.json();
};

// Get single transaction from the database
export const fetchTransactionById = async (
  id: string
): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/api/transactions`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Delete transaction from database
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/transactions`);

  if (!response.ok) {
    throw new Error(`Error: Failed to delete transaction, ${response.status}`);
  }
};

// Update transaction
export const updateTransaction = async (
  id: string,
  data: UpdateTransactionData
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.message ||
        `Failed to update transaction with status: ${response.status}`
    );
  }
};
