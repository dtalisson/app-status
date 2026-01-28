const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: false, unique: true, sparse: true },
    password: { type: String, required: false },
    discordId: { type: String, unique: true, sparse: true },
    discordUsername: { type: String },
    discordAvatar: { type: String },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    authMethod: { type: String, enum: ['password', 'discord'], default: 'password' },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);

