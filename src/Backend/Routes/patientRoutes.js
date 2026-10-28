const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getPatientStats,
} = require('../Controllers/patientController');
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

router.use(protect);

router.get('/profile', getPatientProfile);
router.patch('/profile', updatePatientProfile);
router.get('/stats', getPatientStats);

module.exports = router;
