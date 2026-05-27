// api/get-invite.js
// Vercel Serverless Function
// GET /api/get-invite?id=INVITE_ID
// Fetches invitation data from Firebase

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Invitation ID required' });
  }

  try {
    const db = initFirebase();
    const doc = await db.collection('invitations').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const data = doc.data();

    // Check if active
    if (!data.isActive) {
      return res.status(410).json({ error: 'Invitation has expired' });
    }

    // Increment view count
    await db.collection('invitations').doc(id).update({
      viewCount: (data.viewCount || 0) + 1,
      lastViewedAt: new Date().toISOString(),
    });

    // Return invitation data (exclude sensitive fields)
    const publicData = {
      inviteId: data.inviteId,
      eventType: data.eventType,
      planType: data.planType,
      eventDate: data.eventDate,
      primaryName: data.primaryName,
      secondaryName: data.secondaryName,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      venueMapsLink: data.venueMapsLink,
      additionalInfo: data.additionalInfo,
      template: data.template,
      isPaid: data.isPaid,
      status: data.status,
      viewCount: (data.viewCount || 0) + 1,
      createdAt: data.createdAt,
    };

    return res.status(200).json({ success: true, invitation: publicData });

  } catch (error) {
    console.error('Get invite error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
