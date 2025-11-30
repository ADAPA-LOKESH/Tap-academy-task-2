import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Helper function to get start of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to get end of day
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Helper to determine if check-in is late (after 9:30 AM)
const isLate = (checkInTime) => {
  const hours = checkInTime.getHours();
  const minutes = checkInTime.getMinutes();
  return hours > 9 || (hours === 9 && minutes > 30);
};

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
export const checkIn = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    const status = isLate(now) ? 'late' : 'present';

    if (attendance) {
      attendance.checkInTime = now;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkInTime: now,
        status
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private
export const checkOut = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'You have not checked in today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const now = new Date();
    attendance.checkOutTime = now;
    
    // Calculate total hours
    const diff = now.getTime() - attendance.checkInTime.getTime();
    attendance.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    
    // Check if half-day (less than 4 hours)
    if (attendance.totalHours < 4 && attendance.status !== 'late') {
      attendance.status = 'half-day';
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
export const getTodayStatus = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    res.json(attendance || { status: 'not-checked-in' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Private
export const getMyHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private
export const getMySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      month: targetMonth + 1,
      year: targetYear,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
      workingDays: 0
    };

    // Calculate working days (excluding weekends)
    const current = new Date(startDate);
    while (current <= endDate && current <= now) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        summary.workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    attendance.forEach(record => {
      summary.totalHours += record.totalHours || 0;
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
      }
    });

    // Calculate absent days (working days - attended days)
    const attendedDays = summary.present + summary.late + summary.halfDay;
    summary.absent = Math.max(0, summary.workingDays - attendedDays);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees attendance (Manager)
// @route   GET /api/attendance/all
// @access  Private/Manager
export const getAllAttendance = async (req, res) => {
  try {
    const { date, status, employeeId, startDate, endDate } = req.query;
    const query = {};

    if (date) {
      query.date = getStartOfDay(new Date(date));
    } else if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate))
      };
    }

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1, checkInTime: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific employee attendance (Manager)
// @route   GET /api/attendance/employee/:id
// @access  Private/Manager
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.params.id,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team attendance summary (Manager)
// @route   GET /api/attendance/summary
// @access  Private/Manager
export const getTeamSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const employees = await User.find({ role: 'employee' });
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    // Group by department
    const departmentStats = {};
    const employeeStats = [];

    for (const emp of employees) {
      const empAttendance = attendance.filter(
        a => a.userId && a.userId._id.toString() === emp._id.toString()
      );

      const stats = {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        totalHours: 0
      };

      empAttendance.forEach(record => {
        stats.totalHours += record.totalHours || 0;
        switch (record.status) {
          case 'present': stats.present++; break;
          case 'absent': stats.absent++; break;
          case 'late': stats.late++; break;
          case 'half-day': stats.halfDay++; break;
        }
      });

      employeeStats.push(stats);

      // Aggregate department stats
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = {
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          totalHours: 0,
          employeeCount: 0
        };
      }
      departmentStats[emp.department].present += stats.present;
      departmentStats[emp.department].late += stats.late;
      departmentStats[emp.department].halfDay += stats.halfDay;
      departmentStats[emp.department].totalHours += stats.totalHours;
      departmentStats[emp.department].employeeCount++;
    }

    res.json({
      month: targetMonth + 1,
      year: targetYear,
      employeeStats,
      departmentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's status for all employees (Manager)
// @route   GET /api/attendance/today-status
// @access  Private/Manager
export const getTodayTeamStatus = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    const employees = await User.find({ role: 'employee' }).select('-password');
    const attendance = await Attendance.find({ date: today });

    const status = {
      present: [],
      absent: [],
      late: [],
      notCheckedIn: []
    };

    for (const emp of employees) {
      const empAttendance = attendance.find(
        a => a.userId.toString() === emp._id.toString()
      );

      const empInfo = {
        _id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        checkInTime: empAttendance?.checkInTime,
        checkOutTime: empAttendance?.checkOutTime
      };

      if (!empAttendance) {
        status.notCheckedIn.push(empInfo);
      } else if (empAttendance.status === 'late') {
        status.late.push(empInfo);
      } else if (empAttendance.status === 'present' || empAttendance.status === 'half-day') {
        status.present.push(empInfo);
      }
    }

    res.json({
      date: today,
      summary: {
        total: employees.length,
        present: status.present.length,
        late: status.late.length,
        notCheckedIn: status.notCheckedIn.length
      },
      details: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance to CSV (Manager)
// @route   GET /api/attendance/export
// @access  Private/Manager
export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate))
      };
    } else {
      // Default to current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = { $gte: start, $lte: end };
    }

    if (employeeId && employeeId !== 'all') {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: 1, 'userId.employeeId': 1 });

    // Generate CSV
    const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Status', 'Total Hours'];
    const rows = attendance.map(record => [
      record.date.toISOString().split('T')[0],
      record.userId?.employeeId || 'N/A',
      record.userId?.name || 'N/A',
      record.userId?.department || 'N/A',
      record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A',
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
      record.status,
      record.totalHours.toFixed(2)
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
