import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { ManagerDashboard } from '../types';
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
} from 'lucide-react';

export function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getManagerDashboard();
      setDashboard(data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const maxTrendValue = Math.max(
    ...dashboard.weeklyTrend.map((d) => d.present + d.late + d.absent)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of team attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400" size={24} />
            <span className="text-gray-400">Total Employees</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.totalEmployees}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-gray-400">Present Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.todayStats.present}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-yellow-400" size={24} />
            <span className="text-gray-400">Late Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.todayStats.late}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-400" size={24} />
            <span className="text-gray-400">Absent Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.todayStats.absent}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend Chart */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-400" size={24} />
            <h2 className="text-lg font-semibold text-white">Weekly Attendance Trend</h2>
          </div>
          <div className="flex items-end justify-between gap-4 h-48">
            {dashboard.weeklyTrend.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1 mb-2" style={{ height: '180px' }}>
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{
                      height: `${(day.present / maxTrendValue) * 100}%`,
                    }}
                  />
                  <div
                    className="w-full bg-yellow-500"
                    style={{
                      height: `${(day.late / maxTrendValue) * 100}%`,
                    }}
                  />
                  <div
                    className="w-full bg-red-500 rounded-b"
                    style={{
                      height: `${(day.absent / maxTrendValue) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-sm text-gray-400">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm text-gray-400">Absent</span>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="text-blue-400" size={24} />
            <h2 className="text-lg font-semibold text-white">Department Attendance (This Month)</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(dashboard.departmentStats).map(([dept, stats]) => {
              const total = stats.present + stats.late + stats.halfDay;
              const percentage = stats.employees > 0 ? Math.round((total / (stats.employees * 22)) * 100) : 0;
              return (
                <div key={dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white">{dept}</span>
                    <span className="text-gray-400 text-sm">{stats.employees} employees</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Late Arrivals */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" size={24} />
              <h2 className="text-lg font-semibold text-white">Late Arrivals Today</h2>
            </div>
          </div>
          <div className="p-6">
            {dashboard.lateArrivals.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No late arrivals today</p>
            ) : (
              <div className="space-y-4">
                {dashboard.lateArrivals.map((emp) => (
                  <div key={emp.employeeId} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{emp.name}</p>
                      <p className="text-sm text-gray-400">
                        {emp.employeeId} • {emp.department}
                      </p>
                    </div>
                    <span className="text-yellow-400">
                      {new Date(emp.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Absent Employees */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-400" size={24} />
              <h2 className="text-lg font-semibold text-white">Absent Today</h2>
            </div>
          </div>
          <div className="p-6">
            {dashboard.absentEmployees.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Everyone is present today!</p>
            ) : (
              <div className="space-y-4">
                {dashboard.absentEmployees.map((emp) => (
                  <div key={emp.employeeId} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{emp.name}</p>
                      <p className="text-sm text-gray-400">
                        {emp.employeeId} • {emp.department}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm">
                      Not Checked In
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
