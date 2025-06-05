'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import Planet from './planet'; // Assuming this is a valid component - replaced with SVG
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase'; // Adjust path if your alias is different or not set up
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, writeBatch, getDocs, DocumentData } from "firebase/firestore"; 
// Unused imports removed below
// import { getFunctions, httpsCallable } from "firebase/functions"; // Import for Cloud Functions
// import { getApp } from "firebase/app"; // Add this import

// Payment logo paths
const mastercardLogo = '/images/Mastercard.png';
const visaLogo = '/images/Visa.png';

// Extend window interface for recaptchaVerifier and grecaptcha
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
    grecaptcha?: any; // For reCAPTCHA library
  }
}

// Add type for document snapshot
type QueryDocumentSnapshot = {
  ref: any;
  data: () => DocumentData;
};

export default function LoginPage() {
  const router = useRouter();
  // const [isSignUp, setIsSignUp] = useState(false); // Removed isSignUp state
  
  const [phoneNumber, setPhoneNumber] = useState(''); // Initialize with empty string
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuthState, setCheckingAuthState] = useState(true); // New state for auth check

  // Removed fullName and email states as they are no longer collected here
  // const [fullName, setFullName] = useState('');
  // const [email, setEmail] = useState('');

  // Effect for checking initial auth state and redirecting if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        if (user.isAnonymous) {
          // If user is anonymous, stay on the login page.
          console.log(`User is anonymous (UID: ${user.uid}). Login page will remain accessible.`);
          setCheckingAuthState(false); // Stop loading, show the page content
        } else {
          // If user is NOT anonymous (e.g., phone authenticated) and not in OTP flow, redirect.
          if (!showOtpInput && !loading) {
            console.log(`User already authenticated (UID: ${user.uid}, Anonymous: false), redirecting to /book/choice`);
            router.push('/book/choice');
          } else {
            // In OTP flow or loading, do not redirect yet
            setCheckingAuthState(false);
          }
        }
      } else {
        // User is signed out.
        console.log("User is not authenticated.");
        setCheckingAuthState(false); // Stop loading, show the page content
      }
      // setCheckingAuthState(false); // This line is now handled within each condition
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, showOtpInput, loading]);

  const setupRecaptcha = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Ensure container is empty and verifier is not already set up for this instance
    const container = document.getElementById('recaptcha-container');
    if (window.recaptchaVerifier) {
        // If a verifier exists from a previous render of this component instance,
        // it might be better to ensure it's cleared before trying to re-render.
        // However, the cleanup effect should handle clearing it on unmount.
        // For now, if it has child nodes, assume it's the active one.
        if (container?.hasChildNodes()) return;
    }
    if (container) container.innerHTML = ''; // Explicitly empty the container

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
          setError("reCAPTCHA verification expired. Please try sending the code again.");
          if (window.recaptchaVerifier && window.grecaptcha) {
            window.recaptchaVerifier.render().then((widgetId) => {
              if (widgetId !== undefined) { 
                 window.grecaptcha.reset(widgetId);
              }
            }).catch(err => console.error("Error resetting reCAPTCHA on expiration", err));
          }
        },
        'error-callback': (error: any) => {
          console.error("reCAPTCHA error-callback:", error);
          setError("reCAPTCHA challenge failed. Please try again. If the issue persists, check browser console for details.");
        }
      });
      window.recaptchaVerifier.render().catch(err => {
        console.error("Error initially rendering reCAPTCHA", err);
      });
    } catch (e) {
        console.error("Error setting up RecaptchaVerifier", e);
        setError("Failed to initialize reCAPTCHA. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    // Only setup reCAPTCHA if user is not authenticated yet and form is visible
    if (!checkingAuthState && !auth.currentUser) {
        setupRecaptcha();
    }

    // Cleanup function for reCAPTCHA
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear(); // Firebase method to clear the reCAPTCHA widget
          console.log("reCAPTCHA cleared on unmount/effect re-run");
        } catch (clearError) {
          console.error("Error clearing reCAPTCHA:", clearError);
        }
        window.recaptchaVerifier = undefined; // Ensure it's reset
      }
      // Also, ensure the container is empty on cleanup
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
    };
  }, [setupRecaptcha, checkingAuthState]); // Rerun if setupRecaptcha or checkingAuthState changes

  const handleSubmitPhoneNumber = async () => {
    setError(null);

    let formattedPhoneNumber = phoneNumber.trim();

    // Basic validation for an Australian number (e.g., starts with 0, specific length)
    // This is a simplified check. Consider a more robust validation library for production.
    if (formattedPhoneNumber.startsWith('0')) {
      if (formattedPhoneNumber.length === 10 && /^0[45]\d{8}$/.test(formattedPhoneNumber)) { // Common mobile prefix 04, 05
        formattedPhoneNumber = `+61${formattedPhoneNumber.substring(1)}`;
      } else if (formattedPhoneNumber.length === 10 && /^0[2378]\d{8}$/.test(formattedPhoneNumber)) { // Common landline prefixes for some states
        formattedPhoneNumber = `+61${formattedPhoneNumber.substring(1)}`;
      } else if (formattedPhoneNumber.length === 9 && /^[2378]\d{8}$/.test(formattedPhoneNumber)) { // Landline without leading 0
        formattedPhoneNumber = `+61${formattedPhoneNumber}`;
      }
      // Add more specific local Australian number checks if needed
    } else if (!formattedPhoneNumber.startsWith('+')) {
      // If it doesn't start with 0 or +, it's likely an incomplete number or missing country code
      // For simplicity, if it's roughly the right length for a number without a country code, assume +61
      if (formattedPhoneNumber.length === 9 && /^[234578]\d{8}$/.test(formattedPhoneNumber)) { 
        formattedPhoneNumber = `+61${formattedPhoneNumber}`;
      } 
    }
    
    // Final check if it's in E.164 format after attempting auto-correction for Australia
    if (!/^\+\d{1,3}\d{4,14}(?:x.+)?$/.test(formattedPhoneNumber)) {
        setError("Please enter a valid phone number. If providing an Australian number, it should typically start with 0 (e.g., 04xx xxx xxx).");
        return;
    }

    if (!window.recaptchaVerifier) {
        setError("reCAPTCHA not initialized. Please wait or refresh page.");
        if (!document.getElementById('recaptcha-container')?.hasChildNodes()) {
            setupRecaptcha(); 
        }
        return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      // Use the formattedPhoneNumber for Firebase Auth
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      window.confirmationResult = confirmation; 
      setShowOtpInput(true);
      // Update the displayed phone number to the formatted one if different, for consistency in OTP message
      if (phoneNumber !== formattedPhoneNumber && showOtpInput) {
        // This state update is for the OTP message, not the input field itself before sending OTP
      }
      setError(null); 
    } catch (err: any) { 
      console.error("Firebase Phone Auth Error:", err);
      let message = err.message || "Failed to send verification code. Please try again.";
      if (err.code === 'auth/invalid-phone-number') {
        message = `Invalid phone number format: ${formattedPhoneNumber}. Ensure it is in international format (e.g., +61...).`;
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many requests from this phone number. Please try again later.";
      } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/network-request-failed' || err.code === 'auth/web-storage-unsupported' || err.code === 'auth/operation-not-allowed') {
        message = "Verification failed (reCAPTCHA or network issue). Please ensure you are in a valid browser environment and try again.";
        if (window.recaptchaVerifier && window.grecaptcha) {
            window.recaptchaVerifier.render().then((widgetId) => {
                if (widgetId !== undefined) {
                    window.grecaptcha.reset(widgetId);
                }
            }).catch(e => console.error("Error resetting reCAPTCHA on send fail", e));
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setError(null);
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    if (!window.confirmationResult) {
      setError("Verification process expired or was not initiated. Please request a new code.");
      setShowOtpInput(false); 
      return;
    }
    setLoading(true);
    try {
      const userCredential: UserCredential = await window.confirmationResult.confirm(otp);
      const user = userCredential.user;
      console.log("User authenticated (from userCredential):", user.uid, user.phoneNumber);

      // Get the anonymous user's data before signing out
      const anonymousUser = auth.currentUser;
      const isAnonymous = anonymousUser?.isAnonymous;
      const anonymousUid = isAnonymous ? anonymousUser?.uid : null;

      // ---- Log current auth state ----
      const currentUser = auth.currentUser;
      let idToken: string | null = null;
      if (currentUser) {
        console.log("auth.currentUser UID:", currentUser.uid);
        console.log("auth.currentUser phoneNumber:", currentUser.phoneNumber);
        try {
          idToken = await currentUser.getIdToken(true);
          console.log("auth.currentUser ID Token obtained for manual fetch:", !!idToken);
        } catch (err) {
          console.error("Error getting ID token from auth.currentUser for manual fetch:", err);
        }
      }

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const newUserProfile: { [key: string]: any } = {
          uid: user.uid,
          phoneNumber: user.phoneNumber || null,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          stripeCustomerId: null,
        };
        await setDoc(userRef, newUserProfile);
        console.log("New user profile created in Firestore.");

        // If there was an anonymous user, transfer their bookings
        if (anonymousUid) {
          try {
            // Get all bookings for the anonymous user
            const anonymousBookingsRef = collection(db, "bookings");
            const q = query(anonymousBookingsRef, where("userId", "==", anonymousUid));
            const querySnapshot = await getDocs(q);

            // Transfer each booking to the new user
            const batch = writeBatch(db);
            querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
              const bookingRef = doc.ref;
              batch.update(bookingRef, { userId: user.uid });
            });

            // Get all jobs for the anonymous user
            const anonymousJobsRef = collection(db, "jobs");
            const jobsQuery = query(anonymousJobsRef, where("customerId", "==", anonymousUid));
            const jobsSnapshot = await getDocs(jobsQuery);

            // Transfer each job to the new user
            jobsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
              const jobRef = doc.ref;
              batch.update(jobRef, { customerId: user.uid });
            });

            // Commit all updates
            await batch.commit();
            console.log("Successfully transferred bookings and jobs from anonymous user to new user");
          } catch (transferError) {
            console.error("Error transferring bookings and jobs:", transferError);
            // Continue with login even if transfer fails
          }
        }

        // ---- Call Cloud Function to create Stripe customer ----
        try {
          const userForFunction = auth.currentUser || user;
          if (!userForFunction) {
            console.error("User object is null before calling Stripe function for new user.");
            throw new Error("User not available for Stripe customer creation.");
          }
          console.log("Preparing to call Stripe function for new user (MANUAL FETCH). User UID:", userForFunction.uid);

          if (!idToken) {
            console.error("No ID token available for manual fetch call. Aborting.");
            throw new Error("ID token not available for Stripe customer creation.");
          }

          const functionUrl = "https://us-central1-helpallround-ea9da.cloudfunctions.net/createStripeCustomerForUser";
          const payload = {
            data: {
              userId: userForFunction.uid,
              phoneNumber: userForFunction.phoneNumber
            }
          };

          console.log("Manual fetch URL:", functionUrl);
          console.log("Manual fetch payload:", payload);
          console.log("Manual fetch ID Token (first 10 chars):", idToken.substring(0, 10));


          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
          });

          console.log("Manual fetch response status:", response.status);
          const responseData = await response.json();
          console.log("Manual fetch response data:", responseData);

          if (!response.ok) {
            // Log more detailed error from the function if available in responseData
            const errorDetails = responseData.error || { message: "Unknown error from function (manual fetch)" };
            console.error(`Error from manual fetch: ${response.status}`, errorDetails);
            throw new Error(errorDetails.message || `Function call failed with status ${response.status}`);
          }
          
          console.log("Stripe customer creation initiated via manual fetch for new user:", userForFunction.uid, responseData);

        } catch (stripeError: any) { // Added :any to allow access to sub-properties
          console.error("Error initiating Stripe customer creation for new user (raw error object):", stripeError);
          console.error(`Error details: code: ${stripeError?.code}, message: ${stripeError?.message}, details:`, stripeError?.details);
          // Decide how to handle this error. Maybe set a flag for the user,
          // or allow them to proceed and try creating Stripe customer later.
          // For now, we'll just log it and proceed with login.
        }
        // ---- END NEW ----

      } else {
        // User profile already exists, just update lastLoginAt
        const userData = docSnap.data(); // Get user data
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        console.log("Existing user logged in. Updated lastLoginAt.");

        // If there was an anonymous user, transfer their bookings
        if (anonymousUid) {
          try {
            // Get all bookings for the anonymous user
            const anonymousBookingsRef = collection(db, "bookings");
            const q = query(anonymousBookingsRef, where("userId", "==", anonymousUid));
            const querySnapshot = await getDocs(q);

            // Transfer each booking to the existing user
            const batch = writeBatch(db);
            querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
              const bookingRef = doc.ref;
              batch.update(bookingRef, { userId: user.uid });
            });

            // Get all jobs for the anonymous user
            const anonymousJobsRef = collection(db, "jobs");
            const jobsQuery = query(anonymousJobsRef, where("customerId", "==", anonymousUid));
            const jobsSnapshot = await getDocs(jobsQuery);

            // Transfer each job to the existing user
            jobsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
              const jobRef = doc.ref;
              batch.update(jobRef, { customerId: user.uid });
            });

            // Commit all updates
            await batch.commit();
            console.log("Successfully transferred bookings and jobs from anonymous user to existing user");
          } catch (transferError) {
            console.error("Error transferring bookings and jobs:", transferError);
            // Continue with login even if transfer fails
          }
        }

        // ---- ADDED: Call Cloud Function if stripeCustomerId is missing for existing user ----
        if (!userData?.stripeCustomerId) {
          console.log("Existing user profile is missing stripeCustomerId. Attempting to create/retrieve Stripe customer (MANUAL FETCH).");
          try {
            const userForFunction = auth.currentUser || user;
            if (!userForFunction) {
              console.error("User object is null before calling Stripe function for existing user.");
              throw new Error("User not available for Stripe customer creation.");
            }
             // We already fetched idToken above, ensure it's still valid/available
            if (!idToken) {
              console.error("No ID token available for manual fetch call (existing user). Aborting.");
              // Potentially try to re-fetch token if necessary, or rely on earlier check
              idToken = await (auth.currentUser?.getIdToken(true) || Promise.resolve(null));
              if (!idToken) {
                 throw new Error("ID token not available for Stripe customer creation (existing user).");
              }
              console.log("Re-fetched ID token for existing user call.");
            }

            console.log("Preparing to call Stripe function for existing user (MANUAL FETCH). User UID:", userForFunction.uid);

            const functionUrl = "https://us-central1-helpallround-ea9da.cloudfunctions.net/createStripeCustomerForUser";
            const phoneNumberForFunction = userForFunction.phoneNumber || userData?.phoneNumber || null;
            const payload = {
              data: {
                userId: userForFunction.uid,
                phoneNumber: phoneNumberForFunction
              }
            };
            
            console.log("Manual fetch URL (existing user):", functionUrl);
            console.log("Manual fetch payload (existing user):", payload);
            console.log("Manual fetch ID Token (first 10 chars, existing user):", idToken.substring(0, 10));

            const response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify(payload),
            });

            console.log("Manual fetch response status (existing user):", response.status);
            const responseData = await response.json();
            console.log("Manual fetch response data (existing user):", responseData);

            if (!response.ok) {
              const errorDetails = responseData.error || { message: "Unknown error from function (manual fetch existing user)" };
              console.error(`Error from manual fetch (existing user): ${response.status}`, errorDetails);
              throw new Error(errorDetails.message || `Function call failed with status ${response.status} (existing user)`);
            }

            console.log("Stripe customer creation/retrieval initiated via manual fetch for existing user:", userForFunction.uid, responseData);
          } catch (stripeError: any) { // Added :any to allow access to sub-properties
            console.error("Error initiating Stripe customer creation for existing user (raw error object):", stripeError);
            console.error(`Error details: code: ${stripeError?.code}, message: ${stripeError?.message}, details:`, stripeError?.details);
          }
        }
        // ---- END ADDED ----
      }
      
      router.push('/book/choice'); // Changed redirect to /book/choice
      
    } catch (err: any) { 
      console.error("Firebase OTP Auth Error or Firestore Error:", err);
      let message = err.message || "Failed to verify code. Please check the code and try again.";
      if (err.code === 'auth/invalid-verification-code') {
        message = "Invalid verification code. Please try again.";
      } else if (err.code === 'auth/code-expired') {
        message = "The verification code has expired. Please request a new one.";
        setShowOtpInput(false); 
      }
      // Could also be a Firestore error, though less specific codes are typical for those.
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAnonymously = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log("User signed in anonymously:", user.uid);

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      let idToken: string | null = null;
      try {
        idToken = await user.getIdToken(true); // Get ID token for the anonymous user
        console.log("Anonymous user ID Token obtained for Stripe call:", !!idToken);
      } catch (err) {
        console.error("Error getting ID token for anonymous user:", err);
        // Decide if this is a critical error. For now, we'll log and attempt to proceed
        // without calling Stripe, or you could throw an error.
      }

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          isAnonymous: true,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          stripeCustomerId: null, // Initialize stripeCustomerId as null
        });
        console.log("New anonymous user profile created in Firestore.");

        // ---- Call Cloud Function to create Stripe customer for new anonymous user ----
        if (idToken) {
          try {
            console.log("Preparing to call Stripe function for new anonymous user. User UID:", user.uid);
            const functionUrl = "https://us-central1-helpallround-ea9da.cloudfunctions.net/createStripeCustomerForUser";
            const payload = {
              data: {
                userId: user.uid,
                // phoneNumber will be null/undefined for anonymous users
              }
            };
            console.log("Anonymous Stripe Function URL:", functionUrl);
            console.log("Anonymous Stripe Function payload:", payload);

            const response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify(payload),
            });
            const responseData = await response.json();
            console.log("Anonymous Stripe Function response data:", responseData);
            if (!response.ok) {
              const errorDetails = responseData.error || { message: "Unknown error from Stripe function (anonymous)" };
              console.error(`Error from Stripe function (anonymous): ${response.status}`, errorDetails);
              // Log error but don't block login, Stripe ID can be fixed later
            } else {
              console.log("Stripe customer creation initiated/checked for anonymous user:", user.uid, responseData);
            }
          } catch (stripeError: any) {
            console.error("Error initiating Stripe customer creation for new anonymous user:", stripeError);
            // Log error but don't block login
          }
        } else {
          console.warn("No ID token for anonymous user, skipping Stripe customer creation call.");
        }
        // ---- END Stripe Call ----

      } else {
        // Existing anonymous user
        const userData = docSnap.data();
        await setDoc(userRef, { 
            lastLoginAt: serverTimestamp(),
            isAnonymous: true // Ensure this flag is set if they somehow existed without it
        }, { merge: true });
        console.log("Existing anonymous user signed in. Updated lastLoginAt.");

        // ---- Call Cloud Function if stripeCustomerId is missing for existing anonymous user ----
        if (!userData?.stripeCustomerId && idToken) {
          console.log("Existing anonymous user profile is missing stripeCustomerId. Attempting to create/retrieve.");
          try {
            console.log("Preparing to call Stripe function for existing anonymous user. User UID:", user.uid);
            const functionUrl = "https://us-central1-helpallround-ea9da.cloudfunctions.net/createStripeCustomerForUser";
            const payload = {
              data: {
                userId: user.uid,
              }
            };
            console.log("Existing Anonymous Stripe Function URL:", functionUrl);
            console.log("Existing Anonymous Stripe Function payload:", payload);

            const response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify(payload),
            });
            const responseData = await response.json();
            console.log("Existing Anonymous Stripe Function response data:", responseData);
            if (!response.ok) {
              const errorDetails = responseData.error || { message: "Unknown error from Stripe function (existing anonymous)" };
              console.error(`Error from Stripe function (existing anonymous): ${response.status}`, errorDetails);
            } else {
              console.log("Stripe customer creation/retrieval initiated for existing anonymous user:", user.uid, responseData);
            }
          } catch (stripeError: any) {
            console.error("Error initiating Stripe customer creation for existing anonymous user:", stripeError);
          }
        } else if (!idToken) {
          console.warn("No ID token for existing anonymous user, skipping Stripe customer creation check.");
        }
        // ---- END Stripe Call ----
      }
      
      router.push('/book/choice');
    } catch (err: any) {
      console.error("Anonymous Sign-In Error:", err);
      let message = "Failed to continue anonymously. Please try again.";
      if (err.code === 'auth/operation-not-allowed') {
        message = "Anonymous sign-in is not enabled in your Firebase project. Please enable it in the Firebase console (Authentication -> Sign-in method).";
      } else {
        message = err.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuthState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div id="recaptcha-container"></div>

        <Link href="/" passHref>
          <h1 className="text-4xl font-bold text-red-600 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        <h2 className="text-2xl font-semibold mb-6">Sign In or Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}

        {!showOtpInput ? (
          <>
            <div className="text-left mb-6 space-y-4">
              {/* Removed Full Name and Email input fields */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Enter your phone number to continue
                </label>
                <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-red-500">
                  <span className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0412 345 678" // Updated placeholder
                    className="w-full p-2 border-l rounded-r-md focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6">
              By proceeding, you agree to our{' '}
              <Link href="/terms" className="text-red-600 hover:underline">terms of service</Link> and{' '}
              <Link href="/privacy" className="text-red-600 hover:underline">privacy policy</Link>.
              We will send you a text message to verify your phone number.
            </p>

            <button
              onClick={handleSubmitPhoneNumber}
              disabled={loading || checkingAuthState}
              className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition cursor-pointer mb-4 disabled:opacity-50"
            >
              {loading && !showOtpInput ? 'Sending Code...' : 'SEND VERIFICATION CODE'}
            </button>

            <button
              onClick={handleContinueAnonymously}
              disabled={loading || checkingAuthState}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition cursor-pointer mb-6 disabled:opacity-50"
            >
              {loading && !showOtpInput ? 'Processing...' : 'Continue without logging in or signing up'}
            </button>

            {/* Removed Sign Up / Log In toggle paragraph */}
          </>
        ) : (
          <div className="text-left mb-6 space-y-4">
            <h3 className="text-xl font-semibold mb-2 text-center">Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              {/* Display the formatted number if OTP was sent, otherwise the user's input */}
              A 6-digit code has been sent to {window.confirmationResult ? (window.confirmationResult as any)._verificationFullNumber || phoneNumber : phoneNumber}. Please enter it below.
            </p>
            <div>
              <label htmlFor="otpInput" className="block text-sm font-medium mb-1">Verification Code</label>
              <input
                id="otpInput"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-[0.5em]"
              />
            </div>
            <button
              onClick={handleOtpSubmit}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition cursor-pointer mb-4 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'VERIFY & PROCEED'}
            </button>
            <div className="text-sm text-center space-x-4">
                <button onClick={() => {
                    setShowOtpInput(false);
                    setError(null);
                    setOtp('');
                    // Optionally reset phoneNumber state here if you want the input field to clear
                    // setPhoneNumber(''); 
                }} className="text-gray-600 hover:underline font-semibold">
                    Change Number
                </button>
                <button onClick={handleSubmitPhoneNumber} disabled={loading} className="text-red-600 hover:underline font-semibold disabled:opacity-50">
                    {loading && showOtpInput ? 'Resending...' : 'Resend Code'} 
                </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-2">We accept:</p>
          <div className="flex justify-center space-x-4">
            <Image src={mastercardLogo} alt="Mastercard" width={48} height={30} className="object-contain" />
            <Image src={visaLogo} alt="Visa" width={48} height={30} className="object-contain" />
          </div>
        </div>

      </div>
    </div>
  );
}
