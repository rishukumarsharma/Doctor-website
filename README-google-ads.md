# Setting Up Google Ads & Conversion Tracking

This website has a built-in Google Ads and conversion tracking integration connected to the Google tag (`gtag.js`).

---

## 🚀 Current Configuration

Your Google Ads tag (**`AW-18505921013`**) is now configured and active across all pages!

The configuration is centralized in **[`js/data.js`](file:///Users/rishu/Doctor%20website/js/data.js)**:
```javascript
googleAds: {
  // Your Google Ads Conversion ID (Active):
  conversionId: "AW-18505921013",

  // (Optional) Conversion action labels created in Google Ads:
  labels: {
    bookingConfirmed: "AW-18505921013/xIb_CIOw8JgdEPXjp_hE", // Consultation Booking (Active)
    bookingStarted: "",      // Optional
    whatsappClick: "",       // Optional
    phoneClick: "",          // Optional
    contactFormSubmit: "",   // Optional
  },

  currency: "INR",
},
```

---

## 🔍 How to Find Your Google Ads Conversion ID

If you don't know your `AW-XXXXXXXXX` ID yet:

1. Sign in to your [Google Ads Account](https://ads.google.com).
2. Click **Tools and Settings** (wrench icon or left navigation).
3. Under **Measurement**, select **Conversions** (or **Goals > Summary**).
4. If you already have a conversion action, click on it and select **Tag setup** > **Install the tag yourself**.
5. Look at the code snippet. You will see your Google Ads ID in the format: `AW-XXXXXXXXX` (e.g. `AW-1234567890`).

---

## 🎯 Conversion Actions (Lead Tracking)

The website automatically fires Google Ads conversions and Google Analytics 4 events for high-intent patient interactions:

| Website Action | Triggered When | Value / Intent |
| :--- | :--- | :--- |
| **Booking Confirmed** (`bookingConfirmed`) | Patient completes the consultation booking form (`confirm_booking`) | Highest (Direct Lead) |
| **WhatsApp Chat** (`whatsappClick`) | Patient clicks floating WhatsApp button or WhatsApp links | High (Direct Inquiry) |
| **Phone Call** (`phoneClick`) | Patient clicks the clinic telephone link / call button | High (Phone Lead) |
| **Contact Form** (`contactFormSubmit`) | Patient submits inquiry on `/contact/` page | Medium-High (Inquiry) |
| **Booking Started** (`bookingStarted`) | Patient opens the booking flow | Funnel Step |

### How to add Conversion Action Labels (Recommended)
In Google Ads, creating separate conversion actions lets Google's Smart Bidding optimize specifically for consultation bookings and WhatsApp calls:

1. In Google Ads, go to **Goals > Conversions > Summary**.
2. Click **+ New conversion action** > **Website**.
3. Enter your domain: `nourishandtone.com` (or your staging URL).
4. Add a conversion action manually (e.g. Category: **Book appointment**, Goal name: **Consultation Booking**).
5. Under Tag setup, choose **Use Google Tag** or **See event snippet**.
6. Google will give you an event snippet containing `send_to: 'AW-XXXXXXXXX/AbCdEfGhIjK'`.
7. Copy the label (`AbCdEfGhIjK` or the entire `AW-XXXXXXXXX/AbCdEfGhIjK`) and paste it into the corresponding field in **[`js/data.js`](file:///Users/rishu/Doctor%20website/js/data.js)**:
   ```javascript
   labels: {
     bookingConfirmed: "AW-XXXXXXXXX/AbCdEfGhIjK",
     whatsappClick: "AW-XXXXXXXXX/LmNoPqRsTuV",
     phoneClick: "AW-XXXXXXXXX/WxYz0123456",
     contactFormSubmit: "AW-XXXXXXXXX/789AbCdEfGh",
   }
   ```

---

## 🧪 Testing & Verification

1. **Localhost testing:**
   - When running on `localhost` or `127.0.0.1`, open DevTools Console (`F12` or `Cmd+Option+I`).
   - Click a WhatsApp button, phone link, or complete a test booking.
   - You will see formatted logs such as:
     ```text
     [analytics] click_whatsapp { ... }
     [google-ads] Conversion sent: { send_to: "...", currency: "INR" }
     ```
2. **Google Tag Assistant:**
   - Visit [tagassistant.google.com](https://tagassistant.google.com).
   - Enter your website URL.
   - Tag Assistant will connect and show all active Google tags (`G-HRB72M1XT6` and your `AW-` tag) and verify conversion hits in real time.
