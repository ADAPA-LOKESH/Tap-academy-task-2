# Employee Attendance System

A full-stack attendance tracking system with employee and manager roles, built with React, Node.js, Express, and MongoDB.

## Features

### Employee Features
- ✅ Register/Login with secure authentication
- ✅ Mark attendance (Check In / Check Out)
- ✅ View attendance history (calendar or table view)
- ✅ View monthly summary (Present/Absent/Late days)
- ✅ Dashboard with stats

### Manager Features
- ✅ Login with manager credentials
- ✅ View all employees attendance
- ✅ Filter by employee, date, status
- ✅ View team attendance summary
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats

## Tech Stack

- **Frontend**: React + TypeScript + Zustand + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server
│   └── package.json
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # Zustand store
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── .env.example            # Environment variables template
└── package.json            # Frontend dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ```

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. From the root directory, install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/attendance_system |
| JWT_SECRET | Secret key for JWT | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Demo Credentials

After running the seed script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@company.com | password123 |
| Employee | alice@company.com | password123 |
| Employee | bob@company.com | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Today's status
- `GET /api/attendance/my-history` - Attendance history
- `GET /api/attendance/my-summary` - Monthly summary

### Attendance (Manager)
- `GET /api/attendance/all` - All employees attendance
- `GET /api/attendance/employee/:id` - Specific employee
- `GET /api/attendance/summary` - Team summary
- `GET /api/attendance/today-status` - Today's team status
- `GET /api/attendance/export` - Export CSV

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard stats
- `GET /api/dashboard/manager` - Manager dashboard stats

## Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'employee' | 'manager',
  employeeId: String (unique, e.g., EMP001),
  department: String,
  createdAt: Date
}
```

### Attendance
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: 'present' | 'absent' | 'late' | 'half-day',
  totalHours: Number,
  createdAt: Date
}
```

## Screenshots

### Login Page
- Clean login interface with demo credentials displayed

### Employee Dashboard
- Today's attendance status with check in/out buttons
- Monthly statistics (present, absent, late days)
- Recent 7-day attendance history

### Manager Dashboard
- Team overview with total employees
- Today's attendance summary
- Weekly attendance trend chart
- Department-wise attendance breakdown
- Late arrivals and absent employees list

### Attendance History
- Calendar view with color-coded attendance
- Table view with detailed records
- Monthly navigation

### Reports (Manager)
- Date range selection
- Employee filter
- Department and employee summaries
- CSV export functionality

## License

MIT
