'use client';

import React, { useState, useEffect } from 'react';

// Define an interface for the profile data
interface ProfileData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  homeAddress: string;
  billingAddress: string;
}

const initialProfileData: ProfileData = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  homeAddress: "",
  billingAddress: "",
};

// components/Profile.tsx
const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<ProfileData>(initialProfileData);
  const [detailsExist, setDetailsExist] = useState(false);

  // Effect to initialize editData when starting to edit existing details
  useEffect(() => {
    if (detailsExist && profileData && !isEditing) {
      setEditData(profileData);
    } else if (!detailsExist && !isEditing) {
      setEditData(initialProfileData); // Reset to empty if no details and not editing
    }
  }, [isEditing, profileData, detailsExist]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    setDetailsExist(true);
  };

  const handleStartEditing = () => {
    if (profileData) {
      setEditData(profileData); // Load current data into edit form
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setEditData(profileData); // Revert to saved data
    } else {
      setEditData(initialProfileData); // Revert to empty form if no data saved yet
    }
    setIsEditing(false);
  };

  // Helper function to render a field (view or edit mode)
  const renderField = (label: string, name: keyof ProfileData, value: string, isTextArea: boolean = false) => (
    <div className="mb-3">
      <p className="font-semibold text-gray-700">{label}:</p>
      {isEditing ? (
        isTextArea ? (
          <textarea
            name={name}
            value={editData[name]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md mt-1 text-gray-700"
            rows={2}
          />
        ) : (
          <input
            type={name === 'email' ? 'email' : name === 'mobile' ? 'tel' : 'text'}
            name={name}
            value={editData[name]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md mt-1 text-gray-700"
          />
        )
      ) : (
        <p className="text-gray-600">{profileData?.[name] || "N/A"}</p>
      )}
    </div>
  );

  if (!detailsExist && !isEditing) {
    return (
      <div className="flex justify-center">
        <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
          <p className="text-gray-600 mb-4">No profile details found.</p>
          <button 
            onClick={() => {
              setEditData(initialProfileData); // Ensure form is empty
              setIsEditing(true);
            }}
            className="px-6 py-2 rounded text-white bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            Add Profile Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-6 text-center">
          {isEditing ? (detailsExist ? 'Edit Personal Details' : 'Add Personal Details') : 'Personal Details'}
        </h2>
        <div className="space-y-1 text-left">
          {renderField("First Name", "firstName", editData.firstName)}
          {renderField("Last Name", "lastName", editData.lastName)}
          {renderField("Mobile", "mobile", editData.mobile)}
          {renderField("Email", "email", editData.email)}
          {renderField("Home Address", "homeAddress", editData.homeAddress, true)}
          {renderField("Billing Address", "billingAddress", editData.billingAddress, true)}
        </div>
        <div className="flex justify-center mt-6 space-x-4">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="px-6 py-2 rounded text-white bg-green-500 hover:bg-green-600 cursor-pointer"
              >
                {detailsExist ? 'Save Changes' : 'Save Profile'}
              </button>
              <button 
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleStartEditing}
              className="px-6 py-2 rounded text-white bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;