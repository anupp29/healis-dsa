const mongoose = require('mongoose');

const MentalHealthSchema = new mongoose.Schema({
  patient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  therapist: {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    }
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time in HH:MM format']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentalHealth', MentalHealthSchema);