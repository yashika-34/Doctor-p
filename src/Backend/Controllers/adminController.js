const User = require('../Models/User');
const DoctorProfile = require('../Models/DoctorProfile');
const Appointment = require('../Models/Appointment');

// @desc    Get Admin dashboard overview statistics
// @route   GET /api/admin/dashboard
// @access  Protected (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalDoctors = await DoctorProfile.countDocuments();
    const approvedDoctors = await DoctorProfile.countDocuments({ approvalStatus: 'approved' });
    const pendingDoctors = await DoctorProfile.countDocuments({ approvalStatus: 'pending' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    // Revenue calculation
    const revenueAggregate = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$fee' } } },
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('doctorId', 'name specialization clinicName')
      .populate('patientId', 'name email phone');

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalRevenue,
      },
      recentAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors for admin with approval filter
// @route   GET /api/admin/doctors
// @access  Protected (Admin)
const getDoctors = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.approvalStatus = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await DoctorProfile.countDocuments(query);
    const doctors = await DoctorProfile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'email phone status createdAt');

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject doctor registration
// @route   PATCH /api/admin/doctors/:id/approval
// @access  Protected (Admin)
const updateDoctorApproval = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be approved, rejected, or pending.',
      });
    }

    const doctor = await DoctorProfile.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.approvalStatus = status;
    doctor.isVerified = status === 'approved';
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${status}`,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients for admin
// @route   GET /api/admin/patients
// @access  Protected (Admin)
const getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/admin/appointments
// @access  Protected (Admin)
const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialization clinicName')
      .populate('patientId', 'name email phone');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getDoctors,
  updateDoctorApproval,
  getPatients,
  getAppointments,
};
