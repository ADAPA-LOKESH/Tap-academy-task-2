import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Helper function to get start of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private
export const getEmployeeDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = getStartOfDay(now);
    
    // Get today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    // Get this month's data
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthlyAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Get last 7 days attendance
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    // Calculate monthly stats
    const monthlyStats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0
    };

    // Calculate working days this month (excluding weekends)
    let workingDays = 0;
    const current = new Date(startOfMonth);
    while (current <= now && current <= endOfMonth) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    monthlyAttendance.forEach(record => {
      monthlyStats.totalHours += record.totalHours || 0;
      switch (record.status) {
        case 'present':
          monthlyStats.present++;
          break;
        case 'late':
          monthlyStats.late++;
          break;
        case 'half-day':
          monthlyStats.halfDay++;
          break;
      }
    });

    // Calculate absent days
    const attendedDays = monthlyStats.present + monthlyStats.late + monthlyStats.halfDay;
    monthlyStats.absent = Math.max(0, workingDays - attendedDays);

    res.json({
      today: {
        status: todayAttendance ? todayAttendance.status : 'not-checked-in',
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        totalHours: todayAttendance?.totalHours || 0
      },
      monthlyStats,
      recentAttendance,
      user: {
        name: req.user.name,
        employeeId: req.user.employeeId,
        department: req.user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private/Manager
export const getManagerDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = getStartOfDay(now);
    
    // Get total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    // Get today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department');

    const todayStats = {
      present: 0,
      late: 0,
      absent: totalEmployees,
      halfDay: 0
    };

    const lateArrivals = [];
    const absentEmployees = [];
    const presentEmployeeIds = new Set();

    todayAttendance.forEach(record => {
      if (record.userId) {
        presentEmployeeIds.add(record.userId._id.toString());
        switch (record.status) {
          case 'present':
            todayStats.present++;
            todayStats.absent--;
            break;
          case 'late':
            todayStats.late++;
            todayStats.absent--;
            lateArrivals.push({
              name: record.userId.name,
              employeeId: record.userId.employeeId,
              department: record.userId.department,
              checkInTime: record.checkInTime
            });
            break;
          case 'half-day':
            todayStats.halfDay++;
            todayStats.absent--;
            break;
        }
      }
    });

    // Get absent employees
    const allEmployees = await User.find({ role: 'employee' }).select('name employeeId department');
    allEmployees.forEach(emp => {
      if (!presentEmployeeIds.has(emp._id.toString())) {
        absentEmployees.push({
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department
        });
      }
    });

    // Get weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo, $lte: today }
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttendance = weeklyAttendance.filter(
        a => a.date.toISOString().split('T')[0] === dateStr
      );
      
      weeklyTrend.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        present: dayAttendance.filter(a => a.status === 'present').length,
        late: dayAttendance.filter(a => a.status === 'late').length,
        absent: totalEmployees - dayAttendance.length
      });
    }

    // Get department-wise attendance for this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyAttendance = await Attendance.find({
      date: { $gte: startOfMonth, $lte: now }
    }).populate('userId', 'department');

    const departmentStats = {};
    const departments = [...new Set(allEmployees.map(e => e.department))];
    
    departments.forEach(dept => {
      const deptEmployees = allEmployees.filter(e => e.department === dept);
      const deptAttendance = monthlyAttendance.filter(
        a => a.userId && a.userId.department === dept
      );
      
      departmentStats[dept] = {
        employees: deptEmployees.length,
        present: deptAttendance.filter(a => a.status === 'present').length,
        late: deptAttendance.filter(a => a.status === 'late').length,
        halfDay: deptAttendance.filter(a => a.status === 'half-day').length
      };
    });

    res.json({
      totalEmployees,
      todayStats,
      lateArrivals,
      absentEmployees,
      weeklyTrend,
      departmentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
