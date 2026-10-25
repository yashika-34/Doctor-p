const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getPatientStats,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/profile', getPatientProfile);
router.patch('/profile', updatePatientProfile);
router.get('/stats', getPatientStats);

module.exports = router;
