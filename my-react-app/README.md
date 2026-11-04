# Personalized Developer Portfolio & Custom Firebase CMS

An art-directed, monochrome developer portfolio and single-administrator Content Management System (CMS) built with **React**, **Cloud Firestore**, **Firebase Authentication**, and **Firebase Storage**.

---

## 1. Quick Start

```bash
cd my-react-app
npm install
npm run dev
```

---

## 2. Connecting Your Firebase Project & Single-Admin Setup

### Step 1 — Create Firebase Resources
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → **Sign-in method** → Enable **Email/Password**.
3. Go to **Authentication** → **Users** → Click **Add user** and enter your administrator email and password.
4. Copy the **User UID** generated for your account (e.g., `xYz123AbC456...`).
5. Enable **Cloud Firestore** (start in production mode) and **Firebase Storage**.

### Step 2 — Configure `.env`
Copy `.env.example` to `.env` inside `my-react-app/` and fill in your Firebase Web App configuration and your Administrator UID:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Must match your Firebase Auth User UID
VITE_ADMIN_UID=your_firebase_auth_uid
```

> **Tip**: If you sign in at `/admin/login` before setting `VITE_ADMIN_UID`, the application will display an interactive **UID Setup Screen** showing your exact Firebase UID with a one-click copy button.

### Step 3 — Deploy Firestore & Storage Security Rules
1. Open [`firestore.rules`](./firestore.rules) and [`storage.rules`](./storage.rules).
2. Replace `REPLACE_WITH_YOUR_FIREBASE_ADMIN_UID` with your actual Firebase Auth UID.
3. Deploy the rules using the Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
   *(Alternatively, copy and paste the contents of `firestore.rules` and `storage.rules` directly into the **Rules** tabs of Cloud Firestore and Firebase Storage in the Firebase Console.)*

### Step 4 — Initialize Default Portfolio Content (One Click)
1. Navigate to `/admin/login` (via the discreet `[ CMS ]` link in the top navigation bar or footer) and sign in.
2. On the **System Dashboard** (`/admin/dashboard`), click **⚡ INITIALIZE DEFAULT DB CONTENT**.
3. This automatically populates `siteContent`, the 9 initial technologies in `tools` (`JavaScript`, `Node.js`, `Express.js`, `Python`, `Django`, `Java`, `React`, `Firebase`, `SQL`), and starter entries in `projects` and `interests`.

---

## 3. Manual Assets Guide (`public/assets/`)

All manual assets have built-in monochrome SVG fallbacks so the website never breaks if a file is not yet placed. You can also upload and replace your portrait, project covers, screenshots, and hobby photos directly from the **Admin CMS** via Firebase Storage.

| Asset Purpose | Exact File Path | Recommended Dimensions | Format |
| :--- | :--- | :--- | :--- |
| **Hero Portrait (Cutout)** | `public/assets/portrait.webp` | `1200 × 1500 px` (`4:5` vertical, transparent background preferred) | `.webp` (or `.png`) |
| **Dark Hero Wave SVG** | `public/assets/hero-waves.svg` | `1920 × 1080 px` (`16:9` vector) | `.svg` |
| **Light Section Gray Waves** | `public/assets/light-waves.svg` | `1920 × 1080 px` (`16:9` vector) | `.svg` |
| **Subtle Film Grain** | `public/assets/noise.svg` | `200 × 200 px` tileable | `.svg` |
| **Portrait Fallback** | `public/assets/portrait-fallback.svg` | `800 × 1000 px` (`4:5` vector) | `.svg` |
| **Project Cover Fallback** | `public/assets/project-placeholder.svg` | `1600 × 1000 px` (`16:10` vector) | `.svg` |
| **Interest Cover Fallback** | `public/assets/interest-placeholder.svg` | `1200 × 900 px` (`4:3` vector) | `.svg` |
