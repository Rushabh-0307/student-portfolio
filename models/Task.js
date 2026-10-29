import mongoose from 'mongoose';

// Task Schema with Mongoose validation (P5, P7)
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority',
    },
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // existing tasks without user still load smoothly (P7)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to trim whitespace (P5 supplementary)
taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.description) {
    this.description = this.description.trim();
  }
  if (typeof next === 'function') next();
});

export const Task = mongoose.model('Task', taskSchema);
