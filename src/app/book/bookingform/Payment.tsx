// ... existing code ...
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const paymentIntentFetchedRef = useRef(false); // Ref to track if PI fetch has been attempted

  // State for saved cards
  const [savedCards, setSavedCards] = useState<StripePaymentMethod[]>([]);
// ... existing code ...
  }, []);

  useEffect(() => {
    // Ensure Stripe and Elements are loaded, and auth state is resolved
    if (loadingAuthState || !currentUser || !stripe || !elements) {
      // console.log("PAYMENT.TSX: useEffect for PI fetch: Aborting - prerequisites not met (auth loading, no user, or stripe/elements not ready).");
      return;
    }

    // If we already have a clientSecret, don't re-fetch.
    if (clientSecret) {
      // console.log("PAYMENT.TSX: useEffect for PI fetch: Aborting - clientSecret already exists.");
      return;
    }

    // If a fetch was already attempted and hasn't been reset (e.g., by an error allowing retry), don't re-attempt.
    if (paymentIntentFetchedRef.current) {
      // console.log("PAYMENT.TSX: useEffect for PI fetch: Aborting - fetch already attempted in this session and not reset.");
      return;
    }
    
    console.log("PAYMENT.TSX: useEffect for PI fetch: Proceeding to fetch PaymentIntent.");
    paymentIntentFetchedRef.current = true; // Mark as fetch initiated for this "session"

    const customerIdToUse = userProfile?.stripeCustomerId || null;
    console.log("PAYMENT.TSX: useEffect for PI fetch: Using customerId:", customerIdToUse);

    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId: customerIdToUse }), 
    })
    .then(res => { // Improved error parsing
      if (!res.ok) {
        return res.json().then(errData => {
          console.error("PAYMENT.TSX: Error response from create-payment-intent API (parsed JSON):", errData);
          throw { status: res.status, data: errData, type: 'json_error' };
        }).catch(() => { // Fallback if error response is not JSON
          return res.text().then(textData => {
            console.error("PAYMENT.TSX: Error response from create-payment-intent API (raw text):", textData);
            throw { status: res.status, data: { error: textData }, type: 'text_error' };
          });
        });
      }
      return res.json();
    })
    .then(async (data) => {
      if (data.error || !data.clientSecret) {
        const errorMsg = data.error || "Missing clientSecret from API response.";
        console.error("PAYMENT.TSX: Error creating PaymentIntent from API or missing clientSecret:", errorMsg, "Full data:", data);
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        paymentIntentFetchedRef.current = false; // Allow retry on explicit API error or missing secret
      } else {
        console.log("PAYMENT.TSX: Received clientSecret (last 10 chars): ...", data.clientSecret?.slice(-10), "and customerId:", data.customerId);
        setClientSecret(data.clientSecret);
        setError(null); // Clear previous errors on successful PI fetch
        // paymentIntentFetchedRef.current remains true, indicating a successful fetch attempt cycle completed.

        const currentStripeCustomerId = data.customerId || userProfile?.stripeCustomerId;
        if (currentStripeCustomerId) {
            fetchSavedPaymentMethods(currentStripeCustomerId);
        } else {
          // No customer ID from PI or profile, so no saved cards to fetch, ensure new card form is shown
          setShowNewCardForm(true);
          setSavedCards([]); 
        }

        if (data.customerId && currentUser) {
          if (!userProfile?.stripeCustomerId || userProfile.stripeCustomerId !== data.customerId) {
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await setDoc(userRef, { stripeCustomerId: data.customerId }, { merge: true });
              console.log("Stripe Customer ID updated in Firestore for user:", currentUser.uid);
            } catch (firestoreError) {
              console.error("Failed to update Stripe Customer ID in Firestore:", firestoreError);
            }
          }
        }
      }
    })
    .catch(err => {
        console.error("PAYMENT.TSX: Fetch error for PaymentIntent (outer catch):", err);
        const message = err?.data?.error || err?.message || "Failed to initialize payment. Please check your connection and try again.";
        setError(typeof message === 'string' ? message : JSON.stringify(message));
        paymentIntentFetchedRef.current = false; // Allow retry on network or other critical fetch error
        setShowNewCardForm(true); 
        setSavedCards([]); // Ensure saved cards are cleared on critical fetch error
    });
  }, [loadingAuthState, currentUser, userProfile?.stripeCustomerId, fetchSavedPaymentMethods, stripe, elements, clientSecret]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("PAYMENT.TSX: handleSubmit called. Stripe Ready:", !!stripe, "Elements Ready:", !!elements, "Client Secret (last 10 chars): ...", clientSecret?.slice(-10));
// ... existing code ...
