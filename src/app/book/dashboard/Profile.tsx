'use client';

import React, { useState } from 'react';

// Define an interface for the profile data
interface ProfileData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  homeAddress: string;
  billingAddress: string;
}

// components/Profile.tsx
const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Adrian",
    lastName: "Smark",
    mobile: "0491 117 566",
    email: "ciorstansmark@gmail.com",
    homeAddress: "Trinity Sands Unit 1 71-73 Moore St, Trinity Beach QLD 4879",
    billingAddress: "Trinity Sands Unit 1 71-73 Moore St, Trinity Beach QLD 4879",
  });

  // Temporary state for edits
  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfileData(editData);
    } else {
      // Start editing, initialize editData with current profileData
      setEditData(profileData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditData(profileData); // Revert changes
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
            type={name === 'email' ? 'email' : 'text'} // Use email type for email field
            name={name}
            value={editData[name]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md mt-1 text-gray-700"
          />
        )
      ) : (
        <p className="text-gray-600">{value}</p>
      )}
    </div>
  );

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-6 text-center">Personal Details</h2>
        <div className="space-y-1 text-left"> {/* Changed text-center to text-left for labels */}
          {renderField("First Name", "firstName", profileData.firstName)}
          {renderField("Last Name", "lastName", profileData.lastName)}
          {renderField("Mobile", "mobile", profileData.mobile)}
          {renderField("Email", "email", profileData.email)}
          {renderField("Home Address", "homeAddress", profileData.homeAddress, true)}
          {renderField("Billing Address", "billingAddress", profileData.billingAddress, true)}
        </div>
        <div className="flex justify-center mt-6 space-x-4">
          <button 
            onClick={handleEditToggle}
            className={`px-6 py-2 rounded text-white ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} cursor-pointer`}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          {isEditing && (
            <button 
              onClick={handleCancelEdit}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;