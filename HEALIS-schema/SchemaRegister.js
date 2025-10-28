const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RegisterSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Prefer Not to Say']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password hashing middleware
RegisterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
RegisterSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.model('User', RegisterSchema);

// Generate patient ID function
async function generatePatientId() {
  const prefix = 'PT';
  const currentYear = new Date().getFullYear().toString().slice(-2);
  
  try {
    // Find the highest existing patient ID for the current year
    const latestPatient = await User.findOne({
      patientId: new RegExp(`^${prefix}${currentYear}`)
    }, { patientId: 1 })
      .sort({ patientId: -1 });
    
    let sequenceNumber;
    if (latestPatient) {
      // Extract the sequence number and increment
      const currentSequence = parseInt(latestPatient.patientId.slice(-4));
      sequenceNumber = (currentSequence + 1).toString().padStart(4, '0');
    } else {
      // Start with 0001 if no existing patients
      sequenceNumber = '0001';
    }
    
    return `${prefix}${currentYear}${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating patient ID:', error);
    throw error;
  }
}

module.exports = {
  User,
  generatePatientId
};