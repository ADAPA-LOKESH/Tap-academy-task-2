import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getMySummary,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  getTodayTeamStatus,
  exportAttendance
} from '../controllers/attendanceController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyHistory);
router.get('/my-summary', protect, getMySummary);

// Manager routes
router.get('/all', protect, manager, getAllAttendance);
router.get('/employee/:id', protect, manager, getEmployeeAttendance);
router.get('/summary', protect, manager, getTeamSummary);
router.get('/today-status', protect, manager, getTodayTeamStatus);
router.get('/export', protect, manager, exportAttendance);

export default router;
