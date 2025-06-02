import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Firebase Admin SDK Initialization
// Ensure your Firebase Admin SDK credentials are set up in your environment
// (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to your service account key JSON file)
// Or, if running on Firebase Hosting/Cloud Functions, it might be auto-initialized.
// For Next.js API routes deployed elsewhere (like Vercel), explicit initialization is often needed.

const serviceAccountKeyPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_PATH;

if (!admin.apps.length) {
  try {
    if (serviceAccountKeyPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountKeyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account key from path.");
    } else if (process.env.FIREBASE_ADMIN_CONFIG) {
      // For environments like Vercel where you store the config as a base64 encoded string
      const serviceAccountJSON = Buffer.from(process.env.FIREBASE_ADMIN_CONFIG, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account from FIREBASE_ADMIN_CONFIG env var.");
    } else {
      // Fallback for environments like Firebase Hosting/Cloud Functions where it might be auto-initialized
      admin.initializeApp(); 
      console.log("Firebase Admin SDK initialized with default credentials (e.g., for Firebase Hosting/Functions).");
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error in API route:', error.stack);
    // Depending on your error handling strategy, you might want to prevent the API from working
  }
} else {
  console.log("Firebase Admin SDK already initialized in API route.");
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, postcode } = body;

    if (!name || !email || !phone || !postcode) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Basic email validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Get IP address - primarily from x-forwarded-for, then fallback to other headers if necessary
    const xForwardedFor = request.headers.get('x-forwarded-for');
    let ipAddress = xForwardedFor ? xForwardedFor.split(',')[0].trim() : null;
    if (!ipAddress) {
      // Add other fallbacks if needed, e.g., x-real-ip, or leave as null
      ipAddress = request.headers.get('x-real-ip');
    }

    const callbackRequestRef = await db.collection('callbackRequests').add({
      name,
      email,
      phone,
      postcode,
      status: 'pending', // Initial status
      requestedAt: FieldValue.serverTimestamp(),
      userAgent: request.headers.get('user-agent') || null,
      ipAddress: ipAddress || null, // Use the derived IP address
    });

    console.log('Callback request submitted to Firestore with ID:', callbackRequestRef.id);

    return NextResponse.json(
      { 
        message: 'Callback request submitted successfully!', 
        requestId: callbackRequestRef.id 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error processing callback request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message }, 
      { status: 500 }
    );
  }
} 