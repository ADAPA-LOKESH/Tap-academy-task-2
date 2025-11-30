import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Attendance, MonthlySummary } from '../types';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Timer } from 'lucide-react';

export function AttendanceHistory() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyData, summaryData] = await Promise.all([
        attendanceService.getMyHistory(currentMonth, currentYear),
        attendanceService.getMySummary(currentMonth, currentYear),
      ]);
      setAttendance(historyData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getMonthName = () => {
    return new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth - 1, 1).getDay();
  };

  const getAttendanceForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find((a) => a.date.startsWith(dateStr));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'late':
        return 'bg-yellow-500';
      case 'half-day':
        return 'bg-orange-500';
      case 'absent':
        return 'bg-red-500';
      default:
        return 'bg-gray-600';
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner className="h-64" size={40} />;
  }

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance History</h1>
          <p className="text-gray-400 mt-1">View your past attendance records</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-green-400" size={18} />
              <span className="text-sm text-gray-400">Present</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.present}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="text-red-400" size={18} />
              <span className="text-sm text-gray-400">Absent</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.absent}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="text-yellow-400" size={18} />
              <span className="text-sm text-gray-400">Late</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.late}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="text-orange-400" size={18} />
              <span className="text-sm text-gray-400">Half Day</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.halfDay}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-blue-400" size={18} />
              <span className="text-sm text-gray-400">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.totalHours.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="text-gray-400" size={24} />
        </button>
        <h2 className="text-xl font-semibold text-white">{getMonthName()}</h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronRight className="text-gray-400" size={24} />
        </button>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const record = getAttendanceForDate(day);
              const date = new Date(currentYear, currentMonth - 1, day);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`relative p-3 rounded-lg border ${
                    isToday
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-800 bg-gray-800/50'
                  } ${isWeekend ? 'opacity-50' : ''}`}
                >
                  <span className={`text-sm ${isToday ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  {record && (
                    <div
                      className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${getStatusColor(
                        record.status
                      )}`}
                      title={record.status}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-400">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-400">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-400">Absent</span>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Check In</th>
                  <th className="p-4 font-medium">Check Out</th>
                  <th className="p-4 font-medium">Hours</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No attendance records for this month
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-4 text-white">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-white">{formatTime(record.checkInTime)}</td>
                      <td className="p-4 text-white">{formatTime(record.checkOutTime)}</td>
                      <td className="p-4 text-white">{record.totalHours.toFixed(1)}h</td>
                      <td className="p-4">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
