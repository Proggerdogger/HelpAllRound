// components/SelectAppointment.tsx
'use client';

import { useState, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from 'embla-carousel-react';
import ProgressIndicator from "./ProgressIndicator";

// Assuming FormDataValues will be imported or defined in a shared types file
interface FormDataValues {
  address: string;
  arrivalInstructions: string;
  issueDescription: string;
  selectedDate: string;
  selectedTime: string;
}

interface SelectAppointmentProps {
  onBack: () => void;
  onNext: () => void;
  onDataUpdate: (data: Partial<FormDataValues>) => void;
  formData: FormDataValues;
}

const SelectAppointment: React.FC<SelectAppointmentProps> = ({ onBack, onNext, onDataUpdate, formData }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(formData.selectedDate ? new Date(formData.selectedDate) : null);
  const [selectedTime, setSelectedTime] = useState(formData.selectedTime || "");
  const [error, setError] = useState(""); // For displaying error messages
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

  // Define available dates (next 7 days starting from today, May 8, 2025)
  const today = new Date("2025-05-08");
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      fullDate: date.toISOString().split("T")[0], // For comparison
      price: 100, // Placeholder price of $100
    };
  });

  // Define all time slots (9-10 to 3-4)
  const timeSlots = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4"];

  const handleDateSelect = (fullDate: string) => {
    if (selectedDate && selectedDate.toISOString().split("T")[0] === fullDate) {
      // If the same date is clicked again, deselect it
      setSelectedDate(null);
      setSelectedTime("");
    } else {
      setSelectedDate(new Date(fullDate));
      setSelectedTime(""); // Reset time selection when a new date is selected
    }
    setError(""); // Clear error when a date is selected
  };

  const handleTimeSelect = (time: string) => {
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

    // Convert the selected time range (e.g., "9-10") to a single time for formData (e.g., "9:00 AM")
    const startHour = parseInt(selectedTime.split("-")[0]);
    const amPm = startHour >= 12 ? "PM" : "AM";
    const displayHour = startHour > 12 ? startHour - 12 : startHour;
    const formattedTime = `${displayHour}:00 ${amPm}`;

    onDataUpdate({
      selectedDate: selectedDate.toISOString().split("T")[0],
      selectedTime: formattedTime,
    });
    onNext();
  };

  // Determine which time slots to display
  const timeSlotsToShow = selectedTime && timeSlots.includes(selectedTime) ? [selectedTime] : timeSlots;

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
                        selectedDate && selectedDate.toISOString().split("T")[0] === date.fullDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
                          selectedDate && selectedDate.toISOString().split("T")[0] === date.fullDate ? "text-gray-600" : "text-gray-500"
                        }`}
                      >
                        {date.day}
                      </div>
                      <div
                        className={`text-xs font-semibold -mt-1 ${
                          selectedDate && selectedDate.toISOString().split("T")[0] === date.fullDate ? "text-black" : "text-black"
                        }`}
                      >
                        {date.date}
                      </div>
                      <div
                        className={`text-xs mt-1 font-semibold ${
                          selectedDate && selectedDate.toISOString().split("T")[0] === date.fullDate ? "text-red-600" : "text-red-500"
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
              <div className="flex flex-col items-center space-y-2">
                {timeSlotsToShow.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`w-1/3 py-2 rounded text-gray-700 cursor-pointer ${
                      selectedTime === time
                        ? "bg-black text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
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
              <span className="font-semibold">Price:</span> ${selectedDate ? 100 : 0}
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