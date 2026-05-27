// api/submit-rsvp.js
// POST /api/submit-rsvp
// Saves RSVP to Firebase + notifies host

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { inviteId, name, phone, message, attending } = req.body;

    if (!inviteId || !name) {
      return res.status(400).json({ error: 'inviteId and name required' });
    }

    const db = initFirebase();

    // Save RSVP
    await db.collection('invitations').doc(inviteId)
      .collection('rsvps').add({
        name,
        phone: phone || '',
        message: message || '',
        attending: attending !== false,
        submittedAt: new Date().toISOString(),
      });

    // Update RSVP count on invitation
    const invRef = db.collection('invitations').doc(inviteId);
    const inv = await invRef.get();
    if (inv.exists) {
      await invRef.update({
        rsvpCount: (inv.data().rsvpCount || 0) + 1,
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
