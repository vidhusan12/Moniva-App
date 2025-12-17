export type Bill = {
  _id?: string;
  amount: number;
  description: string;
  frequency: string;
  startDate: string;           
  originalDueDate?: string;     
  date?: string;
  lastPaidDate?: string;
};

type UpdateBillData = Partial<Bill>; // have access to any fiels from Bill but none are required

const API_URL = "https://moniva-backend.onrender.com";

// Adding new Bill to the database
export const addBill = async (billData: Bill): Promise<Bill> => {
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

//  Gets all the bills from the database - NOW ROBUST
export const fetchAllBill = async (): Promise<Bill[]> => {
  const response = await fetch(`${API_URL}/api/bills`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  // 🏆 Added Try/Catch: Handles case where server returns status 200 (OK) but non-JSON data
  try {
    return await response.json();
  } catch (e) {
    const rawText = await response.text();
    console.error("JSON Parse Error on fetchAllBill. Raw Text:", rawText);
    // Throw error based on status code and raw text
    throw new Error(`Failed to parse bill list: Server returned non-JSON data.`);
  }
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

// Update Bill - NOW ROBUST (The primary fix for the JSON Parse Error)
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
    let errorMessage = `Failed to update bill with status: ${response.status}`;
    
    // 🏆 The FIX: Try to parse JSON, but fall back to raw text if it causes a SyntaxError
    try {
      const errorBody = await response.json();
      // If parsing succeeded, use the server's message
      errorMessage = errorBody.message || errorMessage;
    } catch (e) {
      // If parsing failed (due to non-JSON body like "Server Error"), read raw text instead
      const rawText = await response.text();
      console.error("API Error Body (Non-JSON):", rawText);
      errorMessage = `Server Error: ${rawText.substring(0, 50)}...`;
    }
    
    throw new Error(errorMessage);
  }
  // No return is needed here as the function is Promise<void>
};

// Fetch bill by id
export const fetchBillById = async (id: string): Promise<Bill> => {
  const response = await fetch(`${API_URL}/api/bills/${id}`);

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch bill with status ${response.status}`
    );
  }

  return await response.json();
};