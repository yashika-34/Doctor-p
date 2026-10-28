const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const patientRoutes = require('./patientRoutes');
const adminRoutes = require('./adminRoutes');
const symptomRoutes = require('./symptomRoutes');
const reviewRoutes = require('./reviewRoutes');

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/admin', adminRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
