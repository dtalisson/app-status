const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      trim: true
    },
    percentage: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null }, // Opcional: data de expiração
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);




