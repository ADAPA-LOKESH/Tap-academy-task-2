import express from 'express';
import {
  getEmployeeDashboard,
  getManagerDashboard
} from '../controllers/dashboardController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/employee', protect, getEmployeeDashboard);
router.get('/manager', protect, manager, getManagerDashboard);

export default router;
