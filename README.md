#  MediChain – Medical Records Management System

> A full-stack web application to manage medical records securely with JWT-based authentication.

---

## Project Structure

```
medichain/
├── backend/
│   ├── .env              # Environment variables
│   ├── package.json
│   └── server.js         # Express API + Mongoose + JWT authentication
└── frontend/
    ├── .env              # VITE_API_URL
    ├── index.html
    ├── package.json
    ├── viteconfig.js
    └── src/
        ├── main.jsx      # React entry point
        ├── App.jsx       # Router + Auth Context
        ├── index.css     # Global styles (dark theme)
        ├── api.js        # All Axios API calls
        ├── Login.jsx     # Login + Register page
        ├── Dashboard.jsx # Main dashboard
        └── AddRecord.jsx # Add medical record form
```

---

##  Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)
- npm or yarn

---

### Backend Setup

```bash
cd medichain/backend
npm install
```

Make sure MongoDB is running:
```bash
# On macOS/Linux
mongod --dbpath /data/db

# On Windows
mongod
```

Start the backend:
```bash
npm run dev       # Development (with nodemon)
# OR
npm start         # Production
```

Backend runs at: `http://localhost:5000`

---

### Frontend Setup

```bash
cd medichain/frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

##  Features

### Authentication
- JWT-based login & registration
- Role support: Patient / Doctor / Admin
- Protected routes with auto-redirect
- Token persisted in localStorage

### Medical Records
- Add records with: diagnosis, symptoms, prescription, treatment, notes
- 6 record types: Consultation, Lab Report, Prescription, Surgery, Vaccination, Other
- Search & filter records
- Expandable record details
- Delete records

### Dashboard
- Stats overview (total records, verified blocks, type breakdown)
- Recent records table
- Blockchain ledger view
- User profile view

---

##  API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user (auth required) |

### Records
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/records | Add record (auth required) |
| GET | /api/records | Get my records (auth required) |
| GET | /api/records/all | Get all records |
| GET | /api/records/:id | Get single record |
| PUT | /api/records/:id | Update record |
| DELETE | /api/records/:id | Delete record |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/stats | Dashboard stats (auth required) |
| GET | /api/health | Health check |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios |
| Styling | Pure CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Blockchain | SHA-256 hashing (Node.js crypto module) |
| Build Tool | Vite |

---

##  UI Highlights

- Dark navy + teal color scheme
- Syne + DM Sans typography
- Animated card interactions
- 4-section sidebar navigation
- Responsive blockchain ledger visualization
- Beautiful record type selector

---

##  Sample API Usage

### Register
```json
POST /api/auth/register
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "patient",
  "bloodGroup": "O+"
}
```

### Add Record
```json
POST /api/records
Authorization: Bearer <your_jwt_token>
{
  "patientName": "Rahul Sharma",
  "doctorName": "Priya Patel",
  "diagnosis": "Type 2 Diabetes Mellitus",
  "symptoms": "Frequent urination, fatigue",
  "prescription": "Metformin 500mg twice daily",
  "treatment": "Diet control + medication",
  "recordType": "consultation",
  "hospital": "Apollo Hospital Mumbai"
}
```

---

##  Roles

- **Patient** – Can add and view their own records
- **Doctor** – Can view all records


---

