const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateProfile,
  getAvailability,
  updateAvailability,
  lockSlot,
  getMapDoctors,
} = require('../Controllers/doctorController');
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// Public doctor discovery routes
router.get('/', getDoctors);
router.get('/map', getMapDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getAvailability);

// Doctor profile management
router.post('/profile', protect, authorize('doctor'), updateProfile);
router.patch('/profile', protect, authorize('doctor'), updateProfile);

// Availability management
router.put('/availability', protect, authorize('doctor'), updateAvailability);

// Slot locking
router.post('/slots/lock', protect, lockSlot);

module.exports = router;
