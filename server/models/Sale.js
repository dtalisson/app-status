const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String, required: true },
    userName: { type: String, default: '' },
    value: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);


