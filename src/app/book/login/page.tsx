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
  UserCredential
  // FirebaseError is not a direct export, errors are typically { code: string, message: string }
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { getFunctions, httpsCallable } from "firebase/functions"; // Import for Cloud Functions

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

export default function LoginPage() {
  const router = useRouter();
  // const [isSignUp, setIsSignUp] = useState(false); // Removed isSignUp state
  
  const [phoneNumber, setPhoneNumber] = useState('+61'); 
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Removed fullName and email states as they are no longer collected here
  // const [fullName, setFullName] = useState('');
  // const [email, setEmail] = useState('');

  const setupRecaptcha = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.recaptchaVerifier && document.getElementById('recaptcha-container')?.hasChildNodes()) return; // Adjusted check

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
    setupRecaptcha();
  }, [setupRecaptcha]);

  const handleSubmitPhoneNumber = async () => {
    setError(null);
    if (!phoneNumber || phoneNumber.length < 10) { 
      setError("Please enter a valid phone number with country code.");
      return;
    }
    if (!window.recaptchaVerifier) {
        setError("reCAPTCHA not initialized. Please wait or refresh page.");
        if (!document.getElementById('recaptcha-container')?.hasChildNodes()) { // Adjusted check
            setupRecaptcha(); 
        }
        return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmation; 
      setShowOtpInput(true);
      setError(null); 
    } catch (err: any) { 
      console.error("Firebase Phone Auth Error:", err);
      let message = err.message || "Failed to send verification code. Please try again.";
      if (err.code === 'auth/invalid-phone-number') {
        message = "Invalid phone number format. Please include the country code (e.g., +61).";
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

      // ---- Log current auth state ----
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log("auth.currentUser UID:", currentUser.uid);
        console.log("auth.currentUser phoneNumber:", currentUser.phoneNumber);
        currentUser.getIdToken().then(token => {
          console.log("auth.currentUser ID Token obtained:", !!token);
        }).catch(err => {
          console.error("Error getting ID token from auth.currentUser:", err);
        });
      } else {
        console.error("auth.currentUser is null immediately after confirmation!");
      }
      // ---- End Log current auth state ----

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const newUserProfile: { [key: string]: any } = {
          uid: user.uid,
          phoneNumber: user.phoneNumber || null,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          stripeCustomerId: null,
          // displayName and email are no longer added here
        };
        await setDoc(userRef, newUserProfile);
        console.log("New user profile created in Firestore.");

        // ---- NEW: Call Cloud Function to create Stripe customer ----
        try {
          // Ensure we use the latest currentUser state if possible, or the one from credential
          const userForFunction = auth.currentUser || user; 
          if (!userForFunction) {
            console.error("User object is null before calling Stripe function for new user.");
            throw new Error("User not available for Stripe customer creation.");
          }
          console.log("Preparing to call Stripe function for new user. User UID:", userForFunction.uid);

          const functionsInstance = getFunctions(); // Use default app instance
          const createStripeCustomer = httpsCallable(functionsInstance, 'createStripeCustomerForUser');
          await createStripeCustomer({ userId: userForFunction.uid, phoneNumber: userForFunction.phoneNumber });
          console.log("Stripe customer creation initiated for new user:", userForFunction.uid);
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

        // ---- ADDED: Call Cloud Function if stripeCustomerId is missing for existing user ----
        if (!userData?.stripeCustomerId) {
          console.log("Existing user profile is missing stripeCustomerId. Attempting to create/retrieve Stripe customer.");
          try {
            // Ensure we use the latest currentUser state if possible, or the one from credential
            const userForFunction = auth.currentUser || user;
            if (!userForFunction) {
              console.error("User object is null before calling Stripe function for existing user.");
              throw new Error("User not available for Stripe customer creation.");
            }
            console.log("Preparing to call Stripe function for existing user. User UID:", userForFunction.uid);

            const functionsInstance = getFunctions(); // Use default app instance
            const createStripeCustomer = httpsCallable(functionsInstance, 'createStripeCustomerForUser');
            const phoneNumberForFunction = userForFunction.phoneNumber || userData?.phoneNumber || null;
            await createStripeCustomer({ userId: userForFunction.uid, phoneNumber: phoneNumberForFunction });
            console.log("Stripe customer creation/retrieval initiated for existing user:", userForFunction.uid);
          } catch (stripeError: any) { // Added :any to allow access to sub-properties
            console.error("Error initiating Stripe customer creation for existing user (raw error object):", stripeError);
            console.error(`Error details: code: ${stripeError?.code}, message: ${stripeError?.message}, details:`, stripeError?.details);
          }
        }
        // ---- END ADDED ----
      }
      
      router.push('/book/bookingform'); 
      
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
                    placeholder="+61 400 000 000"
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
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition cursor-pointer mb-4 disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'SEND VERIFICATION CODE'}
            </button>

            {/* Removed Sign Up / Log In toggle paragraph */}
          </>
        ) : (
          <div className="text-left mb-6 space-y-4">
            <h3 className="text-xl font-semibold mb-2 text-center">Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              A 6-digit code has been sent to {phoneNumber}. Please enter it below.
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
