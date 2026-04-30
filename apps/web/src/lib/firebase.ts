"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const envOrFallback = (value: string | undefined, fallback: string) => {
  if (!value || value.startsWith("your-") || value.includes("your-project")) {
    return fallback;
  }
  return value;
};

const firebaseConfig = {
  apiKey: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "AIzaSyDBgZYTr7PAfEI83hDcXDJ8LQb5GMFn3Ts",
  ),
  authDomain: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "caresphere-9b92c.firebaseapp.com",
  ),
  projectId: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "caresphere-9b92c",
  ),
  storageBucket: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    "caresphere-9b92c.firebasestorage.app",
  ),
  messagingSenderId: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    "295043672978",
  ),
  appId: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    "1:295043672978:web:ce1ade18f5fc7d3c4f2f4b",
  ),
  measurementId: envOrFallback(
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    "G-P6BDLWX2T5",
  ),
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const firebaseAuth = getAuth(app);

export async function signInWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return {
    idToken: await credential.user.getIdToken(),
    email: credential.user.email || "",
    displayName: credential.user.displayName || "",
    photoURL: credential.user.photoURL || "",
  };
}

export function splitDisplayName(displayName: string) {
  const [firstName = "", ...lastNameParts] = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}
