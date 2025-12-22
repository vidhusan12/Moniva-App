import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Bill, SavingsGoal, Income } from "@/types/database";

// 🏆 Logic: Defined list of allowed folders
type AllowedCollections =
  | "bills"
  | "incomes"
  | "transactions"
  | "savings"
  | "users";

export const FinanceService = {
  /**
   * addItem: Adds a new record to the cloud.
   */
  async addItem(
    collectionName: AllowedCollections,
    userId: string,
    data: any
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
    collectionName: AllowedCollections,
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
    collectionName: AllowedCollections,
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
    collectionName: AllowedCollections,
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
    collectionName: AllowedCollections,
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

  // OnBoarding - Atomic Batch Write
  async finishOnboarding(userId: string, draftData: any) {
    // 1 - Create the "Shopping Cart" (Batch)
    const batch = writeBatch(db);

    // 2 - Add the Wallet Balance (Profile Update)
    const profileRef = doc(db, "users", userId);
    batch.set(
      profileRef,
      {
        currentBalance: draftData.walletBalance,
        isOnboardingComplete: true,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. Add Incomes (Safety Check: || [])
    (draftData.incomes || []).forEach((income: Income) => {
      const docRef = doc(collection(db, "users", userId, "incomes")); // New auto-ID
      batch.set(docRef, income);
    });

    // 4. Add Bills
    (draftData.bills || []).forEach((bill: Bill) => {
      const docRef = doc(collection(db, "users", userId, "bills"));
      batch.set(docRef, bill);
    });

    // 5. Add Savings
    (draftData.savings || []).forEach((saving: SavingsGoal) => {
      const docRef = doc(collection(db, "users", userId, "savings"));
      batch.set(docRef, saving);
    });

    // 6. "Checkout" - Commit all changes at once
    await batch.commit();
  },
};