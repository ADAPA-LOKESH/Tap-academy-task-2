import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Clock, CheckCircle, XCircle, AlertTriangle, Timer } from 'lucide-react';

export function MarkAttendance() {
  const [todayStatus, setTodayStatus] = useState<{
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    totalHours: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTodayStatus();
  }, []);

  const loadTodayStatus = async () => {
    try {
      const data = await attendanceService.getTodayStatus();
      setTodayStatus(data);
    } catch (err) {
      console.error(err);
      setTodayStatus({ status: 'not-checked-in', checkInTime: null, checkOutTime: null, totalHours: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      await attendanceService.checkIn();
      setSuccess('Successfully checked in!');
      await loadTodayStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to check in');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      await attendanceService.checkOut();
      setSuccess('Successfully checked out!');
      await loadTodayStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to check out');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-64" size={40} />;
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusDisplay = () => {
    switch (todayStatus?.status) {
      case 'present':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30', label: 'Present' };
      case 'late':
        return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30', label: 'Late' };
      case 'half-day':
        return { icon: Timer, color: 'text-orange-400', bg: 'bg-orange-900/30', label: 'Half Day' };
      default:
        return { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-800', label: 'Not Checked In' };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const isCheckedIn = todayStatus?.checkInTime !== null;
  const isCheckedOut = todayStatus?.checkOutTime !== null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
        <p className="text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Current Status Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
        <div className="p-8 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusDisplay.bg} mb-4`}>
            <StatusIcon className={statusDisplay.color} size={40} />
          </div>
          <h2 className={`text-2xl font-bold ${statusDisplay.color} mb-2`}>
            {statusDisplay.label}
          </h2>
          <p className="text-gray-400">Today's attendance status</p>
        </div>

        <div className="border-t border-gray-800 grid grid-cols-3 divide-x divide-gray-800">
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Check In Time</p>
            <p className="text-xl font-semibold text-white">{formatTime(todayStatus?.checkInTime || null)}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Check Out Time</p>
            <p className="text-xl font-semibold text-white">{formatTime(todayStatus?.checkOutTime || null)}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Total Hours</p>
            <p className="text-xl font-semibold text-white">{(todayStatus?.totalHours || 0).toFixed(2)}h</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn || isProcessing}
          className="flex flex-col items-center justify-center p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800"
        >
          <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
            <Clock className="text-green-400" size={32} />
          </div>
          <span className="text-xl font-semibold text-white mb-1">Check In</span>
          <span className="text-sm text-gray-400">
            {isCheckedIn ? 'Already checked in' : 'Mark your arrival'}
          </span>
        </button>

        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || isCheckedOut || isProcessing}
          className="flex flex-col items-center justify-center p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800"
        >
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <Clock className="text-red-400" size={32} />
          </div>
          <span className="text-xl font-semibold text-white mb-1">Check Out</span>
          <span className="text-sm text-gray-400">
            {isCheckedOut ? 'Already checked out' : !isCheckedIn ? 'Check in first' : 'Mark your departure'}
          </span>
        </button>
      </div>

      {/* Note */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-400">
          <strong>Note:</strong> Check-in after 9:30 AM will be marked as late. Working less than 4 hours will be marked as half-day.
        </p>
      </div>
    </div>
  );
}
