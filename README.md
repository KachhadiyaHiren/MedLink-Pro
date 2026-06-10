# HealOne 360 — Database-Driven Healthcare Portal Suite

HealOne 360 is a modern, responsive, and database-driven healthcare portal suite built using **Next.js (App Router), TypeScript, and Prisma ORM with SQLite**. It provides a seamless, integrated clinical workspace connecting Doctors, Patients, and Labs in a secure proof-of-concept sandbox environment.

## 🚀 Key Features

### 👨‍⚕️ 1. Doctor Portal
* **Practice Queue:** A premium Card Grid View of all consultations sorted latest first.
* **SOAP clinical workspace:** Log patient vitals (BP, pulse, temp, SpO2, weight, height) and enter optional Subjective, Objective, Assessment, and Treatment Plan notes.
* **Digital Prescriptions:** Instantly compiles and previews printable prescription slips with ordered diagnostics and follow-up recommendations.
* **Specialist Referrals:** Outbound specialist referrals tracker with month-wise statistics, urgent/routine tags, and real-time accepted/completed status pipelines.
* **Interactive Analytics:** Gorgeous custom SVG bar and donut charts illustrating monthly patient volumes, top diagnostic categories, and referred doctor summaries with cursor hover tooltips and toggles.

### 👩‍⚕️ 2. Patient Portal
* **Records Wallet:** Premium glassmorphism card grid organizing all clinical prescription slips and diagnostic reports sorted latest first.
* **PDF Reports Selector:** Active PDF file selector inside report upload forms allowing patients to link local PDF files directly under appointment codes.
* **Simulated PDF Viewer:** Displays high-fidelity clinical report documents (NABL layout, patient demographics, parameter tables, digital signatures) with printing support.
* **Appointments & Pharmacy:** Find specialized doctors, book tomorrow's calendar slots, and checkout online pharmacy carts with COD options.

### 🧪 3. Lab Portal & System Admin
* **Lab Queue:** Claim ordered diagnostics, track status (ordered, assigned, completed), and upload clinical reports against appointment codes.
* **Admin approvals:** Review doctor credentials, approve partner registration requests, and inspect live stats.

---

## 🛠️ Technology Stack
* **Framework:** Next.js 16 (React 19, TypeScript)
* **ORM:** Prisma ORM
* **Database:** Local SQLite (`prisma/dev.db`)
* **Styling:** Premium Vanilla CSS (Harmonious HSL theme system, glassmorphism cards, layouts)
* **Icons:** FontAwesome v6 CDN
* **Charts:** Interactive state-driven custom SVG vector charts

---

## 📥 Getting Started & Installation

Follow these steps to clone the repository, initialize the SQLite database, seed mockup clinical records, and start the application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/KachhadiyaHiren/HealOne-360.git
cd HealOne-360
```

### 2. Install Project Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 3. Initialize & Sync Database
Run the Prisma sync command to build the local SQLite database schema and generate the client types:
```bash
npx prisma db push
```

### 4. Seed Mockup Datasets
Pre-populate the SQLite tables with verified doctors, patients, medicine catalogs, and appointments:
```bash
npx prisma db seed
```

### 5. Run the Next.js Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to access the portal suite.

---

## 🔒 Sandbox Testing Workflow (OTP: 1234)

To bypass SMS messaging rates during testing, use the mock OTP **`1234`** on all account verifications:

1. **Patient Booking:**
   - Log in as **Patient** -> select **Jane Smith** and log in.
   - Go to **Find & Book Doctors** -> Book a slot tomorrow for **Dr. Sarah Jenkins** with complaint: *"Lipid checkup"*.
2. **Doctor SOAP & Test Orders:**
   - Log in as **Doctor** -> select **Dr. Sarah Jenkins**.
   - Notice the schedule queue in card format. Click anywhere on Jane Smith's card to view her clinical history timeline.
   - Return and click **Start SOAP** on Jane's card. Check **Lipid Profile** in lab orders, check **Refer to Specialist** (select **Dr. Rajesh Patil**), and click **Save & Print**.
3. **Lab Uploads PDF:**
   - Log in as **Lab** -> **Apex Diagnostics**.
   - Click **Upload Direct Diagnostic Report**, select Jane's appointment, select a local PDF file, type in findings, and submit.
4. **Records Wallet:**
   - Log back in as **Patient** -> **Jane Smith** -> **Records Wallet**.
   - Inspect the card grid. Click **View Simulated Report PDF** to preview and print the verified lab PDF document.
