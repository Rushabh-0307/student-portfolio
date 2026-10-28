import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true,
  },
  githubLogin: {
    type: String,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
