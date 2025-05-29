'use client';

import React, { useState, useEffect } from 'react';
import { usePaymentContext } from '@/contexts/PaymentContext'; // Import the context

interface Card {
  id: number;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
}

// Helper function to validate card details (can be expanded)
const validateCardDetails = (cardNumber: string, expiryDate: string, cardholderName: string) => {
  if (!cardNumber.trim() || !/^(?:\d{13,19})$/.test(cardNumber.replace(/\s/g, ''))) {
    return "Invalid card number. Must be 13-19 digits.";
  }
  if (!expiryDate.trim() || !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiryDate)) {
    return "Invalid expiry date. Format MM/YY.";
  }
  // Check if expiry date is in the past
  const [month, year] = expiryDate.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card has expired.";
  }
  if (!cardholderName.trim()) {
    return "Cardholder name is required.";
  }
  return null; // No error
};

const PaymentMethod: React.FC = () => {
  const { saveCardDetails, clearSavedCard } = usePaymentContext(); // Use the context
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // If editing a card, populate the form
    if (editingCardId !== null) {
      const cardToEdit = cards.find(card => card.id === editingCardId);
      if (cardToEdit) {
        setCardNumber(cardToEdit.cardNumber);
        setExpiryDate(cardToEdit.expiryDate);
        setCardholderName(cardToEdit.cardholderName);
        setIsAddingCard(true); // Open the form for editing
        setFormError(null);
      } else {
        // Card not found, reset editing state
        setEditingCardId(null);
        setIsAddingCard(false);
      }
    } else {
      // If not editing (i.e., adding new or no action), clear form
      setCardNumber('');
      setExpiryDate('');
      setCardholderName('');
      setFormError(null);
    }
  }, [editingCardId, cards]);

  const handleAddCardClick = () => {
    if (cards.length < 2) {
      setEditingCardId(null); // Ensure we are in "add new" mode
      setIsAddingCard(true);
      setFormError(null);
      // Clear form fields when starting to add a new card
      setCardNumber('');
      setExpiryDate('');
      setCardholderName('');
    }
  };

  const handleEditCardClick = (cardId: number) => {
    setEditingCardId(cardId);
    // Form fields will be populated by useEffect
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9\/]/g, '');
    const prevExpiryDate = expiryDate; // Store previous value to compare

    if (value.length === 2 && prevExpiryDate.length === 1 && !value.includes('/')) {
      value += '/';
    } else if (value.length === 2 && prevExpiryDate.length === 3 && value.includes('/')) {
      value = value.charAt(0);
    } else if (value.length > 5) {
      value = value.slice(0, 5);
    }
    const parts = value.split('/');
    if (parts.length > 2) {
        value = parts[0] + '/' + parts.slice(1).join('');
    }
    if (value.startsWith('/')) {
        value = '';
    }
    if (parts[0] && parts[0].length <=2 && parseInt(parts[0], 10) > 12) {
        parts[0] = '12';
        value = parts.join('/');
    }
    setExpiryDate(value);
  };

  const handleSaveCard = () => {
    setFormError(null); 
    const error = validateCardDetails(cardNumber, expiryDate, cardholderName);
    if (error) {
      setFormError(error);
      return;
    }

    const newCardData = { cardNumber, expiryDate, cardholderName };
    let updatedCards;

    if (editingCardId !== null) {
      updatedCards = cards.map(card => 
        card.id === editingCardId 
          ? { ...newCardData, id: editingCardId }
          : card
      );
      setCards(updatedCards);
    } else {
      updatedCards = [...cards, { ...newCardData, id: Date.now() }];
      setCards(updatedCards);
    }

    // Update context with the first card if it exists, otherwise clear it
    if (updatedCards.length > 0) {
        const firstCard = updatedCards[0];
        saveCardDetails({ 
            cardNumber: firstCard.cardNumber,
            expiryDate: firstCard.expiryDate,
            cardholderName: firstCard.cardholderName
            // CVV is not typically stored or passed around like this from a list of saved cards
        });
    } else {
        clearSavedCard();
    }

    setIsAddingCard(false);
    setEditingCardId(null);
    setCardNumber('');
    setExpiryDate('');
    setCardholderName('');
  };

  const handleDeleteCard = (cardId: number) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    setCards(updatedCards);

    if (editingCardId === cardId) { 
        setIsAddingCard(false);
        setEditingCardId(null);
        setCardNumber('');
        setExpiryDate('');
        setCardholderName('');
    }
    
    // Update context after deletion
    if (updatedCards.length > 0) {
        const firstCard = updatedCards[0];
        saveCardDetails({ 
            cardNumber: firstCard.cardNumber,
            expiryDate: firstCard.expiryDate,
            cardholderName: firstCard.cardholderName
        });
    } else {
        clearSavedCard();
    }
  };

  const handleCancel = () => {
    setIsAddingCard(false);
    setEditingCardId(null);
    setFormError(null);
    // Clear form fields on cancel
    setCardNumber('');
    setExpiryDate('');
    setCardholderName('');
  };

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-white shadow-md rounded-lg max-w-md w-full">
        <div className="space-y-6">
          {/* Display existing cards */}
          {cards.map(card => (
            <div key={card.id} className="border rounded-lg p-4">
              <div className="text-center mb-4">
                <p className="font-semibold">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                <p className="text-gray-600">Expires: {card.expiryDate}</p>
                <p className="text-gray-600">{card.cardholderName}</p>
              </div>
              <div className="flex justify-center space-x-2">
                <button 
                  onClick={() => handleEditCardClick(card.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCard(card.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add new card button */}
          {!isAddingCard && cards.length < 2 && (
            <button
              onClick={handleAddCardClick}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
            >
              + Add New Card
            </button>
          )}

          {/* Card form */}
          {(isAddingCard || editingCardId !== null) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-center font-semibold mb-4">
                {editingCardId !== null ? 'Edit Card' : 'Add New Card'}
              </h3>
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  <p>{formError}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19} // Max card number length
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cardholder Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    type="button" // Changed from submit to button
                    onClick={handleSaveCard} // Call validation and save logic
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod; 