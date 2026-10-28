const User = require('../Models/User');
const Appointment = require('../Models/Appointment');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Protected (Patient)
const getPatientProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PATCH /api/patients/profile
// @access  Protected (Patient)
const updatePatientProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, age, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender) user.gender = gender;
    if (age) user.age = Number(age);
    if (avatar) user.avatar = avatar;

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient dashboard stats
// @route   GET /api/patients/stats
// @access  Protected (Patient)
const getPatientStats = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const total = await Appointment.countDocuments({ patientId });
    const upcoming = await Appointment.countDocuments({
      patientId,
      status: { $in: ['pending', 'confirmed'] },
    });
    const completed = await Appointment.countDocuments({ patientId, status: 'completed' });
    const cancelled = await Appointment.countDocuments({ patientId, status: 'cancelled' });

    res.status(200).json({
      success: true,
      stats: { total, upcoming, completed, cancelled },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientStats,
};
