# VSPARK — On-Spot Programming Competition Platform
# Submitted by (Ahsan Ali SP24-BSE-004 & Amir Shahzad SP24-BSE-007)
# Submitted to: Sir Abdullah
The official live coding arena for the **On-Spot Programming Competition** at **COMSATS University Islamabad, Vehari Campus**.  
Built with **React.js, Node.js, Express, PostgreSQL (Sequelize / Supabase)**, and **Tailwind CSS**.

---

## 🎯 Competition Marks & Scoring Structure (Total: 60 Marks)

The platform enforces a strict **60 Marks** competition structure with flexible teacher management:

| Difficulty Tier | Default Marks | Allocation Options | Description |
| :--- | :--- | :--- | :--- |
| **Easy** | **10 Marks** | 1 Question @ 10 pts | Foundational algorithmic logic & data structures |
| **Medium** | **20 Marks** | 1 Question @ 20 pts | Intermediate problem-solving & optimizations |
| **Tough** | **30 Marks** | **Option A (Teacher Choice):**<br>• **3 Questions @ 10 Marks each** (3 × 10 = 30 pts)<br><br>**Option B:**<br>• **1 Question @ 30 Marks** (1 × 30 = 30 pts) | Advanced algorithms, dynamic programming, trees/graphs |
| **Total** | **60 Marks** | **Balanced Total: 60 Points** | Real-time balance validation on Admin Dashboard |

> **Teacher Choice Feature:** In the Admin Question Portal, teachers can add 3 Tough questions worth 10 marks each (Option A) or 1 Tough question worth 30 marks (Option B). The backend and dashboard validate that the total sum of all questions equals exactly **60 Marks**.

---

## 🚀 Key Features

### 👨‍🏫 Admin Module
- **Dashboard & Telemetry**: Live metrics for registered students, submission counts, and real-time 60-marks balance breakdown (`Easy: 10/10`, `Med: 20/20`, `Tough: 30/30`).
- **Flexible Question Management**:
  - Add, edit, and delete questions with custom marks assignment.
  - Dedicated Tough portion toggle: *3 Questions Mode (10 pts each)* vs *Single Question Mode (30 pts)*.
  - Language restriction support per question (C++, JavaScript, Java, Python).
- **Bulk Upload**: Import multiple problems simultaneously via CSV or JSON with optional explicit `marks`.
- **Quiz Controls**: Activate/deactivate competition, set countdown duration (e.g. 120 minutes), and toggle live state.
- **Student Monitoring & Verification**:
  - Individual vs Group (2 members) registrations.
  - Roll numbers, CNIC/B-Form, department, phone, and university tracking.
- **Competition Secret Codes**: Generate and export unique access codes for students (TXT, CSV, JSON).
- **Submissions & Grading**: Real-time code inspection, language filters, manual marks review, and examiner feedback.
- **Anti-Cheat Event Logs**: Comprehensive timeline of tab switching, window blur, and unauthorized keyboard attempts per student.

### 👨‍💻 Student Module
- **Registration**: Support for individual or 2-person group participation with university affiliation.
- **Language Selection**: One-time lock-in for C++, JavaScript, Java, or Python.
- **In-Browser IDE**: Syntax-highlighted code editor with line numbers, auto-indentation, and multi-question tabs.
- **Dynamic Question Loading**: Questions render dynamically matching the student's chosen language and custom marks (e.g., 3 Tough questions @ 10 marks each).
- **Auto-Save & Final Submit**: Intermediate drafts are safely stored; final submission locks student answers.
- **Server-Synchronized Timer**: Authoritative server timer automatically submits work when time expires.
- **Result Portal**: View individual scores, breakdown, question-wise grades, and feedback.

### 🛡️ Anti-Cheating & Integrity Guard
- **Clipboard Lockdown**: Cut, Copy, and Paste blocked inside code editor and problem descriptions.
- **Restricted Shortcuts**: Blocks `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+S`, `Ctrl+U`, `F12`, `Ctrl+Shift+I` (DevTools).
- **Tab & Window Monitoring**: Detects `visibilitychange` and window `blur` events, immediately logging infractions to the admin panel with timestamps.
- **Right-Click Block**: Context menu disabled during the active quiz.
- **Server-Side Verification**: Backend checks ensure quiz is currently active and submission deadline hasn't elapsed.

---

## 🛠️ Technology Stack

### Backend
- **Node.js & Express.js**: REST API server
- **PostgreSQL**: Relational database (ACID compliant, zero orphaned records)
- **Sequelize ORM**: Schema definitions, auto-migrations, hooks, and relationships
- **JWT & bcryptjs**: Secure bearer tokens and hashed admin/student credentials
- **express-validator**: Sanitization and payload validation
- **express-rate-limit**: Protection against brute-force attacks on login endpoints
- **Multer & csv-parser**: File ingestion for bulk question uploads

### Frontend
- **React.js (v18)**: Single Page Application (SPA)
- **React Router (v6)**: Protected route guards for students and admins
- **Tailwind CSS**: Responsive dark mode design
- **Axios**: Interceptor-based API client with automatic authorization headers
- **Context API**: Global state for Auth and Competition controls

### Database & Deployment
- **Database**: Cloud PostgreSQL on **Supabase** (Transaction / Session Pooler) or local PostgreSQL
- **Backend Hosting**: **Render** / Railway / DigitalOcean
- **Frontend Hosting**: **Vercel** / Netlify (with SPA rewrite rules in `vercel.json`)

---

## 📂 Project Directory Structure

```
Mid/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection (Local & Supabase Pooler)
│   ├── middleware/
│   │   ├── auth.js              # Admin & Student JWT verification
│   │   ├── validation.js        # Input validation & marks constraint checks
│   │   └── rateLimiter.js       # Login brute-force limiter
│   ├── models/
│   │   ├── Admin.js             # Admin credentials & lock counters
│   │   ├── Student.js           # Student registrations & group details
│   │   ├── Question.js          # Questions, difficulty, & custom marks
│   │   ├── Submission.js        # Student code answers & marks awarded
│   │   ├── QuizSettings.js      # Global timer & contest active status
│   │   ├── EventLog.js          # Anti-cheat violation logs
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── adminRoutes.js       # Admin endpoints & 60-marks calculations
│   │   └── studentRoutes.js     # Student quiz flow & code submissions
│   ├── .env                     # Environment variables (DB credentials, JWT)
│   ├── package.json
│   └── server.js                # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template (dark theme)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.js    # In-browser code editing area
│   │   │   ├── Timer.js         # Countdown timer component
│   │   │   └── ProtectedRoute.js# Route auth guard
│   │   ├── context/
│   │   │   ├── AuthContext.js   # User session context
│   │   │   └── ThemeContext.js  # Theme management
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page (VSPARK branding)
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.js    # Statistics & 60-marks balance bar
│   │   │   │   ├── AdminLogin.js        # Admin authentication
│   │   │   │   ├── Questions.js         # Question CRUD & marks preset selector
│   │   │   │   ├── BulkUpload.js        # CSV/JSON question importer
│   │   │   │   ├── Students.js          # Student registry
│   │   │   │   ├── Submissions.js       # Examiner grading portal
│   │   │   │   ├── CompetitionCodes.js  # Unique code exporter
│   │   │   │   └── QuizSettings.js      # Contest duration & activation
│   │   │   └── student/
│   │   │       ├── StudentRegister.js   # Individual / Group sign-up
│   │   │       ├── StudentLogin.js      # Student login
│   │   │       ├── LanguageSelection.js # C++, Python, Java, JS lock
│   │   │       ├── StartQuiz.js         # Instructions & start portal
│   │   │       ├── Quiz.js              # Live coding arena
│   │   │       └── MySubmissions.js     # Results & review
│   │   ├── utils/
│   │   │   ├── api.js           # Centralized Axios API client
│   │   │   └── antiCheat.js     # Anti-cheat event listeners & shortcut blockers
│   │   ├── App.js               # Route declarations
│   │   └── index.js
│   ├── vercel.json              # Vercel SPA routing configuration
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (Local instance or Supabase Cloud connection)

### 2. Backend Configuration
Create or update `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=vspark_secure_jwt_secret_key_2024_comsats

# For Cloud PostgreSQL (Supabase Session Pooler):
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.your_project_ref
DB_PASSWORD=your_supabase_password

# OR for Local PostgreSQL:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=vspark
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
```

Install dependencies and run:
```bash
cd backend
npm install
npm start
```

### 3. Frontend Configuration
Create or update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Install dependencies and run:
```bash
cd frontend
npm install
npm start
```
The application will launch on `http://localhost:3000`.

---

## 📝 Sample Bulk Upload Formats

### CSV Format (`sample-questions.csv`)
```csv
title,problemStatement,difficulty,marks,validLanguages
"Sum of Array Elements","Given an integer array nums, return the sum of all elements.","Easy",10,"cpp,javascript,java,python"
"Two Sum Problem","Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.","Medium",20,"cpp,javascript,java,python"
"Binary Tree Maximum Path Sum","Find the maximum path sum in a binary tree.","Tough",10,"cpp,javascript,java,python"
"Shortest Path with Obstacles","Find the minimum steps to reach the destination walking through obstacles.","Tough",10,"cpp,javascript,java,python"
"Word Break II","Given a string s and a dictionary of words, return all possible valid sentences.","Tough",10,"cpp,javascript,java,python"
```

### JSON Format (`sample-questions.json`)
```json
[
  {
    "title": "Sum of Array Elements",
    "problemStatement": "Given an integer array nums, return the sum of all elements.",
    "difficulty": "Easy",
    "marks": 10,
    "validLanguages": ["cpp", "javascript", "java", "python"]
  },
  {
    "title": "Two Sum Problem",
    "problemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Medium",
    "marks": 20,
    "validLanguages": ["cpp", "javascript", "java", "python"]
  },
  {
    "title": "Binary Tree Maximum Path Sum",
    "problemStatement": "Find the maximum path sum in a binary tree.",
    "difficulty": "Tough",
    "marks": 10,
    "validLanguages": ["cpp", "javascript", "java", "python"]
  },
  {
    "title": "Shortest Path with Obstacles",
    "problemStatement": "Find the minimum steps to reach the destination walking through obstacles.",
    "difficulty": "Tough",
    "marks": 10,
    "validLanguages": ["cpp", "javascript", "java", "python"]
  },
  {
    "title": "Word Break II",
    "problemStatement": "Given a string s and a dictionary of words, return all possible valid sentences.",
    "difficulty": "Tough",
    "marks": 10,
    "validLanguages": ["cpp", "javascript", "java", "python"]
  }
]
```

---

## Screenshots
<img width="944" height="437" alt="Screenshot 2026-11-21 224340" src="https://github.com/user-attachments/assets/6f7ddb43-49ff-4c45-886c-a1868b4eea87" />

<img width="948" height="439" alt="Screenshot 2026-11-21 224358" src="https://github.com/user-attachments/assets/dee456e2-bff8-4f5e-97a1-09723c98e6c6" />

<img width="947" height="439" alt="Screenshot 2026-11-21 224412" src="https://github.com/user-attachments/assets/ec3f27e6-5901-42c8-b7de-89e0f2e27cd1" />

<img width="948" height="436" alt="Screenshot 2026-11-21 224644" src="https://github.com/user-attachments/assets/32b2c2fb-534e-498f-b415-8225ce3e5e8c" />

<img width="957" height="437" alt="Screenshot 2026-11-21 224702" src="https://github.com/user-attachments/assets/a2574501-b936-468f-9ec5-5c0f4d5cc268" />






