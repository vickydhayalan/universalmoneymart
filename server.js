const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, portal.html, Logo.png, etc.

// Temporary in-memory OTP store (Expires in 5 minutes)
const otpStore = new Map();

// Registered Clients Database (Add new clients here)
const REGISTERED_CLIENTS = {
  "7200752628": {
    isAdmin: true,
    name: "Vignesh Dhayalan (Admin)",
    email: "vickydhayalan2000@gmail.com",
    pan: "BWRPV6671C",
    sipMonthly: "₹10,000",
    iinStatus: "NSE Active",
    umm: {
      invested: 350000, current: 482450, gains: 132450, xirr: "15.8%",
      funds: [
        { name: "Parag Parikh Flexi Cap Fund - Reg (G)", folio: "10293847/01", sip: "₹5,000", invested: 180000, current: 254200, returns: "+41.2%", tag: "ARN-288927" },
        { name: "Nippon India Small Cap Fund - Reg (G)", folio: "88492011/92", sip: "₹3,000", invested: 110000, current: 158100, returns: "+43.7%", tag: "ARN-288927" }
      ]
    },
    all: {
      invested: 500000, current: 683750, gains: 183750, xirr: "15.1%",
      funds: [
        { name: "Parag Parikh Flexi Cap Fund - Reg (G)", folio: "10293847/01", sip: "₹5,000", invested: 180000, current: 254200, returns: "+41.2%", tag: "ARN-288927" },
        { name: "Nippon India Small Cap Fund - Reg (G)", folio: "88492011/92", sip: "₹3,000", invested: 110000, current: 158100, returns: "+43.7%", tag: "ARN-288927" },
        { name: "UTI Nifty 50 Index Fund - Direct (G)", folio: "99102833/00", sip: "Paused", invested: 210000, current: 271450, returns: "+29.2%", tag: "External CAS" }
      ]
    }
  }
};

// 1. SEND REAL RANDOM 6-DIGIT OTP API
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || !REGISTERED_CLIENTS[phone]) {
    return res.status(403).json({ success: false, message: "Unregistered mobile number." });
  }

  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    // OPTION 1: Send via Fast2SMS (Set FAST2SMS_API_KEY in Render Environment Variables)
    if (process.env.FAST2SMS_API_KEY) {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: phone
        })
      });
      const data = await response.json();
      if (!data.return) throw new Error(data.message || "Fast2SMS error");
      return res.json({ success: true, channel: "SMS", message: "Real SMS OTP sent to +91 " + phone });
    }

    // OPTION 2: Send via Meta WhatsApp Cloud API (Set WA_TOKEN & WA_PHONE_ID in Render)
    if (process.env.WA_TOKEN && process.env.WA_PHONE_ID) {
      const waRes = await fetch(`https://graph.facebook.com/v19.0/${process.env.WA_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "91" + phone,
          type: "template",
          template: {
            name: "umm_otp", // Your approved WhatsApp OTP template name
            language: { code: "en" },
            components: [{ type: "body", parameters: [{ type: "text", text: otp }] }]
          }
        })
      });
      const waData = await waRes.json();
      if (waData.error) throw new Error(waData.error.message);
      return res.json({ success: true, channel: "WhatsApp", message: "WhatsApp OTP sent to +91 " + phone });
    }

    // If API keys not yet added in Render, log OTP in Render Server Logs for testing
    console.log(`[UMM OTP LOG] Phone: +91${phone} | Generated OTP: ${otp}`);
    return res.json({
      success: true,
      channel: "Server Log (Add FAST2SMS_API_KEY in Render for live SMS)",
      message: "OTP generated! Check Render Logs or configure FAST2SMS_API_KEY."
    });

  } catch (err) {
    console.error("OTP Dispatch Error:", err);
    return res.status(500).json({ success: false, message: "OTP delivery failed: " + err.message });
  }
});

// 2. VERIFY OTP & RETURN CLIENT PORTFOLIO DATA
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore.get(phone);

  if (!record) {
    return res.status(400).json({ success: false, message: "OTP expired or not requested." });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  }
  if (record.otp !== otp) {
    return res.status(401).json({ success: false, message: "Invalid OTP. Please try again." });
  }

  // OTP Matched! Clear OTP and send client portfolio + admin directory if Admin
  otpStore.delete(phone);
  const clientData = REGISTERED_CLIENTS[phone];
  const adminList = clientData.isAdmin
    ? Object.keys(REGISTERED_CLIENTS).map(p => ({
        phone: p,
        name: REGISTERED_CLIENTS[p].name,
        email: REGISTERED_CLIENTS[p].email,
        pan: REGISTERED_CLIENTS[p].pan,
        sipMonthly: REGISTERED_CLIENTS[p].sipMonthly,
        iinStatus: REGISTERED_CLIENTS[p].iinStatus
      }))
    : [];

  return res.json({
    success: true,
    client: clientData,
    adminClientList: adminList
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Universal Money Mart Server running on port ${PORT}`));
