const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Temporary in-memory OTP store (Expires in 5 minutes)
const otpStore = new Map();

// Registered Clients Database
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

// Configure Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

// 1. SEND REAL 6-DIGIT OTP TO REGISTERED CLIENT'S GMAIL
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  const client = REGISTERED_CLIENTS[phone];

  if (!phone || !client) {
    return res.status(403).json({ success: false, message: "Unregistered mobile number." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      await transporter.sendMail({
        from: `"Universal Money Mart Vault" <${process.env.GMAIL_USER}>`,
        to: client.email,
        subject: `${otp} is your Universal Money Mart Client Vault OTP`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
            <h2 style="color:#0f172a;margin-bottom:8px">Universal Money Mart</h2>
            <p style="color:#475569;font-size:14px">Hi <strong>${client.name}</strong>,</p>
            <p style="color:#475569;font-size:14px">Your 6-digit Client Wealth Vault verification OTP is:</p>
            <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:10px;font-size:28px;font-weight:bold;letter-spacing:8px;color:#4f46e5;margin:18px 0">
              ${otp}
            </div>
            <p style="color:#94a3b8;font-size:12px">Valid for 5 minutes. Do not share this OTP with anyone.<br>AMFI Registered MFD (ARN-288927)</p>
          </div>
        `
      });

      const maskedEmail = client.email.replace(/(.{3})(.*)(@.*)/, "$1***$3");
      return res.json({
        success: true,
        message: `6-Digit OTP sent to your registered Gmail (${maskedEmail})!`
      });
    }

    console.log(`[UMM OTP LOG] Phone: +91${phone} | Generated OTP: ${otp}`);
    return res.json({
      success: true,
      message: "OTP generated! Add GMAIL_USER & GMAIL_APP_PASS in Render Environment."
    });
  } catch (err) {
    console.error("Gmail OTP Error:", err);
    return res.status(500).json({ success: false, message: "Email OTP failed: " + err.message });
  }
});

// 2. VERIFY 6-DIGIT OTP & UNLOCK PORTFOLIO
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore.get(phone);

  if (!record || Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  }
  if (record.otp !== otp) {
    return res.status(401).json({ success: false, message: "Invalid 6-digit OTP!" });
  }

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

  return res.json({ success: true, client: clientData, adminClientList: adminList });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Universal Money Mart Server running on port ${PORT}`));
