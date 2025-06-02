import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Firebase Admin SDK Initialization (Copy from callback-request or use a shared utility if you have one)
const serviceAccountKeyPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_PATH;
if (!admin.apps.length) {
  try {
    if (serviceAccountKeyPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountKeyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account key from path (bookings/create).");
    } else if (process.env.FIREBASE_ADMIN_CONFIG) {
      const serviceAccountJSON = Buffer.from(process.env.FIREBASE_ADMIN_CONFIG, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account from FIREBASE_ADMIN_CONFIG env var (bookings/create).");
    } else {
      admin.initializeApp(); 
      console.log("Firebase Admin SDK initialized with default credentials (bookings/create).");
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error in bookings/create API route:', error.stack);
  }
} else {
  console.log("Firebase Admin SDK already initialized in bookings/create API route.");
}

const db = admin.firestore();

interface CreateBookingPayload {
  userId: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // e.g., "9-10" or "9:00 AM" - standardize this from client
  paymentIntentId: string;
  bookingAddress: string;
  issueDescription: string;
  arrivalInstructions?: string;
  // Add any other relevant booking details
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateBookingPayload;
    const { 
        userId, 
        selectedDate, 
        selectedTime, 
        paymentIntentId, 
        bookingAddress, 
        issueDescription, 
        arrivalInstructions 
    } = body;

    // Basic validation
    if (!userId || !selectedDate || !selectedTime || !paymentIntentId || !bookingAddress || !issueDescription) {
      return NextResponse.json({ message: 'Missing required booking fields' }, { status: 400 });
    }

    // TODO: Add more specific validation (e.g., date format, time format, user existence)

    const newBookingRef = await db.collection('bookings').add({
      userId,
      selectedDate, // Store as YYYY-MM-DD string for easier querying
      selectedTime, // Store the 1-hour slot string e.g. "9-10"
      paymentIntentId,
      bookingAddress,
      issueDescription,
      arrivalInstructions: arrivalInstructions || '',
      status: 'confirmed', // Initial status for a new booking
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // You might want to store the user's phone number or email for notifications
      // customerDetails: { ... } 
    });

    console.log('New booking created with ID:', newBookingRef.id);

    return NextResponse.json(
      { 
        message: 'Booking created successfully!', 
        bookingId: newBookingRef.id 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Internal Server Error while creating booking', error: error.message }, 
      { status: 500 }
    );
  }
} 