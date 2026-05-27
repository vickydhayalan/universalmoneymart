// api/create-invite.js
// Vercel Serverless Function
// POST /api/create-invite
// Saves order to Firebase + sends email notification

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side)
function initFirebase() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// Generate unique invite ID
function generateInviteId(eventType, name) {
  const clean = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) || 'invite';
  const random = Math.random().toString(36).substring(2, 7);
  const timestamp = Date.now().toString(36);
  return `${clean(eventType)}-${clean(name)}-${random}-${timestamp}`;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://universalmoneymart.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      // Client details
      customerName,
      customerPhone,
      customerEmail,
      // Event details
      eventType,
      planType,
      eventDate,
      primaryName,
      secondaryName,
      venueName,
      venueAddress,
      venueMapsLink,
      additionalInfo,
      // Payment
      razorpayPaymentId,
      razorpayOrderId,
      amount,
    } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !eventType || !planType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'eventType', 'planType']
      });
    }

    // Phone validation
    const phoneClean = customerPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const db = initFirebase();

    // Generate unique invite ID
    const inviteId = generateInviteId(eventType, primaryName || customerName);
    const inviteUrl = `https://universalmoneymart.com/invites/view.html?id=${inviteId}`;

    // Determine template based on event type
    const templateMap = {
      'Marriage': 'emerald',
      'Engagement': 'rosegold',
      'Birthday': 'crimson',
      'Baby Shower': 'midnight',
      'House Warming': 'emerald',
      'Reception': 'crimson',
      'Seemantham': 'rosegold',
      'Retirement': 'midnight',
    };

    // Save to Firebase Firestore
    const inviteData = {
      // IDs
      inviteId,
      inviteUrl,
      
      // Client
      customerName,
      customerPhone: phoneClean,
      customerEmail: customerEmail || '',
      
      // Event
      eventType,
      planType,
      eventDate: eventDate || '',
      primaryName: primaryName || '',
      secondaryName: secondaryName || '',
      venueName: venueName || '',
      venueAddress: venueAddress || '',
      venueMapsLink: venueMapsLink || '',
      additionalInfo: additionalInfo || '',
      
      // Design
      template: templateMap[eventType] || 'emerald',
      
      // Payment
      isPaid: !!(razorpayPaymentId),
      paymentId: razorpayPaymentId || 'pending',
      orderId: razorpayOrderId || '',
      amount: amount || 0,
      
      // Status
      status: 'pending', // pending → active → completed
      isActive: true,
      viewCount: 0,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection('invitations').doc(inviteId).set(inviteData);

    // Send email notification to Vignesh
    await sendEmailNotification({
      inviteId,
      inviteUrl,
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      planType,
      eventDate,
      primaryName,
      amount,
    });

    // Return success with invite URL
    return res.status(200).json({
      success: true,
      inviteId,
      inviteUrl,
      message: 'Invitation created successfully!',
    });

  } catch (error) {
    console.error('Create invite error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Email notification using Gmail SMTP via fetch
async function sendEmailNotification(data) {
  try {
    // Using EmailJS or direct SMTP
    // For now, using a simple fetch to email service
    const emailBody = `
🎉 NEW UMM INVITES ORDER!

📋 Order Details:
━━━━━━━━━━━━━━━━━━━━
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Email: ${data.customerEmail || 'Not provided'}
Event: ${data.eventType}
Plan: ${data.planType}
Date: ${data.eventDate || 'Not specified'}
Names: ${data.primaryName || 'Not provided'}
Amount: ₹${data.amount}

🔗 Invitation ID: ${data.inviteId}
🌐 Invite URL: ${data.inviteUrl}

━━━━━━━━━━━━━━━━━━━━
Action Required:
1. Verify payment in Razorpay dashboard
2. Customize invitation if needed
3. Send link to client via WhatsApp

WhatsApp message template:
"Hi ${data.customerName}! 🎉 
Your ${data.eventType} invitation is ready!
View here: ${data.inviteUrl}
- UMM Invites Team"
    `;

    // Send via EmailJS (free tier available)
    if (process.env.EMAILJS_SERVICE_ID) {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_USER_ID,
          template_params: {
            to_email: 'service@universalmoneymart.com',
            subject: `🎉 New Order: ${data.eventType} - ${data.customerName}`,
            message: emailBody,
            invite_url: data.inviteUrl,
          },
        }),
      });
    }

    console.log('Email notification sent for:', data.inviteId);
  } catch (err) {
    // Email failure shouldn't block invite creation
    console.error('Email notification error:', err);
  }
}
