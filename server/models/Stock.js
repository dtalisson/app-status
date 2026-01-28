const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stock', stockSchema);



