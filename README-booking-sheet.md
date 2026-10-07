# Recording bookings into a Google Sheet

This site is static (GitHub Pages) with no server, so form submissions need
somewhere free to land. The booking form (`book-consultation/index.html` /
`js/booking.js`) is wired to send each booking as a GET request (data in the
URL's query string) to a Google Apps Script "Web App" that appends a row to
a Google Sheet. You can open that sheet anytime, or download it as `.xlsx`
via **File > Download > Microsoft Excel (.xlsx)**.

A GET request is used instead of POST because Apps Script Web Apps relay a
POST body through a second domain (`script.googleusercontent.com`), and that
hop can fail in browsers that block cross-site cookies (Safari/Chrome).
GET requests hit the Web App URL directly with no extra hop, so they're far
more reliable for this use case.

## Form validation (client side)

`js/booking.js` enforces these before a booking is sent:

- **Date:** past dates can't be chosen (the picker's minimum is today in the
  visitor's local time, and a typed-in past date is rejected).
- **Phone:** digits only, maximum 10 (non-digits are stripped as the user
  types or pastes); exactly 10 digits are required to continue.
- **Email:** optional, but must look like a valid address if filled in.

## 1. Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   spreadsheet, e.g. **"Consultation Bookings"**.
2. Rename the first tab to `Bookings`.
3. Add this header row:
   `Timestamp | Service | Treatment | Consultation Goal | Type | Date | Time | Name | Phone | Email | Notes`

## 2. Add the Apps Script

1. In the sheet, go to **Extensions > Apps Script**.
2. Delete any starter code and paste in the contents of `Code.gs` (below).
3. Save the project (any name).

```js
function doGet(e) {
  return recordBooking(e);
}

function doPost(e) {
  return recordBooking(e);
}

function recordBooking(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Bookings");
  if (!sheet) {
    sheet = ss.insertSheet("Bookings");
    sheet.appendRow([
      "Timestamp", "Service", "Treatment", "Goal", "Type", "Date", "Time",
      "Name", "Phone", "Email", "Notes",
    ]);
  }

  var p = e.parameter;
  sheet.appendRow([
    p.timestamp || new Date().toISOString(),
    p.service || "",
    p.treatment || "",
    p.goal || "",
    p.type || "",
    p.date || "",
    p.time || "",
    p.name || "",
    p.phone || "",
    p.email || "",
    p.notes || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

This version doesn't depend on your existing tab's name — it creates a
`Bookings` tab (with headers) the first time it runs if one doesn't already
exist, and reuses it afterward. It also handles both GET and POST, in case
you want to test either way.

> **Already have a sheet running?** The site now also sends a `goal` field
> (the "Consultation Goal" chosen on the home page). Your already-deployed
> Apps Script will silently ignore it until you: open the script editor,
> replace the code with the version above (now includes the `Goal` column),
> add `Goal` as a header in your existing sheet in the same position, and
> create a **new deployment version** (step 3 below) — editing the code
> alone does not update a live `/exec` URL.

## 3. Deploy as a Web App

1. Click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions
   (it's your own script, so this is safe).
5. Copy the **Web app URL** it gives you (ends in `/exec`).

## 4. Wire it into the site

Open [js/booking.js](js/booking.js) and set the constant near the top (it is
already set to the current deployment; replace it if you redeploy under a new
URL):

```js
const BOOKING_SHEET_WEBHOOK_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with the URL you copied. Commit and push — new bookings made through the
"Confirm & Continue" button on the payment step will now append a row to
the `Bookings` sheet.

## Notes

- Every time you edit the Apps Script code, you must create a **new
  deployment** (or use "Manage deployments > Edit > New version") for the
  change to take effect at the same URL.
- The request is sent as a GET with the data in the query string, so the
  booking is recorded even if the browser can't read the response.
- If you'd rather record contact-form submissions too, the same Apps Script
  pattern works — add a second sheet tab and a small `if` in `recordBooking`
  based on a `formType` field, then wire `contact/index.html`'s form the
  same way.
