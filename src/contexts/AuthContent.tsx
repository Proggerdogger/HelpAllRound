'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth'; // Firebase User type
import { auth, db } from '@/lib/firebase'; // Your Firebase initialization
import { doc, getDoc, DocumentData } from 'firebase/firestore';

interface UserProfile extends DocumentData {
  uid: string;
  phoneNumber: string | null;
  displayName?: string;
  email?: string;
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // User is signed in, fetch their profile from Firestore
        setLoadingAuthState(true); // Start loading profile data
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // This case should ideally be handled during signup
            // If profile doesn't exist for an auth user, it means something went wrong
            // or the signup process didn't complete its Firestore write.
            console.warn("No user profile found in Firestore for authenticated user:", user.uid);
            setUserProfile(null); // Or set a default/empty profile
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setUserProfile(null); // Clear profile on error
        } finally {
          setLoadingAuthState(false); // Done with auth state and initial profile load
        }
      } else {
        // User is signed out
        setUserProfile(null);
        setLoadingAuthState(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    loadingAuthState,
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
