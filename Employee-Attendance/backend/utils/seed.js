import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

dotenv.config();

const users = [
  {
    name: 'John Manager',
    email: 'manager@company.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'MGR001',
    department: 'Management'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering'
  },
  {
    name: 'Bob Smith',
    email: 'bob@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP002',
    department: 'Engineering'
  },
  {
    name: 'Carol Williams',
    email: 'carol@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP003',
    department: 'HR'
  },
  {
    name: 'David Brown',
    email: 'david@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP004',
    department: 'Sales'
  },
  {
    name: 'Eva Martinez',
    email: 'eva@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP005',
    department: 'Engineering'
  }
];

const generateAttendanceData = (userId, days = 30) => {
  const attendance = [];
  const today = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random attendance (80% present, 10% late, 5% half-day, 5% absent)
    const random = Math.random();
    let status, checkInTime, checkOutTime, totalHours;
    
    if (random < 0.05) {
      // Absent - skip this day
      continue;
    } else if (random < 0.10) {
      // Half day
      status = 'half-day';
      checkInTime = new Date(date);
      checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0);
      checkOutTime = new Date(date);
      checkOutTime.setHours(13, Math.floor(Math.random() * 30), 0, 0);
      totalHours = 4;
    } else if (random < 0.20) {
      // Late
      status = 'late';
      checkInTime = new Date(date);
      checkInTime.setHours(10 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      checkOutTime = new Date(date);
      checkOutTime.setHours(18, Math.floor(Math.random() * 30), 0, 0);
      totalHours = Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60) * 100) / 100;
    } else {
      // Present
      status = 'present';
      checkInTime = new Date(date);
      checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
      checkOutTime = new Date(date);
      checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
      totalHours = Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60) * 100) / 100;
    }
    
    attendance.push({
      userId,
      date,
      checkInTime,
      checkOutTime,
      status,
      totalHours
    });
  }
  
  return attendance;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }
    
    // Create attendance records for employees
    for (const user of createdUsers) {
      if (user.role === 'employee') {
        const attendanceData = generateAttendanceData(user._id);
        await Attendance.insertMany(attendanceData);
        console.log(`Created ${attendanceData.length} attendance records for ${user.name}`);
      }
    }
    
    console.log('\nSeed data created successfully!');
    console.log('\nSample login credentials:');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: alice@company.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
