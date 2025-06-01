import * as functions from "firebase-functions";
import admin from "firebase-admin";
import Stripe from "stripe"; // Stripe import RE-ADDED

// Config related interfaces RE-ADDED
// interface StripeConfig {
//   secret?: string;
// }
// interface MyFunctionsConfig {
//   stripe?: StripeConfig;
// }

// Initialize Firebase Admin SDK (do this once)
// For a truly minimal test, you could even comment this out if it's not strictly needed
// by the functions.https.onCall wrapper itself, though it's standard practice.
admin.initializeApp();

// functions.config() call ENTIRELY REMOVED
// const config = functions.config() as MyFunctionsConfig; 
// Erroneous log line referencing 'config' REMOVED:
// functions.logger.info("functions.config() was called. Config object (or part of it) exists: ", !!config);

// Attempt to get Stripe secret key directly from process.env
// The exact name might differ based on how Firebase sets it from functions.config
// Common names: STRIPE_SECRET, STRIPE_SECRET_KEY
const stripeSecretKeyFromEnv = process.env.STRIPE_SECRET;

let stripe: Stripe | null = null;

if (stripeSecretKeyFromEnv) {
  try {
    stripe = new Stripe(stripeSecretKeyFromEnv, {
      // apiVersion: "2024-06-20", // Consider your API version
    });
    functions.logger.info("Stripe SDK initialized successfully using STRIPE_SECRET from process.env.");
  } catch (error) {
    functions.logger.error("Failed to initialize Stripe SDK using STRIPE_SECRET from process.env:", error);
  }
} else {
  functions.logger.error(
    "Stripe secret key NOT FOUND in process.env.STRIPE_SECRET. " +
    "Ensure it is set as an environment variable for the function."
  );
}

// Stripe SDK initialization REMAINS REMOVED for this step

// Minimal payload interface, or just use 'any' for 'data'
// interface BasicPayload {
//   userId: string;
// }

interface CreateStripeCustomerPayload {
  userId: string;
  phoneNumber?: string;
}

export const createStripeCustomerForUser = functions.https.onCall(
  async (data: any, context: any) => {
    // Log incoming data and context for debugging
    functions.logger.info("createStripeCustomerForUser called. Data:", data);
    functions.logger.info("createStripeCustomerForUser called. Context:", context);

    if (!stripe) {
      functions.logger.error(
        "Stripe SDK is not initialized. Ensure STRIPE_SECRET env var is set and SDK initialized."
      );
      throw new functions.https.HttpsError(
        "internal",
        "Stripe integration is not properly configured. SDK not initialized."
      );
    }

    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const payload = data as CreateStripeCustomerPayload;
    const userId = payload.userId;
    const phoneNumber = payload.phoneNumber;

    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a 'userId'."
      );
    }

    if (context.auth.uid !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission for this user."
      );
    }

    functions.logger.log(`Processing Stripe customer for UID: ${userId}`);

    try {
      const userDocRef = admin.firestore().collection("users").doc(userId);
      const userDocSnap = await userDocRef.get();
      const userData = userDocSnap.data();

      if (userDocSnap.exists && userData?.stripeCustomerId) {
        functions.logger.log(
          `User ${userId} already has Stripe ID: ${userData.stripeCustomerId}.`
        );
        return {
          success: true,
          stripeCustomerId: userData.stripeCustomerId,
          message: "User already has a Stripe Customer ID.",
        };
      }

      const customerData: Stripe.CustomerCreateParams = {
        description: `Firebase User: ${userId}`,
        metadata: { firebaseUID: userId },
      };
      if (phoneNumber) {
        customerData.phone = phoneNumber;
      }

      let stripeCustomer;
      try {
        stripeCustomer = await stripe.customers.create(customerData);
      } catch (stripeApiError: any) {
        functions.logger.error(
          `Stripe API error during customer creation for ${userId}:`,
          stripeApiError
        );
        // Pass along a more specific error if available (e.g., Stripe's error code or message)
        const errorMessage = stripeApiError.message || "Stripe API failed to create customer.";
        const errorCode = stripeApiError.code || "internal";
        throw new functions.https.HttpsError(
          errorCode === "internal" ? "internal" : "aborted", // Use 'aborted' for Stripe specific errors unless it's truly internal
          `Stripe Error: ${errorMessage}`
        );
      }
      
      const stripeCustomerId = stripeCustomer.id;
      functions.logger.log(
        `Created Stripe customer ${stripeCustomerId} for user ${userId}`
      );

      await userDocRef.set(
        { stripeCustomerId: stripeCustomerId, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      functions.logger.log(
        `Updated Firestore for ${userId} with Stripe ID ${stripeCustomerId}`
      );

      return { success: true, stripeCustomerId: stripeCustomerId };
    } catch (error: any) {
      functions.logger.error(
        `Error creating Stripe customer for ${userId}:`, error
      );
      // Ensure error.message is a string, and provide a default if not.
      const message = (typeof error.message === 'string' ? error.message : "An unexpected error occurred during Stripe customer creation.");
      // If it's already an HttpsError, rethrow it, otherwise wrap it.
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        message
      );
    }
  }
);

/**
 * A minimal callable function for testing deployment.
 */
export const helloWorld = functions.https.onCall((data, context) => {
  functions.logger.info("--- helloWorld function was called ---", { data });
  return {
    message: "Hello from Firebase Cloud Functions! (v2 - ESM)",
    receivedData: data,
  };
});

// Ensure no other code is present for this minimal test.
