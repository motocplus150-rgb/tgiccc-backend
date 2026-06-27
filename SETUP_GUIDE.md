# 🏛️ TGiCCC Backend — Complete Setup Guide

### For beginners — follow every step carefully

\---

## 📦 What's Inside This Backend

|File/Folder|What It Does|
|-|-|
|`server.js`|The main file that starts the server|
|`config/db.js`|Connects to MongoDB database|
|`models/`|Defines data structure (User, Incident, Notice, Attendance)|
|`routes/`|All the API endpoints|
|`middleware/auth.js`|Checks login tokens|
|`utils/email.js`|Sends emails|
|`seeder.js`|Fills database with sample data|

\---

## 🛠️ STEP 1 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS version** (green button)
3. Install it (click Next → Next → Finish)
4. Open a terminal / command prompt and verify:

```
   node --version
   npm --version
   ```

   Both should show version numbers ✅

   \---

   ## 🗄️ STEP 2 — Set Up MongoDB Atlas (Free Cloud Database)

1. Go to **https://www.mongodb.com/atlas**
2. Click **Try Free** → Create account (free, no credit card)
3. Choose **Free tier (M0)** → Select any region → Create Cluster
4. On the left, click **Database Access** → Add New Database User

   * Username: `tgiccc\_admin`
   * Password: choose a strong password, **save it!**
   * Role: **Atlas Admin**
5. Click **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Database** → **Connect** → **Drivers**

   * Copy the connection string. It looks like:

   ```
     mongodb+srv://tgiccc\_admin:<password>@cluster0.xxxxx.mongodb.net/
     ```

   * Replace `<password>` with your actual password

   \---

   ## 📧 STEP 3 — Set Up Gmail for Emails

1. Go to your Google Account → **Security**
2. Turn on **2-Step Verification** (required)
3. Search for **App Passwords** → Create one

   * App: Mail, Device: Other → name it "TGiCCC"
   * Copy the **16-character password** shown

   \---

   ## ⚙️ STEP 4 — Configure the Backend

1. In the `tgiccc-backend` folder, copy `.env.example` → rename it to `.env`
2. Open `.env` in Notepad and fill in:

   ```
PORT=5000
NODE\_ENV=development

MONGODB\_URI=mongodb+srv://tgiccc\_admin:YOUR\_PASSWORD@cluster0.xxxxx.mongodb.net/tgiccc?retryWrites=true\&w=majority

JWT\_SECRET=TGiCCC\_Super\_Secret\_Key\_Replace\_This\_With\_Something\_Long\_2024

EMAIL\_HOST=smtp.gmail.com
EMAIL\_PORT=587
EMAIL\_USER=youremail@gmail.com
EMAIL\_PASS=your16charapppassword
EMAIL\_FROM=TGiCCC Portal <youremail@gmail.com>

FRONTEND\_URL=http://localhost:3000
```

   \---

   ## 🚀 STEP 5 — Install \& Run the Backend

   Open terminal in the `tgiccc-backend` folder:

   ```bash
# Install all packages (do this once)
npm install

# Seed the database with sample data
node seeder.js --import

# Start the server
npm start
```

   You should see:

   ```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 TGiCCC Backend running on port 5000
```

   Test it by opening your browser: **http://localhost:5000/api/health**
You should see: `{"success": true, "message": "TGiCCC Backend is running"}`

   \---

   ## 🔌 STEP 6 — Connect Your Frontend (index.html)

   In your `script.js`, replace the login function to call the backend instead of localStorage:

   ```javascript
// At the top of script.js, add:
const API\_URL = 'http://localhost:5000/api';

// Replace your login function with this:
async function login() {
    const employeeId = document.getElementById('loginEmployeeId').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API\_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, password })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('tgiccc\_token', data.token);
            localStorage.setItem('tgiccc\_current\_user', JSON.stringify(data.user));
            currentUser = data.user;
            showDashboard();
        } else {
            showToast('error', 'Login Failed', data.message);
        }
    } catch (err) {
        showToast('error', 'Error', 'Cannot connect to server');
    }
}

// Helper: Get auth headers for all API calls
function authHeaders() {
    const token = localStorage.getItem('tgiccc\_token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// Example: Load incidents from backend
async function loadIncidents() {
    const response = await fetch(`${API\_URL}/incidents`, { headers: authHeaders() });
    const data = await response.json();
    if (data.success) {
        // Use data.incidents array to render your incident cards
        renderIncidents(data.incidents);
    }
}
```

   \---

   ## ☁️ STEP 7 — Deploy to Render.com (Free Cloud Hosting)

1. Go to **https://render.com** → Sign up free
2. Click **New** → **Web Service**
3. Connect your GitHub repo (upload the backend folder to GitHub first)
4. Settings:

   * **Name:** tgiccc-backend
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Click **Environment** tab → Add all your `.env` variables
6. Click **Deploy** → Wait 2-3 minutes
7. Your backend will be live at: `https://tgiccc-backend.onrender.com`
8. Update `FRONTEND\_URL` in Render to your frontend URL

   \---

   ## 📡 API Endpoints Reference

   ### Authentication

|Method|URL|Description|
|-|-|-|
|POST|`/api/auth/login`|Login with Employee ID \& password|
|POST|`/api/auth/register`|Register new employee (Admin only)|
|GET|`/api/auth/me`|Get current logged-in user|
|PATCH|`/api/auth/change-password`|Change password|

### Incidents

|Method|URL|Description|
|-|-|-|
|GET|`/api/incidents`|List all incidents (with filters)|
|GET|`/api/incidents/stats`|Dashboard stats|
|POST|`/api/incidents`|Report new incident|
|PATCH|`/api/incidents/:id`|Update incident|
|DELETE|`/api/incidents/:id`|Delete (Admin only)|

### Notices

|Method|URL|Description|
|-|-|-|
|GET|`/api/notices`|Get all notices|
|POST|`/api/notices`|Post notice (Admin/Supervisor)|
|PATCH|`/api/notices/:id`|Edit notice|
|DELETE|`/api/notices/:id`|Delete notice (Admin only)|

### Attendance

|Method|URL|Description|
|-|-|-|
|GET|`/api/attendance`|Own attendance history|
|GET|`/api/attendance/today`|Today's check-in status|
|POST|`/api/attendance/checkin`|Check in|
|PATCH|`/api/attendance/checkout`|Check out|

### Users / Directory

|Method|URL|Description|
|-|-|-|
|GET|`/api/users`|List all employees|
|GET|`/api/users/departments`|List all departments|
|PATCH|`/api/users/profile/me`|Update own profile|

\---

## 🔑 Default Login (after seeding)

|Role|Employee ID|Password|
|-|-|-|
|Admin|ADMIN001|Admin@1234|
|Employee|EMP001|Emp@1234|
|Supervisor|SUP001|Sup@1234|

\---

## ❓ Common Problems

**"Cannot connect to server"** → Make sure `npm start` is running in the terminal

**"Invalid token"** → Log out and log in again

**MongoDB connection failed** → Check your `MONGODB\_URI` in `.env`, make sure IP is whitelisted

**Emails not sending** → Check your Gmail App Password is correct (not your regular password)

\---

*Built for TGiCCC — Telangana Integrated Command and Control Centre*

