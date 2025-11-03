import { db, storage, auth } from "../src/firebase/firebase";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getPayout = async () => {
  try {
    const token = auth.currentUser.getIdToken();
    const res = await fetch(`${BASE_URL}/get-payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      throw new Error(data.error || "Failed to fetch payout");
    }
  } catch (error) {
    console.error("Error fetching payout:", error);
    throw error;
  }
};
