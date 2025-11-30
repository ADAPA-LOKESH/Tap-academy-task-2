import { useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { TeamSummary } from '../types';
import { FileText, Download, Calendar, Users } from 'lucide-react';

export function Reports() {
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: 'all',
  });

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const month = new Date(filters.startDate).getMonth() + 1;
      const year = new Date(filters.startDate).getFullYear();
      const data = await attendanceService.getTeamSummary(month, year);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await attendanceService.exportAttendance({
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: filters.employeeId !== 'all' ? filters.employeeId : undefined,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${filters.startDate}-to-${filters.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = () => {
    loadSummary();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Generate and export attendance reports</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Report Parameters</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Employee</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={filters.employeeId}
                onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">All Employees</option>
                {summary?.employeeStats.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              {isLoading ? 'Loading...' : 'Generate'}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <LoadingSpinner className="py-16" size={40} />
      ) : summary ? (
        <div className="space-y-8">
          {/* Department Summary */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Department Summary</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-800">
                      <th className="pb-4 font-medium">Department</th>
                      <th className="pb-4 font-medium text-center">Employees</th>
                      <th className="pb-4 font-medium text-center">Present</th>
                      <th className="pb-4 font-medium text-center">Late</th>
                      <th className="pb-4 font-medium text-center">Half Day</th>
                      <th className="pb-4 font-medium text-center">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.departmentStats).map(([dept, stats]) => (
                      <tr key={dept} className="border-b border-gray-800/50">
                        <td className="py-4 text-white font-medium">{dept}</td>
                        <td className="py-4 text-center text-gray-300">{stats.employeeCount}</td>
                        <td className="py-4 text-center text-green-400">{stats.present}</td>
                        <td className="py-4 text-center text-yellow-400">{stats.late}</td>
                        <td className="py-4 text-center text-orange-400">{stats.halfDay}</td>
                        <td className="py-4 text-center text-blue-400">{stats.totalHours.toFixed(1)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Employee Summary */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Employee Summary</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-800">
                      <th className="pb-4 font-medium">Employee</th>
                      <th className="pb-4 font-medium">Department</th>
                      <th className="pb-4 font-medium text-center">Present</th>
                      <th className="pb-4 font-medium text-center">Absent</th>
                      <th className="pb-4 font-medium text-center">Late</th>
                      <th className="pb-4 font-medium text-center">Half Day</th>
                      <th className="pb-4 font-medium text-center">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.employeeStats.map((emp) => (
                      <tr key={emp.employeeId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-4">
                          <div>
                            <p className="text-white font-medium">{emp.name}</p>
                            <p className="text-sm text-gray-400">{emp.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">{emp.department}</td>
                        <td className="py-4 text-center">
                          <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">
                            {emp.present}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm">
                            {emp.absent}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-sm">
                            {emp.late}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-sm">
                            {emp.halfDay}
                          </span>
                        </td>
                        <td className="py-4 text-center text-blue-400 font-medium">
                          {emp.totalHours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center">
          <FileText className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">Click "Generate" to create a report for the selected date range</p>
        </div>
      )}
    </div>
  );
}
