const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      index: true,
    },
    startTime: {
      type: String, // Format: HH:mm (e.g., "10:00")
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Format: HH:mm (e.g., "10:30")
      default: function () {
        if (!this.startTime) return '10:30';
        const [h, m] = this.startTime.split(':').map(Number);
        const endTotal = h * 60 + m + 30;
        const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
        const endM = String(endTotal % 60).padStart(2, '0');
        return `${endH}:${endM}`;
      },
    },
    reason: {
      type: String,
      default: 'General Consultation',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    fee: {
      type: Number,
      required: true,
      default: 500,
    },
    notes: {
      type: String,
      default: '',
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compatibility virtuals for legacy field names
appointmentSchema.virtual('date').get(function () {
  return this.appointmentDate;
}).set(function (v) {
  this.appointmentDate = v;
});

appointmentSchema.virtual('time').get(function () {
  return this.startTime;
}).set(function (v) {
  this.startTime = v;
});

// Auto-generate appointmentId before saving if not present
appointmentSchema.pre('save', function (next) {
  if (!this.appointmentId) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.appointmentId = `APT-${today}-${rand}`;
  }
  next();
});

// Index to prevent double booking active appointments for same doctor, date & start time
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1, status: 1 }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
