import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(config).every(
  (value) => typeof value === "string" && value.trim() !== ""
);

const app = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(config)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const ALLOWED_EMAILS = [
  "gabrielcostadequeiroz@gmail.com",
  "beatrizma8@gmail.com",
  "arturhenrique722@gmail.com",
  "pradoleo92@gmail.com",
  "thiagocardoso2505@gmail.com",
  "jonathassgoncalves@gmail.com",
  "marlonfernandesfranco@gmail.com",
];

export const isAllowedEmail = (email?: string | null) =>
  !!email && ALLOWED_EMAILS.includes(email.toLowerCase());