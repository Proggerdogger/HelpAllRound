// components/SelectAppointment.tsx
'use client';

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import useEmblaCarousel from 'embla-carousel-react';
import ProgressIndicator from "./ProgressIndicator";
import { getFunctions, httpsCallable, type HttpsCallableResult } from "firebase/functions"; // Import Firebase functions

// Updated FormDataValues to match the parent
interface FormDataValues {
  unitNumber?: string;
  streetNumber: string;
  streetName: string;
  suburb: string;
  state: string;
  postcode: string;

  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
  contactPhoneNumber?: string; // Keep other fields consistent
  paymentIntentId: string | null; // Keep other fields consistent
  jobId?: string; // Keep other fields consistent
  bookingId?: string; // Keep other fields consistent
}

interface SelectAppointmentProps {
  onBack: () => void;
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
}

// Helper function to parse YYYY-MM-DD string into a local Date object
const parseLocalDate = (dateString: string): Date | null => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed, creates local date at midnight
};

// Helper function to format a local Date object to YYYY-MM-DD string
const formatLocalDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Client-side helper to get the start hour (as a number) from a time slot string
const getClientSideStartHour = (slot: string): number => {
  if (typeof slot !== "string" || !slot.includes("-")) {
    // console.warn(\`getClientSideStartHour: Invalid slot format received: \${slot}\`);
    return NaN;
  }
  const hourPart = slot.split("-")[0];
  let hour = parseInt(hourPart, 10);

  if (isNaN(hour)) {
    // console.warn(\`getClientSideStartHour: Could not parse hour from slot: \${slot}. Hour part was: \${hourPart}\`);
    return NaN;
  }

  // Adjust for PM slots: "1-2" PM is 13, "4-5" PM is 16, etc.
  // "12-1" PM is 12 (noon), so no adjustment needed for 12.
  if (hour >= 1 && hour <= 5 && hourPart !== "12") { // Handles 1 PM to 5 PM
    hour += 12;
  }
  return hour;
};

const SelectAppointment: React.FC<SelectAppointmentProps> = ({ onBack, onNext, onDataUpdate, formData }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseLocalDate(formData.selectedDate));
  const [selectedTime, setSelectedTime] = useState(formData.selectedTime || "");
  const [error, setError] = useState(""); // For displaying error messages
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]); // State for unavailable slots
  const [isLoadingSlots, setIsLoadingSlots] = useState(false); // State for loading indicator
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Define available dates (next 7 days starting from the actual current day)
  const generateDates = () => {
    const currentDate = new Date(); // Use the actual current date
    currentDate.setHours(0, 0, 0, 0); // Normalize to the beginning of the day for consistency

    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        fullDate: formatLocalDateToYYYYMMDD(date), // YYYY-MM-DD for comparison and API calls
        price: 60, // Example price
      };
    });
  };

  const dates = generateDates();

  // Define all time slots (9-10 to 4-5)
  const baseTimeSlots = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"];

  // Fetch unavailable slots when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = formatLocalDateToYYYYMMDD(selectedDate); // Use new helper
      console.log("Date string being sent to getUnavailableSlots:", dateString); // Debugging line
      setIsLoadingSlots(true);
      setUnavailableSlots([]); // Clear previous unavailable slots
      setError(""); // Clear previous errors

      const functions = getFunctions(); // Get Firebase functions instance
      const getUnavailableSlotsFn = httpsCallable(functions, 'getUnavailableSlots');

      getUnavailableSlotsFn({ date: dateString })
        .then((result: HttpsCallableResult<any>) => {
          // Assuming result.data is { unavailableSlots: string[] }
          if (result.data && Array.isArray(result.data.unavailableSlots)) {
            setUnavailableSlots(result.data.unavailableSlots);
          } else {
            console.warn("Unexpected data structure from getUnavailableSlots:", result.data);
            setUnavailableSlots([]); // Default to empty if structure is wrong
          }
        })
        .catch(err => {
          console.error("Error calling getUnavailableSlots function:", err);
          let friendlyMessage = "Could not load available times. Please try again.";
          if (err.code === 'functions/invalid-argument') {
            friendlyMessage = err.message; // Use message from function if available
          } else if (err.message) {
            // For other errors, log specific details but show generic message
            console.error("Specific error:", err.message);
          }
          setError(friendlyMessage);
          setUnavailableSlots([]); // Ensure it's an empty array on error
        })
        .finally(() => {
          setIsLoadingSlots(false);
        });
    } else {
      setUnavailableSlots([]); // Clear if no date is selected
      setError("");
    }
  }, [selectedDate]);

  const handleDateSelect = (fullDate: string) => {
    // Use formatLocalDateToYYYYMMDD for consistent comparison
    const currentSelectedDateFormatted = formatLocalDateToYYYYMMDD(selectedDate);

    if (currentSelectedDateFormatted === fullDate) {
      // If the same date is clicked again, deselect it
      setSelectedDate(null);
      setSelectedTime("");
    } else {
      setSelectedDate(parseLocalDate(fullDate)); // Use helper to set date
      setSelectedTime(""); // Reset time selection when a new date is selected
    }
    setError(""); // Clear error when a date is selected
  };

  const handleTimeSelect = (time: string) => {
    if (unavailableSlots.includes(time)) {
      setError("This time slot is no longer available. Please select another.");
      return;
    }
    if (selectedTime === time) {
      // If the same time is clicked again, deselect it and show all times
      setSelectedTime("");
    } else {
      setSelectedTime(time);
    }
    setError(""); // Clear error when a time is selected
  };

  const handleContinue = () => {
    if (!selectedDate) {
      setError("Please select a date to continue with your booking.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time to continue with your booking.");
      return;
    }

    onDataUpdate({
      selectedDate: formatLocalDateToYYYYMMDD(selectedDate), // Use new helper
      selectedTime: selectedTime, // Pass the raw "9-10" slot
    });
    onNext();
  };

  // Determine which time slots to display
  // const timeSlotsToShow = selectedTime && timeSlots.includes(selectedTime) ? [selectedTime] : timeSlots;
  // Updated logic for timeSlotsToShow and isUnavailable to include same-day restrictions

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main Content */}
      <div className="text-center w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" passHref>
          <h1 className="text-3xl font-bold text-red-500 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
            HelpAllRound
          </h1>
        </Link>

        {/* Form Container */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProgressIndicator currentStep={3} totalSteps={5} stepName="Select Appointment" />

          {/* Title */}
          <h2 className="text-xl font-semibold mb-4">Select Helper's Arrival Window</h2>
          <h3 className="text-sm font-semibold mb-4">
            When would you like your Helper to arrive? <span className="text-red-500">*</span>
          </h3>

          {/* Date Selection Carousel */}
          <div className="relative mb-2">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {dates.map((date) => (
                  <div key={date.fullDate} className="flex-[0_0_20%] min-w-0 pl-1">
                    <button
                      onClick={() => handleDateSelect(date.fullDate)}
                      className={`w-full p-3 rounded text-center border-2 transition-all duration-200 cursor-pointer ${
                        selectedDate && formatLocalDateToYYYYMMDD(selectedDate) === date.fullDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
                          selectedDate && formatLocalDateToYYYYMMDD(selectedDate) === date.fullDate ? "text-gray-600" : "text-gray-500"
                        }`}
                      >
                        {date.day}
                      </div>
                      <div
                        className={`text-xs font-semibold -mt-1 ${
                          selectedDate && formatLocalDateToYYYYMMDD(selectedDate) === date.fullDate ? "text-black" : "text-black"
                        }`}
                      >
                        {date.date}
                      </div>
                      <div
                        className={`text-xs mt-1 font-semibold ${
                          selectedDate && formatLocalDateToYYYYMMDD(selectedDate) === date.fullDate ? "text-red-600" : "text-red-500"
                        }`}
                      >
                        From ${date.price} 
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Time Selection (Only shown if a date is selected) */}
          {selectedDate && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">
                Select a time slot <span className="text-red-500">*</span>
              </h3>
              {isLoadingSlots && <p className="text-gray-500">Loading available times...</p>}
              
              {(() => {
                // Determine available time slots based on the day of the week
                let timeSlotsToDisplay = baseTimeSlots;
                if (selectedDate) {
                  const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 6 for Saturday
                  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                    timeSlotsToDisplay = baseTimeSlots.filter(slot => slot !== "9-10");
                  }
                }

                // Condition for no slots available message
                if (!isLoadingSlots && unavailableSlots.length === timeSlotsToDisplay.length && timeSlotsToDisplay.length > 0) {
                  return <p className="text-red-500">No time slots available for this date. Please select another date.</p>;
                }

                // Render time slots
                if (!isLoadingSlots) {
                  return (
                    <div className="flex flex-col items-center space-y-2">
                      {timeSlotsToDisplay.map((time) => {
                        const slotStartHour = getClientSideStartHour(time);
                        const isActuallyUnavailable = unavailableSlots.includes(time);
                        let isTooSoon = false;
                        let isTooLate = false;

                        if (selectedDate) {
                          const now = new Date();
                          const todayDateString = formatLocalDateToYYYYMMDD(now);
                          const selectedDateString = formatLocalDateToYYYYMMDD(selectedDate);
                          const currentHour = now.getHours(); // 0-23

                          if (selectedDateString === todayDateString) {
                            // Rule 1: Slot must be at least 3 hours in advance (client-side)
                            if (slotStartHour < currentHour + 3) {
                              isTooSoon = true;
                            }
                            // Rule 2: No bookings starting at or after 5 PM (17:00) for same day (client-side)
                            const endOfServiceHour = 17;
                            if (slotStartHour >= endOfServiceHour) {
                              isTooLate = true;
                            }
                          }
                        }

                        const finalIsDisabled = isActuallyUnavailable || isTooSoon || isTooLate;
                        const isCurrentlySelected = selectedTime === time;

                        // Determine if this slot should be shown if a time is already selected
                        if (selectedTime && selectedTime !== time && !isCurrentlySelected) {
                           // If a time is selected, and this is not it, don't render it.
                           // This keeps the UI clean showing only the selected slot or all available if none selected.
                           return null;
                        }

                        let buttonText = time;
                        if (isTooSoon) buttonText += " (Too Soon)";
                        else if (isTooLate) buttonText += " (Too Late)";
                        else if (isActuallyUnavailable) buttonText += " (Booked)";

                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            disabled={finalIsDisabled}
                            className={`w-2/3 md:w-1/3 py-2 rounded text-gray-700 cursor-pointer text-sm ${
                              isCurrentlySelected
                                ? "bg-black text-white"
                                : finalIsDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed line-through"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            {buttonText}
                          </button>
                        );
                      })}
                    </div>
                  );
                }
                return null; // Should be covered by isLoadingSlots check or no slots message
              })()}
            </div>
          )}

          {/* Current Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Current Selection</h3>
            <p className="text-gray-700">
              <span className="font-semibold">Date:</span>{" "}
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "No date selected"}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Time:</span>{" "}
              {selectedTime ? selectedTime : "No time selected"}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Price:</span> ${selectedDate ? 60 : 0} for first hour + $35/hour after
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="text-sm font-semibold">OOPS!</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Confirm Button (Only shown if both a date and time are selected) */}
          {selectedDate && selectedTime && (
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                className="w-1/3 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectAppointment;

//Then payment 
