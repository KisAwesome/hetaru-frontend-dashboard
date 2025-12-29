"use client";

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAz8f5HdLPDYK1GTLP6QufrWzhaXP7gpdc",
  authDomain: "hetaru-dev.firebaseapp.com",
  projectId: "hetaru-dev",
  storageBucket: "hetaru-dev.firebasestorage.app",
  messagingSenderId: "294397930922",
  appId: "1:294397930922:web:14edcec364e5dbf2d74fd3",
  measurementId: "G-8RNGC21CS8"
};

// Initialize Firebase

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// (optional but recommended)
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const db = getFirestore(app);