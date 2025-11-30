import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { EmployeeDashboard } from '../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export function Dashboard() {
  const [dashboard, setDashboard] = useState<EmployeeDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getEmployeeDashboard();
      setDashboard(data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await attendanceService.checkIn();
      await loadDashboard();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingIn(true);
    try {
      await attendanceService.checkOut();
      await loadDashboard();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to check out');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-64" size={40} />;
  }

  if (!dashboard) {
    return (
      <div className="text-center text-red-400 py-8">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-400';
      case 'late':
        return 'text-yellow-400';
      case 'half-day':
        return 'text-orange-400';
      case 'absent':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-400" size={24} />;
      case 'late':
        return <AlertTriangle className="text-yellow-400" size={24} />;
      case 'half-day':
        return <Timer className="text-orange-400" size={24} />;
      default:
        return <XCircle className="text-gray-400" size={24} />;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCheckedIn = dashboard.today.checkInTime !== null;
  const isCheckedOut = dashboard.today.checkOutTime !== null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome, {dashboard.user.name}!
        </h1>
        <p className="text-gray-400 mt-1">
          {dashboard.user.employeeId} • {dashboard.user.department}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          {error}
          <button onClick={() => setError('')} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Check In/Out */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(dashboard.today.status)}
            <div>
              <p className="text-sm text-gray-400">Today's Status</p>
              <p className={`text-xl font-semibold capitalize ${getStatusColor(dashboard.today.status)}`}>
                {dashboard.today.status.replace('-', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">Check In</p>
              <p className="text-lg font-semibold text-white">
                {formatTime(dashboard.today.checkInTime)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Check Out</p>
              <p className="text-lg font-semibold text-white">
                {formatTime(dashboard.today.checkOutTime)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Hours</p>
              <p className="text-lg font-semibold text-white">
                {dashboard.today.totalHours.toFixed(1)}h
              </p>
            </div>

            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Clock size={20} />
                {isCheckingIn ? 'Processing...' : 'Check In'}
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={isCheckingIn}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Clock size={20} />
                {isCheckingIn ? 'Processing...' : 'Check Out'}
              </button>
            ) : (
              <div className="px-6 py-3 bg-gray-800 text-gray-400 font-semibold rounded-lg">
                Day Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-gray-400">Present Days</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.monthlyStats.present}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-400" size={24} />
            <span className="text-gray-400">Absent Days</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.monthlyStats.absent}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-yellow-400" size={24} />
            <span className="text-gray-400">Late Days</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.monthlyStats.late}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400" size={24} />
            <span className="text-gray-400">Total Hours</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dashboard.monthlyStats.totalHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Recent Attendance (Last 7 Days)</h2>
          </div>
        </div>
        <div className="p-6">
          {dashboard.recentAttendance.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No attendance records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Check In</th>
                    <th className="pb-4 font-medium">Check Out</th>
                    <th className="pb-4 font-medium">Hours</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentAttendance.map((record) => (
                    <tr key={record._id} className="border-b border-gray-800/50">
                      <td className="py-4 text-white">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 text-white">{formatTime(record.checkInTime)}</td>
                      <td className="py-4 text-white">{formatTime(record.checkOutTime)}</td>
                      <td className="py-4 text-white">{record.totalHours.toFixed(1)}h</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            record.status === 'present'
                              ? 'bg-green-900/30 text-green-400'
                              : record.status === 'late'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : record.status === 'half-day'
                              ? 'bg-orange-900/30 text-orange-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
