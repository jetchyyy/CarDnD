import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export const loginSession = () => {
    const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const expiry = now + sevenDays;
      localStorage.setItem("Session",expiry.toString())
}

export const logoutSession = async () => {
  const expiry = localStorage.getItem("Session");
  const now = Date.now();

  if (!expiry || now > Number(expiry)) {
    localStorage.removeItem("Session");
    await signOut(auth);
  }
};