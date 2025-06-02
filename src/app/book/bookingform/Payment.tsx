// ... existing code ...
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Removed unused state variables below
  // const [paymentAmount, setPaymentAmount] = useState<number | null>(null); 
  // const [paymentCurrency, setPaymentCurrency] = useState<string | null>(null); 

  useEffect(() => {
    if (loadingAuthState || !currentUser) {
// ... existing code ...
      if (data.error) {
        setError(data.error);
        console.error("Error creating PaymentIntent:", data.error);
      } else {
        setClientSecret(data.clientSecret);
        // Removed unused state setters below
        // setPaymentAmount(data.amount); 
        // setPaymentCurrency(data.currency?.toUpperCase()); 

        if (data.customerId && currentUser) {
          if (!userProfile?.stripeCustomerId || userProfile.stripeCustomerId !== data.customerId) {
// ... existing code ...
