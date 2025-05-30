// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCu8GzallLCNxAyooXlq9Pjx1OcGgYSC_0",
  authDomain: "helpallround-ea9da.firebaseapp.com",
  projectId: "helpallround-ea9da",
  storageBucket: "helpallround-ea9da.appspot.com", // Corrected typical storageBucket format
  messagingSenderId: "349046471308",
  appId: "1:349046471308:web:83d01a541ddf8ff5bf99a9",
  measurementId: "G-KGX8ED5C80"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

let analytics: Analytics | undefined;
// Check if analytics is supported in the current environment (e.g., browser)
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, analytics, auth, db, firebaseConfig }; 
