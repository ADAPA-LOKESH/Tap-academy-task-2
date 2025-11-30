import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Attendance, User } from '../types';
import { Users, Search, Filter, ChevronDown } from 'lucide-react';

export function AllEmployeesAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    employeeId: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getAllAttendance({
        date: filters.date,
        status: filters.status || undefined,
        employeeId: filters.employeeId || undefined,
      });
      setAttendance(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'bg-green-900/30 text-green-400',
      late: 'bg-yellow-900/30 text-yellow-400',
      'half-day': 'bg-orange-900/30 text-orange-400',
      absent: 'bg-red-900/30 text-red-400',
    };
    return styles[status] || 'bg-gray-900/30 text-gray-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">All Employees Attendance</h1>
          <p className="text-gray-400 mt-1">View and filter attendance records</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          <Filter size={20} />
          Filters
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={filters.employeeId}
                  onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                  placeholder="e.g., EMP001"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Users className="text-blue-400" size={24} />
            <h2 className="text-lg font-semibold text-white">
              Attendance Records - {new Date(filters.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Check In</th>
                  <th className="p-4 font-medium">Check Out</th>
                  <th className="p-4 font-medium">Hours</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No attendance records found for the selected filters
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => {
                    const user = record.userId as User;
                    return (
                      <tr key={record._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{user?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{user?.employeeId || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{user?.department || 'N/A'}</td>
                        <td className="p-4 text-white">{formatTime(record.checkInTime)}</td>
                        <td className="p-4 text-white">{formatTime(record.checkOutTime)}</td>
                        <td className="p-4 text-white">{record.totalHours.toFixed(1)}h</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
