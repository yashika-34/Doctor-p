const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDoctors,
  updateDoctorApproval,
  getPatients,
  getAppointments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/doctors', getDoctors);
router.patch('/doctors/:id/approval', updateDoctorApproval);
router.get('/patients', getPatients);
router.get('/appointments', getAppointments);

module.exports = router;
