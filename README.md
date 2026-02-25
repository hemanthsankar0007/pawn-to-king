# Pawn to King — Chess Academy Portal

A full-stack web application for managing a chess academy. Students can view their curriculum, timetable, homework, and class recordings. Admins can manage batches, sessions, students, applications, and curriculum content.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |

---

## Project Structure

```
pawn-to-king/
├── pawn-to-king-backend/    # Express REST API
└── pawn-to-king-frontend/   # React + Vite SPA
```

---

## Features

### Student Portal
- **Dashboard** — welcome card, current topic, next session countdown, quick actions
- **Curriculum** — level-by-level curriculum browser with topic accordions
- **Timetable** — upcoming & past sessions with full topic titles, one-click Join button
- **Homework** — submit answers, view feedback
- **Classroom** — access session recordings and resources
- **Bonus** — extra learning material

### Admin Portal
- **Dashboard** — live stats (total students, pending applications, upcoming sessions)
- **Admin Panel** — review and approve/reject student applications
- **Batch Management** — create batches, assign students, view/remove per-batch students, delete batches
- **Admin Timetable** — weekly grid view across all batches + per-batch session control (generate, reschedule, complete, cancel)
- **Curriculum Manager** — publish/manage curriculum topics per level
- **Config** — app-level configuration

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB)

---

### Backend Setup

```bash
cd pawn-to-king-backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

**Backend `.env` variables:**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

> ⚠️ Never commit your real `.env` file. It is git-ignored.

**Seed the database** (optional — loads curriculum blueprint):

```bash
npm run seed
```

---

### Frontend Setup

```bash
cd pawn-to-king-frontend
npm install
cp .env.example .env
# .env already has the correct local value
npm run dev
```

**Frontend `.env` variables:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The app runs at `http://localhost:5173` by default.

---

## API Overview

| Prefix | Description |
|--------|-------------|
| `POST /api/auth/login` | Login and receive JWT |
| `GET /api/dashboard` | Student dashboard data |
| `GET /api/curriculum` | Curriculum levels |
| `GET /api/timetable` | Student timetable with topic titles |
| `GET /api/homework` | Current homework |
| `GET /api/classroom` | Session recordings |
| `GET /api/bonus` | Bonus materials |
| `GET /api/admin/timetable/weekly` | Admin weekly grid |
| `POST /api/admin/timetable/batches` | Create batch |
| `DELETE /api/admin/timetable/batches/:id` | Delete batch |
| `GET /api/admin` | Admin dashboard stats |
| `GET /api/health` | Health check |

All protected routes require `Authorization: Bearer <token>` header.

---

## Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Real secrets for local dev | ❌ Never |
| `.env.example` | Template with placeholder values | ✅ Yes |
| `.env.production` | Production API URL | ❌ Never |

---

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start production server
npm run seed     # Seed curriculum data
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## License

Private — Pawn to King Chess Academy. All rights reserved.
