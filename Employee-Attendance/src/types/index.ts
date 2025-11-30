export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  employeeId: string;
  department: string;
  token?: string;
}

export interface Attendance {
  _id: string;
  userId: string | User;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'not-checked-in';
  totalHours: number;
  createdAt: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  totalHours: number;
  workingDays: number;
}

export interface TodayStatus {
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number;
}

export interface EmployeeDashboard {
  today: TodayStatus;
  monthlyStats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    totalHours: number;
  };
  recentAttendance: Attendance[];
  user: {
    name: string;
    employeeId: string;
    department: string;
  };
}

export interface ManagerDashboard {
  totalEmployees: number;
  todayStats: {
    present: number;
    late: number;
    absent: number;
    halfDay: number;
  };
  lateArrivals: Array<{
    name: string;
    employeeId: string;
    department: string;
    checkInTime: string;
  }>;
  absentEmployees: Array<{
    name: string;
    employeeId: string;
    department: string;
  }>;
  weeklyTrend: Array<{
    date: string;
    day: string;
    present: number;
    late: number;
    absent: number;
  }>;
  departmentStats: Record<string, {
    employees: number;
    present: number;
    late: number;
    halfDay: number;
  }>;
}

export interface TeamStatus {
  date: string;
  summary: {
    total: number;
    present: number;
    late: number;
    notCheckedIn: number;
  };
  details: {
    present: EmployeeInfo[];
    late: EmployeeInfo[];
    notCheckedIn: EmployeeInfo[];
  };
}

export interface EmployeeInfo {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface TeamSummary {
  month: number;
  year: number;
  employeeStats: Array<{
    employeeId: string;
    name: string;
    department: string;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    totalHours: number;
  }>;
  departmentStats: Record<string, {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    totalHours: number;
    employeeCount: number;
  }>;
}
