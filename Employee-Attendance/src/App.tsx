import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MarkAttendance } from './pages/MarkAttendance';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { Profile } from './pages/Profile';
import { ManagerDashboardPage } from './pages/ManagerDashboard';
import { AllEmployeesAttendance } from './pages/AllEmployeesAttendance';
import { TeamCalendar } from './pages/TeamCalendar';
import { Reports } from './pages/Reports';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Employee routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<MarkAttendance />} />
            <Route path="/history" element={<AttendanceHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Manager routes */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route element={<Layout />}>
            <Route path="/manager" element={<ManagerDashboardPage />} />
            <Route path="/manager/employees" element={<AllEmployeesAttendance />} />
            <Route path="/manager/calendar" element={<TeamCalendar />} />
            <Route path="/manager/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Redirect root */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
