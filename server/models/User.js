const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    unique: true,
    sparse: true,
  },
  discordUsername: String,
  discordAvatar: String,
  username: {
    type: String,
    sparse: true,
  },
  email: {
    type: String,
    sparse: true,
  },
  password: {
    type: String,
    sparse: true,
  },
  authMethod: {
    type: String,
    enum: ['password', 'discord'],
    default: 'discord',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senha
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


