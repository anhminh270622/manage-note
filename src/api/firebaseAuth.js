import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseAuthConfigured = () => requiredConfig.every(Boolean);

const getFirebaseApp = () => {
  if (!isFirebaseAuthConfigured()) {
    throw new Error("MISSING_FIREBASE_AUTH_CONFIG");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());

export const registerWithEmailPassword = async (email, password) => {
  const auth = getFirebaseAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};

export const sendVerifyEmail = async (user) => {
  return sendEmailVerification(user, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  });
};

export const loginWithEmailPassword = async (email, password) => {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

export const createPhoneRecaptcha = (containerId, options = {}) => {
  const auth = getFirebaseAuth();
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    ...options,
  });
};

export const sendPhoneOtp = async (phoneE164, recaptchaVerifier) => {
  const auth = getFirebaseAuth();
  return signInWithPhoneNumber(auth, phoneE164, recaptchaVerifier);
};

export const logoutFirebaseAuth = async () => {
  const auth = getFirebaseAuth();
  return signOut(auth);
};
