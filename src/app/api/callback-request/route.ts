import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import axios from 'axios';

// Firebase Admin SDK Initialization
// Ensure your Firebase Admin SDK credentials are set up in your environment
// (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to your service account key JSON file)
// Or, if running on Firebase Hosting/Cloud Functions, it might be auto-initialized.
// For Next.js API routes deployed elsewhere (like Vercel), explicit initialization is often needed.

if (!admin.apps.length) {
  console.log("Attempting to initialize Firebase Admin SDK...");
  try {
    const firebaseAdminConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (firebaseAdminConfig) {
      console.log("Found FIREBASE_ADMIN_CONFIG environment variable.");
      // For environments like Vercel where you store the config as a base64 encoded string
      const serviceAccountJSON = Buffer.from(firebaseAdminConfig, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(`Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
    } else {
      console.error("CRITICAL: FIREBASE_ADMIN_CONFIG environment variable not found.");
      // Fallback for environments where it might be auto-initialized
      admin.initializeApp();
      console.log("Firebase Admin SDK initialized with default credentials (this might fail in local dev).");
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error in API route:', error.stack);
  }
} else {
  console.log("Firebase Admin SDK already initialized in API route.");
}

const db = admin.firestore();

// Helper function to send a notification to Discord
async function sendDiscordNotification(data: { name: string, email: string, phone: string, postcode: string, ipAddress: string | null }, requestId: string) {
  const webhookUrl = process.env.DISCORD_CALLBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Discord callback webhook URL is not configured. Cannot send notification.");
    return;
  }

  const embed = {
    title: "New Website Callback Request",
    description: `A new callback request has been submitted from the website.`,
    color: 3447003, // A nice blue color
    fields: [
      { name: "Name", value: data.name, inline: true },
      { name: "Phone", value: data.phone, inline: true },
      { name: "Email", value: data.email, inline: false },
      { name: "Postcode", value: data.postcode, inline: true },
      { name: "IP Address", value: data.ipAddress || 'N/A', inline: true },
      { name: "Firestore Doc ID", value: requestId, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "HelpAllRound Website",
    },
  };

  try {
    console.log(`Sending 'New Callback' notification to Discord for request ID: ${requestId}`);
    await axios.post(webhookUrl, {
      content: "📞 New Callback Request!",
      embeds: [embed],
    });
    console.log("Successfully sent notification to Discord.");
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Discord API Response:", error.response.data);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("API Route /api/callback-request received a POST request.");
  try {
    const body = await request.json();
    console.log("Request Body:", body);
    const { name, email, phone, postcode } = body;

    if (!name || !email || !phone || !postcode) {
      console.warn("Validation failed: Missing required fields.");
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Basic email validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.warn("Validation failed: Invalid email format.");
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }
    console.log("Validation passed.");

    // Get IP address - primarily from x-forwarded-for, then fallback to other headers if necessary
    const xForwardedFor = request.headers.get('x-forwarded-for');
    let ipAddress = xForwardedFor ? xForwardedFor.split(',')[0].trim() : null;
    if (!ipAddress) {
      // Add other fallbacks if needed, e.g., x-real-ip, or leave as null
      ipAddress = request.headers.get('x-real-ip');
    }

    const callbackData = {
      name,
      email,
      phone,
      postcode,
      status: 'pending', // Initial status
      requestedAt: FieldValue.serverTimestamp(), // This will be handled by Firestore
      userAgent: request.headers.get('user-agent') || null,
      ipAddress: ipAddress || null,
    };

    console.log("Preparing to write to Firestore with data:", callbackData);
    const callbackRequestRef = await db.collection('callbackRequests').add(callbackData);

    console.log('Successfully wrote to Firestore. Preparing success response. ID:', callbackRequestRef.id);

    // Asynchronously send notification, don't block the response
    sendDiscordNotification(callbackData, callbackRequestRef.id).catch(err => {
      console.error("Error in sendDiscordNotification (non-blocking):", err);
    });

    return NextResponse.json(
      { 
        message: 'Callback request submitted successfully!', 
        requestId: callbackRequestRef.id 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('FATAL: Error processing callback request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message }, 
      { status: 500 }
    );
  }
} 