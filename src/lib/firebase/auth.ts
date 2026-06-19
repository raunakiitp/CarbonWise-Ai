/**
 * @fileoverview Firebase Authentication helpers
 * Provides typed wrappers for sign-in, sign-out, and profile management
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create new account with email and password
 */
export async function createAccount(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user);
  return credential;
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  return signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Create or update user profile in Firestore
 */
export async function createUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    const profile: Omit<UserProfile, "createdAt" | "updatedAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "CarbonWise User",
      photoURL: user.photoURL ?? undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        theme: "system",
        notifications: true,
        units: "metric",
        country: "GB",
        language: "en",
      },
      sustainabilityScore: 0,
      totalCarbonSaved: 0,
      level: "Beginner",
      badges: [],
    };
    await setDoc(ref, profile);
  }
}

/**
 * Get current user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}
