'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth'; // Firebase User type
import { auth, db } from '@/lib/firebase'; // Your Firebase initialization
import { doc, DocumentData, onSnapshot } from 'firebase/firestore'; // Import onSnapshot

interface UserProfile extends DocumentData {
  uid: string;
  phoneNumber: string | null;
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string | null;
  createdAt?: any; // Firestore Timestamp
  lastLoginAt?: any; // Firestore Timestamp
  // Add any other fields you store in your user profile
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loadingAuthState: boolean;
  // You can add more specific loading states if needed, e.g., loadingUserProfile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  // const [loadingUserProfile, setLoadingUserProfile] = useState(false); // New state for profile loading

  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeProfile: (() => void) | undefined;

    const setupAuth = async () => {
      unsubscribeAuth = auth.onAuthStateChanged((user) => {
        console.log("[AuthContext] Auth state changed:", user?.uid);
        setCurrentUser(user);
        setLoadingAuthState(false);
        
        if (!user) {
          setUserProfile(null);
          return;
        }
      });
    };

    setupAuth();

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    if (currentUser) {
      // setLoadingUserProfile(true); // Indicate profile loading is starting
      const userRef = doc(db, 'users', currentUser.uid);
      unsubscribeProfile = onSnapshot(userRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
            console.log("[AuthContext] User profile updated from snapshot:", docSnap.data());
          } else {
            console.warn("[AuthContext] No user profile found in Firestore for authenticated user:", currentUser.uid);
            setUserProfile(null);
          }
          // setLoadingUserProfile(false); // Profile loading finished
        }, 
        (error) => {
          console.error("[AuthContext] Error listening to user profile snapshot:", error);
          setUserProfile(null);
          // setLoadingUserProfile(false); // Profile loading finished (with error)
        }
      );
      // Cleanup profile subscription when currentUser changes or on unmount
    } else {
      setUserProfile(null); // Clear profile if no current user
    }

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [currentUser]); // This effect runs when currentUser changes

  const value = {
    currentUser,
    userProfile,
    loadingAuthState,
    // loadingUserProfile, // Expose if needed by components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
