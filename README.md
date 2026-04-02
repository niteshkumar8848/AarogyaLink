# AarogyaLink

AarogyaLink is a full-stack healthcare operations platform for appointment booking and real-time token queue management across multiple hospitals.

It includes role-based portals for patients, doctors, and administrators with secure authentication, doctor approval workflows, queue tracking, notifications, and reporting.

## Highlights

- Patient, Doctor, and Admin role-based access
- Doctor self-registration with admin approval before doctor login
- Booking with token generation and queue position tracking
- Real-time queue updates (Socket.IO)
- Doctor treatment completion flow with token resequencing
- Profile management with persistent profile photo storage in MongoDB
- Hospital governance by admin (doctors select only registered hospitals)
- Operational reporting endpoints for admin

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT access + refresh tokens
- Realtime: Socket.IO

## Repository Structure

```text
aarogyalink/
├── client/                 # React frontend
├── server/                 # Express backend
├── .env.example            # Environment template
├── .gitignore
└── README.md
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB instance (local or cloud)

### 2. Configure Environment

From project root:

```bash
cp .env.example .env
```

Set required values in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aarogyalink
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Backend

```bash
cd server
npm install
npm run dev
```

### 4. Run Frontend

```bash
cd client
npm install
npm run dev
```

Application URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Default Seed Credentials (Development)

When the database is empty, default accounts are seeded automatically at server startup:

- Admin: `admin@aarogyalink.com` / `Admin@123`
- Doctor: `doctor@aarogyalink.com` / `Doctor@123`

You can override with env vars:

- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_DOCTOR_EMAIL`, `DEFAULT_DOCTOR_PASSWORD`

## Role Workflows

### Patient

- Browse and filter doctors
- Book appointments
- View queue status/token progress
- Track upcoming appointments

### Doctor

- Login only after admin approval
- View dashboard and date-wise appointments
- Manage queue and mark treatment complete
- Update profile and professional details

### Admin

- Manage hospitals and doctors
- Approve/reject doctor registrations
- Edit doctor details
- Monitor appointments, queues, and reports

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/register-doctor`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/:id`
- `POST /api/doctors` (admin)
- `PUT /api/doctors/:id` (admin/doctor)
- `PATCH /api/doctors/:id/approval` (admin)
- `DELETE /api/doctors/:id` (admin)

### Hospitals

- `GET /api/hospitals`
- `GET /api/hospitals/:id`
- `POST /api/hospitals` (admin)
- `PUT /api/hospitals/:id` (admin)

### Appointments

- `GET /api/appointments` (patient)
- `POST /api/appointments` (patient)
- `PUT /api/appointments/:id`
- `GET /api/appointments/doctor/:doctorId` (doctor/admin)
- `GET /api/appointments/admin` (admin)

### Queue

- `GET /api/queue/:doctorId/:date`
- `GET /api/queue/patient/:appointmentId`
- `POST /api/queue/next/:doctorId` (doctor)
- `POST /api/queue/walkin` (admin)
- `PUT /api/queue/status/:appointmentId` (doctor/admin)
- `POST /api/queue/reset` (admin)

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Reports

- `GET /api/reports/flow`
- `GET /api/reports/consultations`
- `GET /api/reports/queue-metrics`

## Security Notes

- Password hashing via bcrypt
- JWT token-based auth with refresh flow
- Role-based authorization middleware
- Helmet + CORS + rate limiting on auth endpoints
- Request size limits to protect from oversized payloads

## Branding Assets

- Source logo path: `client/src/assets/branding/aarogyalink-logo.png`
- Public favicon path: `client/public/assets/branding/aarogyalink-logo.png`

## Troubleshooting

- `MONGODB_URI is missing`:
  - Ensure `.env` exists in project root and `MONGODB_URI` is set.
- Doctor cannot login after registration:
  - Admin approval is required (`pending` doctor accounts cannot login).
- Appointment booking returns 500:
  - Check backend logs and confirm MongoDB is running and reachable.

## License

This project is currently intended for academic and demonstration use.  
Add a formal license file before production distribution.
