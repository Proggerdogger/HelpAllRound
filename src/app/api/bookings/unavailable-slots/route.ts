import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';

// Firebase Admin SDK Initialization (ensure this is consistent with other API routes)
const serviceAccountKeyPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_PATH;
if (!admin.apps.length) {
  try {
    if (serviceAccountKeyPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountKeyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account key from path (unavailable-slots).");
    } else if (process.env.FIREBASE_ADMIN_CONFIG) {
      const serviceAccountJSON = Buffer.from(process.env.FIREBASE_ADMIN_CONFIG, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account from FIREBASE_ADMIN_CONFIG env var (unavailable-slots).");
    } else {
      admin.initializeApp(); 
      console.log("Firebase Admin SDK initialized with default credentials (unavailable-slots).");
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error in unavailable-slots API route:', error.stack);
  }
} else {
  console.log("Firebase Admin SDK already initialized in unavailable-slots API route.");
}

const db = admin.firestore();

// Helper to generate all possible 1-hour slots for a day (e.g., 9 AM to 4 PM)
const ALL_AVAILABLE_TIME_SLOTS = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4"];

// Helper function to get the hour from a time slot string (e.g., "9-10" -> 9)
const getStartHour = (slot: string): number => {
  return parseInt(slot.split('-')[0]);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date'); // Expecting YYYY-MM-DD format

    if (!date) {
      return NextResponse.json({ message: 'Date query parameter is required' }, { status: 400 });
    }
    // Basic date format validation (can be more robust)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ message: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    const bookingsSnapshot = await db.collection('bookings')
      .where('selectedDate', '==', date)
      //.where('status', '==', 'confirmed') // Consider only confirmed bookings if applicable
      .get();

    if (bookingsSnapshot.empty) {
      return NextResponse.json({ unavailableSlots: [] }, { status: 200 });
    }

    const unavailableSlotsSet = new Set<string>();

    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const bookedSlot = booking.selectedTime; // e.g., "11-12"
      
      if (typeof bookedSlot !== 'string' || !ALL_AVAILABLE_TIME_SLOTS.includes(bookedSlot)) {
        console.warn(`Invalid or missing bookedSlot for booking ${doc.id}: ${bookedSlot}`);
        return; // Skip this booking if the time slot is invalid
      }

      const bookedStartHour = getStartHour(bookedSlot);

      // Add the booked slot itself
      unavailableSlotsSet.add(bookedSlot);

      // Add 2 previous 1-hour slots
      for (let i = 1; i <= 2; i++) {
        const prevHour = bookedStartHour - i;
        const prevSlot = ALL_AVAILABLE_TIME_SLOTS.find(slot => getStartHour(slot) === prevHour);
        if (prevSlot) {
          unavailableSlotsSet.add(prevSlot);
        }
      }

      // Add 2 next 1-hour slots
      for (let i = 1; i <= 2; i++) {
        const nextHour = bookedStartHour + i;
        const nextSlot = ALL_AVAILABLE_TIME_SLOTS.find(slot => getStartHour(slot) === nextHour);
        if (nextSlot) {
          unavailableSlotsSet.add(nextSlot);
        }
      }
    });
    
    const unavailableSlotsArray = Array.from(unavailableSlotsSet).sort((a, b) => getStartHour(a) - getStartHour(b));

    return NextResponse.json({ unavailableSlots: unavailableSlotsArray }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching unavailable slots:', error);
    return NextResponse.json(
      { message: 'Internal Server Error while fetching unavailable slots', error: error.message }, 
      { status: 500 }
    );
  }
} 