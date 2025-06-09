'use client';

import React, { useState } from 'react';

// The URL of your function will be populated after deployment
const functionUrl = "https://australia-southeast1-helpallround-ea9da.cloudfunctions.net/manualCalendarRefresh";

const AdminControls: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRefreshCalendar = async () => {
        console.log("Button clicked! handleRefreshCalendar called.");
        setIsLoading(true);
        setMessage('');
        try {
            console.log("Attempting to fetch from URL:", functionUrl);
            const response = await fetch(functionUrl, {
                method: 'POST',
            });
            console.log("Fetch call finished. Response status:", response.status);
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            setMessage(data.message || 'Calendar refreshed successfully!');
        } catch (error: any) {
            console.error('Error during fetch operation:', error);
            setMessage(error.message || 'Failed to refresh calendar. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Admin Controls</h2>
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-gray-600">
                    Use this button to manually trigger a regeneration of the iCal job calendar feed.
                </p>
                <button 
                    onClick={handleRefreshCalendar} 
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Refreshing...' : 'Force Refresh Calendar'}
                </button>
                {message && (
                    <p className={`text-sm mt-4 p-2 rounded-md ${message.startsWith('Failed') || message.startsWith('Internal') ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminControls; 