const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      required: true,
      default: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 500,
    },
    clinicName: {
      type: String,
      default: 'City Health Clinic',
      trim: true,
    },
    location: {
      address: { type: String, default: 'Main Health Boulevard' },
      city: { type: String, default: 'New Delhi', index: true },
      coordinates: {
        lat: { type: Number, default: 28.6139 },
        lng: { type: Number, default: 77.209 },
      },
    },
    bio: {
      type: String,
      default: 'Dedicated healthcare professional committed to providing compassionate and patient-centered medical care.',
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isAvailableToday: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 12,
    },
    availableDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    timeSlots: [
      {
        type: String, // e.g. "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
      },
    ],
    slotDuration: {
      type: Number,
      default: 30, // in minutes
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compatibility getters/setters for legacy fields
doctorProfileSchema.virtual('specialty').get(function () {
  return this.specialization;
}).set(function (v) {
  this.specialization = v;
});

doctorProfileSchema.virtual('fee').get(function () {
  return this.consultationFee;
}).set(function (v) {
  this.consultationFee = v;
});

doctorProfileSchema.virtual('hospital').get(function () {
  return this.clinicName;
}).set(function (v) {
  this.clinicName = v;
});

doctorProfileSchema.virtual('avatar').get(function () {
  return this.profileImage;
}).set(function (v) {
  this.profileImage = v;
});

// Full-text search index
doctorProfileSchema.index({
  name: 'text',
  specialization: 'text',
  'location.city': 'text',
  clinicName: 'text',
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
