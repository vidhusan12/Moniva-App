export type Bill = {
  _id?: string;
  amount: number;
  description: string;
  frequency: string;
  startDate?: string;
  date?: string;
  lastPaidDate?: string;
};

type UpdateBillData = Partial<Bill>; // have access to any fiels from Bill but none are required

const API_URL = "https://moniva-backend.onrender.com";

// Adding new Bill to the database
export const addBilll = async (billData: Bill): Promise<Bill> => {
  const response = await fetch(`${API_URL}/api/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(billData),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

//  Gets all the bills from the database
export const fetchAllBill = async (): Promise<Bill[]> => {
  const response = await fetch(`${API_URL}/api/bills`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Delete Bill from database
export const deleteBill = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/bills/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete ${response.status}`);
  }
};

// Update Bill
export const updateBill = async (
  id: string,
  data: UpdateBillData
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/bills/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.message ||
        `Failed to update bill with status: ${response.status}`
    );
  }
};
