export type Bill = {
  amount: number;
  description: string;
};

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
