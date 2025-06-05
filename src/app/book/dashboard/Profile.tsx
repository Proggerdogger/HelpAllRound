'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions'; // For calling update function
import { app } from '@/lib/firebase'; // Firebase app instance

// Define an interface for the profile data, aligning with Firestore user doc + form fields
interface ProfileData {
  firstName: string;
  lastName: string;
  // mobile: string; // Mobile will be read-only from auth.currentUser.phoneNumber or userProfile.phoneNumber
  email: string; // User can update their contact email
  homeAddress: string;
  billingAddress: string;
  isBillingSameAsHome: boolean;
  displayName?: string; // Optional, can be constructed or stored
}

// Default empty state for the form
const initialProfileData: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  homeAddress: "",
  billingAddress: "",
  isBillingSameAsHome: true,
};

const Profile: React.FC = () => {
  const { currentUser, userProfile, loadingAuthState } = useAuth(); // Use auth context
  const [isEditing, setIsEditing] = useState(false);
  // profileData will hold the data as saved in Firestore (from userProfile initially)
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  // editData is for the form fields while editing
  const [editData, setEditData] = useState<ProfileData>(initialProfileData);
  
  const [isLoading, setIsLoading] = useState(false); // For save operation
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Populate form with data from userProfile when available
  useEffect(() => {
    if (userProfile) {
      const currentData: ProfileData = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || currentUser?.email || "", // Prioritize Firestore email, then auth email
        homeAddress: userProfile.homeAddress || "",
        billingAddress: userProfile.billingAddress || "",
        isBillingSameAsHome: userProfile.isBillingSameAsHome === undefined ? true : userProfile.isBillingSameAsHome,
        displayName: userProfile.displayName || currentUser?.displayName || "",
      };
      setProfileData(currentData);
      setEditData(currentData); // Initialize edit form with this data
    }
  }, [userProfile, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // For checkbox

    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // If billing address is same as home, auto-update billingAddress field
    if (name === 'isBillingSameAsHome' && checked) {
      setEditData(prev => ({ ...prev, billingAddress: prev.homeAddress }));
    }
    if (name === 'homeAddress' && editData.isBillingSameAsHome) {
        setEditData(prev => ({ ...prev, billingAddress: value }));
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError("You must be logged in to update your profile.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const functions = getFunctions(app);
    const updateUserProfile = httpsCallable(functions, 'updateUserProfile');

    // Prepare data for the backend, ensure displayName is consistent
    const dataToSave: Partial<ProfileData> = {
      ...editData,
      displayName: `${editData.firstName} ${editData.lastName}`.trim(),
    };
    if (!dataToSave.firstName && !dataToSave.lastName) {
        dataToSave.displayName = currentUser.email || "User"; // Fallback display name
    }

    try {
      await updateUserProfile(dataToSave);
      setProfileData(editData); // Update local display state
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      // AuthContext should refresh userProfile automatically via its onSnapshot listener
    } catch (err: any) {
      console.error("Error updating profile:", err);
      let message = "Failed to update profile.";
      if (err instanceof FunctionsError) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = () => {
    setEditData(profileData); // Load current saved data into edit form
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditData(profileData); // Revert to last saved data
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };
  
  const displayedMobile = currentUser?.phoneNumber || userProfile?.phoneNumber || "N/A";

  // Conditional rendering for loading auth state
  if (loadingAuthState) {
    return <div className="text-center p-6"><p>Loading profile...</p></div>;
  }
  if (!currentUser && !loadingAuthState) {
      return <div className="text-center p-6"><p>Please log in to view your profile.</p></div>;
  }

  // Render function for fields - simplified
  const renderField = (label: string, name: keyof ProfileData, type: 'text' | 'email' | 'textarea' | 'checkbox') => {
    // Special handling for checkbox alignment and label
    if (type === 'checkbox') {
      return (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={editData[name] as boolean}
            onChange={handleInputChange}
            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-2"
            disabled={!isEditing}
          />
          <label htmlFor={name} className="text-gray-700">
            {label}
          </label>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        {isEditing ? (
          type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={editData[name] as string}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          ) : (
            <input
              type={type} // Use text, email, tel etc.
              id={name}
              name={name}
              value={editData[name] as string}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          )
        ) : (
          <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1 min-h-[40px]">
            {name === 'isBillingSameAsHome' ? (profileData[name] ? 'Yes' : 'No') : (profileData[name] || "N/A")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center p-4">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isEditing ? 'Edit Personal Details' : 'Personal Details'}
        </h2>

        {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
        {successMessage && <p className="mb-4 text-center text-green-600 bg-green-100 p-2 rounded">{successMessage}</p>}
        
        <form onSubmit={(e) => { e.preventDefault(); if(isEditing) handleSave(); else handleStartEditing(); }}>
          <div className="space-y-1 text-left">
            {renderField("First Name", "firstName", "text")}
            {renderField("Last Name", "lastName", "text")}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Mobile</label>
              <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1 min-h-[40px]">{displayedMobile}</p>
              {isEditing && <p className="text-xs text-gray-500 mt-1">Mobile number can be changed via login verification.</p>}
            </div>

            {renderField("Email", "email", "email")}
            {renderField("Home Address", "homeAddress", "textarea")}
            {renderField("Is Billing Address Same as Home?", "isBillingSameAsHome", "checkbox")}
            {!editData.isBillingSameAsHome && renderField("Billing Address", "billingAddress", "textarea")}
          </div>
          <div className="flex justify-center mt-8 space-x-4">
            {isEditing ? (
              <>
                <button 
                  type="submit" // Changed to submit
                  disabled={isLoading}
                  className="px-6 py-2 rounded text-white bg-green-500 hover:bg-green-600 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" // Explicitly type as button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                type="submit" // Changed to submit
                className="px-6 py-2 rounded text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                Edit Details
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;