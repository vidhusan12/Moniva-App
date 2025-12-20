import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

// 🏆 Logic: Define the list of allowed folders once to make it easier to update
type AllowedCollections = "bills" | "incomes" | "transactions" | "users";

export const FinanceService = {
  /**
   * addItem: Adds a new record to the cloud.
   */
  async addItem(
    collectionName: AllowedCollections, // ✅ Logic: Use the expanded list
    userId: string,
    data: any // Logic: Using 'any' here allows for User data as well as Finance data
  ) {
    try {
      const colRef = collection(db, "users", userId, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(
        `Error in FinanceService.addItem (${collectionName}):`,
        error
      );
      throw error;
    }
  },

  /**
   * updateItem: Edits an existing record.
   */
  async updateItem(
    collectionName: AllowedCollections, // ✅ Logic: Use the expanded list
    userId: string,
    itemId: string,
    data: any
  ) {
    try {
      const docRef = doc(db, "users", userId, collectionName, itemId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error in FinanceService.updateItem:", error);
      throw error;
    }
  },

  /**
   * getItemById: Fetches raw data from the Cloud.
   */
  async getItemById<T>(
    collectionName: AllowedCollections, // ✅ Logic: Use the expanded list
    userId: string,
    itemId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, "users", userId, collectionName, itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error in FinanceService.getItemById:", error);
      return null;
    }
  },

  /**
   * getAllItems: Fetches everything in a sub-collection.
   */
  async getAllItems<T>(
    collectionName: AllowedCollections, // ✅ Logic: Use the expanded list
    userId: string
  ): Promise<T[]> {
    try {
      const colRef = collection(db, "users", userId, collectionName);
      const querySnapshot = await getDocs(colRef);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error in getAllItems:", error);
      throw error;
    }
  },

  /**
   * deleteItem: Removes a record permanently.
   */
  async deleteItem(
    collectionName: AllowedCollections, // ✅ Logic: Use the expanded list
    userId: string,
    itemId: string
  ) {
    try {
      const docRef = doc(db, "users", userId, collectionName, itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(
        `Error in FinanceService.deleteItem (${collectionName}):`,
        error
      );
      throw error;
    }
  },
};
