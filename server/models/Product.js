const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' }, // Descrição curta (lista de produtos)
    subDescription: { type: String, default: '' }, // Descrição detalhada (página de detalhes)
    imageUrl: { type: String, default: '' },
    tutorial: { type: String, default: '' }, // Link do tutorial
    tutorialText: { type: String, default: '' }, // Texto escrito do tutorial
    download: { type: String, default: '' }, // Link de download
    active: { type: Boolean, default: true },
    plans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);


