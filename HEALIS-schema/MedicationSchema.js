const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  patient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  times: [{
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time in HH:MM format']
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  instructions: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    required: true,
    enum: ['bg-rose-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500']
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', MedicationSchema);