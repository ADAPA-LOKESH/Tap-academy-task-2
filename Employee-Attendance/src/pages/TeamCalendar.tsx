import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { TeamStatus } from '../types';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

export function TeamCalendar() {
  const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateData, setSelectedDateData] = useState<typeof teamStatus | null>(null);

  useEffect(() => {
    loadTodayStatus();
  }, []);

  const loadTodayStatus = async () => {
    try {
      const data = await attendanceService.getTodayTeamStatus();
      setTeamStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDateData = async (dateStr: string) => {
    try {
      const attendance = await attendanceService.getAllAttendance({ date: dateStr });
      // Transform to TeamStatus format
      const present = attendance.filter(a => a.status === 'present');
      const late = attendance.filter(a => a.status === 'late');
      
      setSelectedDateData({
        date: dateStr,
        summary: {
          total: attendance.length,
          present: present.length,
          late: late.length,
          notCheckedIn: 0,
        },
        details: {
          present: present.map(a => {
            const user = a.userId as { _id: string; name: string; employeeId: string; department: string };
            return {
              _id: user?._id || '',
              name: user?.name || 'Unknown',
              employeeId: user?.employeeId || 'N/A',
              department: user?.department || 'N/A',
              checkInTime: a.checkInTime || undefined,
              checkOutTime: a.checkOutTime || undefined,
            };
          }),
          late: late.map(a => {
            const user = a.userId as { _id: string; name: string; employeeId: string; department: string };
            return {
              _id: user?._id || '',
              name: user?.name || 'Unknown',
              employeeId: user?.employeeId || 'N/A',
              department: user?.department || 'N/A',
              checkInTime: a.checkInTime || undefined,
              checkOutTime: a.checkOutTime || undefined,
            };
          }),
          notCheckedIn: [],
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    loadDateData(dateStr);
  };

  if (isLoading) {
    return <LoadingSpinner className="h-64" size={40} />;
  }

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const today = new Date();

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Team Calendar</h1>
        <p className="text-gray-400 mt-1">Overview of team attendance by date</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
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

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const date = new Date(currentYear, currentMonth - 1, day);
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDate === dateStr;
                const isPastOrToday = date <= today;
                const isClickable = !isWeekend && isPastOrToday;

                return (
                  <button
                    key={day}
                    onClick={() => isClickable && handleDateClick(day)}
                    disabled={!isClickable}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : isToday
                        ? 'bg-green-900/50 text-green-400 border-2 border-green-500 hover:bg-green-900/70 cursor-pointer'
                        : isWeekend
                        ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                        : isPastOrToday
                        ? 'bg-gray-800 text-white hover:bg-gray-700 hover:ring-1 hover:ring-gray-600 cursor-pointer'
                        : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    }`}
                    title={isWeekend ? 'Weekend' : !isPastOrToday ? 'Future date' : 'Click to view attendance'}
                  >
                    <span className="text-sm font-medium">{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Summary */}
          {teamStatus && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="text-green-400" size={18} />
                  <span className="text-sm text-gray-400">Present</span>
                </div>
                <p className="text-2xl font-bold text-white">{teamStatus.summary.present}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="text-yellow-400" size={18} />
                  <span className="text-sm text-gray-400">Late</span>
                </div>
                <p className="text-2xl font-bold text-white">{teamStatus.summary.late}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="text-red-400" size={18} />
                  <span className="text-sm text-gray-400">Not Checked In</span>
                </div>
                <p className="text-2xl font-bold text-white">{teamStatus.summary.notCheckedIn}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="text-blue-400" size={18} />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">{teamStatus.summary.total}</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Date Details */}
        <div className="col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 sticky top-8">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a Date'}
              </h3>
            </div>
            <div className="p-6">
              {!selectedDate ? (
                <p className="text-gray-400 text-center py-8">
                  Click on a past date to view attendance details
                </p>
              ) : !selectedDateData ? (
                <LoadingSpinner className="py-8" />
              ) : (
                <div className="space-y-6">
                  {/* Present */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="text-green-400" size={18} />
                      <span className="text-sm font-medium text-gray-300">
                        Present ({selectedDateData.details.present.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedDateData.details.present.length === 0 ? (
                        <p className="text-sm text-gray-500">No records</p>
                      ) : (
                        selectedDateData.details.present.map((emp) => (
                          <div key={emp._id} className="flex items-center justify-between text-sm">
                            <span className="text-white">{emp.name}</span>
                            <span className="text-gray-400">{formatTime(emp.checkInTime)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Late */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="text-yellow-400" size={18} />
                      <span className="text-sm font-medium text-gray-300">
                        Late ({selectedDateData.details.late.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedDateData.details.late.length === 0 ? (
                        <p className="text-sm text-gray-500">No records</p>
                      ) : (
                        selectedDateData.details.late.map((emp) => (
                          <div key={emp._id} className="flex items-center justify-between text-sm">
                            <span className="text-white">{emp.name}</span>
                            <span className="text-yellow-400">{formatTime(emp.checkInTime)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
