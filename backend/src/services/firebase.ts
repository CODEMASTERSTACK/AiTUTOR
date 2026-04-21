import { initializeApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { EvaluationResult, InterviewTurn } from "../types.js";

const memoryStore = new Map<string, { turns: InterviewTurn[]; evaluation?: EvaluationResult }>();
let firestoreEnabled = true;

function saveTurnToMemory(sessionId: string, turn: InterviewTurn) {
  const current = memoryStore.get(sessionId) ?? { turns: [] };
  current.turns.push(turn);
  memoryStore.set(sessionId, current);
}

function saveEvaluationToMemory(sessionId: string, evaluation: EvaluationResult) {
  const current = memoryStore.get(sessionId) ?? { turns: [] };
  current.evaluation = evaluation;
  memoryStore.set(sessionId, current);
}

function getConfig() {
  const {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
  } = process.env;

  if (
    !FIREBASE_API_KEY ||
    !FIREBASE_AUTH_DOMAIN ||
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_STORAGE_BUCKET ||
    !FIREBASE_MESSAGING_SENDER_ID ||
    !FIREBASE_APP_ID
  ) {
    return null;
  }

  return {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
  };
}

function getDb() {
  if (!firestoreEnabled) return null;
  const config = getConfig();
  if (!config) return null;
  const app = getApps()[0] ?? initializeApp(config);
  return getFirestore(app);
}

export async function saveTurn(sessionId: string, turn: InterviewTurn) {
  const db = getDb();
  if (!db) {
    saveTurnToMemory(sessionId, turn);
    return;
  }

  try {
    await addDoc(collection(db, "sessions", sessionId, "turns"), turn);
    await setDoc(
      doc(db, "sessions", sessionId),
      { updatedAt: Date.now() },
      { merge: true }
    );
  } catch {
    // Firestore rules or quota issues should not block demo flow.
    firestoreEnabled = false;
    saveTurnToMemory(sessionId, turn);
  }
}

export async function saveEvaluation(sessionId: string, evaluation: EvaluationResult) {
  const db = getDb();
  if (!db) {
    saveEvaluationToMemory(sessionId, evaluation);
    return;
  }

  try {
    await setDoc(
      doc(db, "sessions", sessionId),
      {
        evaluation,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch {
    firestoreEnabled = false;
    saveEvaluationToMemory(sessionId, evaluation);
  }
}

export async function getEvaluation(sessionId: string) {
  const db = getDb();
  if (!db) {
    return memoryStore.get(sessionId)?.evaluation ?? null;
  }

  try {
    const snap = await getDoc(doc(db, "sessions", sessionId));
    if (!snap.exists()) return memoryStore.get(sessionId)?.evaluation ?? null;
    return (snap.data().evaluation as EvaluationResult | undefined) ?? null;
  } catch {
    firestoreEnabled = false;
    return memoryStore.get(sessionId)?.evaluation ?? null;
  }
}
