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

// Get all the transactions from the database - ROBUST
export const fetchAllTransaction = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/api/transactions`);

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  // 🏆 ROBUST FETCH: Try/Catch for non-JSON success response
  try {
    return await response.json();
  } catch (e) {
    const rawText = await response.text();
    console.error(
      "JSON Parse Error on fetchAllTransaction. Raw Text:",
      rawText
    );
    throw new Error(
      `Failed to parse transaction list: Server returned non-JSON data.`
    );
  }
};

// Get single transaction from the database
export const fetchTransactionById = async (
  id: string
): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Delete transaction from database
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error: Failed to delete transaction, ${response.status}`);
  }
};

// Update transaction - ROBUST
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
    let errorMessage = `Failed to update transaction with status: ${response.status}`;

    // 🏆 ROBUST ERROR: Try JSON, but fall back to raw text if parsing fails
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch (e) {
      const rawText = await response.text();
      console.error("API Error Body (Non-JSON):", rawText);
      errorMessage = `Server Error: ${rawText.substring(0, 50)}...`;
    }

    throw new Error(errorMessage);
  }
};
