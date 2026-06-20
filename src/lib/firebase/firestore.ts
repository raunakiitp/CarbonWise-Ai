/**
 * @fileoverview Firestore CRUD operations with type safety
 * All operations use typed converters and real-time listeners
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type { CarbonResult, Goal, GreenAction, ChallengeParticipation, UserProgress } from "@/types";

// ============================================================
// CARBON RESULTS
// ============================================================

export async function saveCarbonResult(result: CarbonResult): Promise<string> {
  const ref = await addDoc(collection(db, "carbonResults"), {
    ...result,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

export async function getLatestCarbonResult(userId: string): Promise<CarbonResult | null> {
  const q = query(
    collection(db, "carbonResults"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return convertTimestamps(snap.docs[0].data()) as CarbonResult;
}

export async function getCarbonHistory(userId: string, months = 6): Promise<CarbonResult[]> {
  const q = query(
    collection(db, "carbonResults"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(months)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => convertTimestamps(d.data()) as CarbonResult);
}

export function subscribeToCarbonResults(
  userId: string,
  callback: (results: CarbonResult[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "carbonResults"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(12)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) } as CarbonResult)));
  });
}

// ============================================================
// GOALS
// ============================================================

export async function createGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "goals"), {
    ...goal,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  await updateDoc(doc(db, "goals", id), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, "goals", id));
}

export function subscribeToGoals(
  userId: string,
  callback: (goals: Goal[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "goals"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) } as Goal)));
  });
}

// ============================================================
// GREEN ACTIONS
// ============================================================

export async function logGreenAction(action: Omit<GreenAction, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "greenActions"), {
    ...action,
    date: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToActions(
  userId: string,
  callback: (actions: GreenAction[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "greenActions"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) } as GreenAction)));
  });
}

// ============================================================
// CHALLENGE PARTICIPATION
// ============================================================

export async function joinChallenge(
  participation: Omit<ChallengeParticipation, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "challengeParticipations"), {
    ...participation,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateChallengeProgress(
  id: string,
  progress: number,
  carbonSaved: number
): Promise<void> {
  await updateDoc(doc(db, "challengeParticipations", id), { progress, carbonSaved });
}

export async function getUserParticipations(userId: string): Promise<ChallengeParticipation[]> {
  const q = query(
    collection(db, "challengeParticipations"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) } as ChallengeParticipation));
}

// ============================================================
// USER PROGRESS
// ============================================================

export async function saveUserProgress(progress: UserProgress): Promise<void> {
  await setDoc(doc(db, "userProgress", progress.userId), progress, { merge: true });
}

export async function getUserProgressData(userId: string): Promise<UserProgress | null> {
  const snap = await getDoc(doc(db, "userProgress", userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProgress;
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Convert Firestore Timestamps to Date objects recursively
 */
function convertTimestamps(data: DocumentData): DocumentData {
  const result: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = convertTimestamps(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
