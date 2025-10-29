const mongoose = require('mongoose');

// Medicine Schema with DSA-optimized structure
const medicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    index: true // For fast searching
  },
  genericName: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Antibiotic', 'Painkiller', 'Vitamin', 'Cardiac', 'Diabetes', 'Respiratory', 'Neurological', 'Other']
  },
  dosage: {
    strength: {
      type: String,
      required: true
    },
    form: {
      type: String,
      required: true,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops']
    }
  },
  inventory: {
    currentStock: {
      type: Number,
      required: true,
      min: 0
    },
    minThreshold: {
      type: Number,
      required: true,
      min: 0
    },
    maxCapacity: {
      type: Number,
      required: true
    },
    reorderLevel: {
      type: Number,
      required: true
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  expiryInfo: {
    manufacturingDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    shelfLife: {
      type: Number, // in months
      required: true
    }
  },
  supplier: {
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  sideEffects: [{
    type: String
  }],
  contraindications: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Discontinued', 'Out of Stock', 'Expired'],
    default: 'Active'
  },
  priority: {
    type: Number,
    default: 1, // For priority queue operations
    min: 1,
    max: 5 // 1 = highest priority (critical medicines)
  }
}, {
  timestamps: true
});

// Generate medicine ID
async function generateMedicineId() {
  const count = await Medicine.countDocuments();
  return `MED${String(count + 1).padStart(6, '0')}`;
}

// Pre-save middleware
medicineSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.medicineId = await generateMedicineId();
  }
  
  // Auto-update status based on stock and expiry
  if (this.inventory.currentStock === 0) {
    this.status = 'Out of Stock';
  } else if (this.expiryDate < new Date()) {
    this.status = 'Expired';
  } else if (this.status === 'Out of Stock' && this.inventory.currentStock > 0) {
    this.status = 'Active';
  }
  
  next();
});

// Indexes for optimized queries
medicineSchema.index({ name: 'text', genericName: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ 'inventory.currentStock': 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ priority: 1 });

// Instance methods
medicineSchema.methods.isLowStock = function() {
  return this.inventory.currentStock <= this.inventory.minThreshold;
};

medicineSchema.methods.isExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.expiryInfo.expiryDate <= futureDate;
};

medicineSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.inventory.currentStock += quantity;
  } else if (operation === 'subtract') {
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock - quantity);
  }
  return this.save();
};

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
