import mongoose from 'mongoose';

// User Schema with email uniqueness and protected password field (P7)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: false,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // never return password hash in queries unless explicitly requested (P7)
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
