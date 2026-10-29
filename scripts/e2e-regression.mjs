import http from 'node:http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getCacheStats, getCachedValue, invalidateCache, setCachedValue } from '../cache.js';
import taskEvents from '../events.js';
import '../listeners.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'student-portfolio-lab-secret';

async function runRegression() {
  console.log('=== STARTING FINAL REGRESSION SUITE ===');

  await mongoose.connect(MONGO_URI);
  console.log('1. MongoDB Connected Successfully');

  // Test User Registration and Password Hashing
  const testEmail = `regression-${Date.now()}@test.local`;
  const plainPassword = 'securePassword123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const createdUser = await User.create({ email: testEmail, password: hashedPassword });
  console.log('2. User Registered:', createdUser.email, 'ID:', createdUser._id.toString());

  // Verify password not returned in default queries (P7 select: false)
  const queriedUser = await User.findById(createdUser._id);
  if (queriedUser.password !== undefined) {
    throw new Error('FAILED: Password field was leaked in query!');
  }
  console.log('3. Password Field Protection (select: false) Verified');

  // Verify bcrypt password compare
  const authUser = await User.findById(createdUser._id).select('+password');
  const passwordValid = await bcrypt.compare(plainPassword, authUser.password);
  if (!passwordValid) throw new Error('FAILED: Password compare failed!');
  console.log('4. Password Bcrypt Hash Comparison Verified');

  // Generate JWT token
  const token = jwt.sign({ id: createdUser._id.toString(), email: createdUser.email }, JWT_SECRET, { expiresIn: '1h' });
  console.log('5. JWT Token Generated Successfully');

  // Test Task CRUD
  const task = await Task.create({
    title: 'Regression Verification Task',
    description: 'Testing end-to-end task lifecycle',
    priority: 'high',
    user: createdUser._id,
  });
  console.log('6. Task Created:', task.title, 'ID:', task._id.toString());

  // Test Update with runValidators
  const updated = await Task.findByIdAndUpdate(
    task._id,
    { completed: true, priority: 'low' },
    { new: true, runValidators: true }
  );
  if (!updated.completed || updated.priority !== 'low') {
    throw new Error('FAILED: Task update failed!');
  }
  console.log('7. Task Updated with Validation Verified');

  // Test In-Memory Caching
  const cacheKey = `tasks:all:${createdUser._id}`;
  setCachedValue(cacheKey, [updated]);
  const cachedVal = getCachedValue(cacheKey);
  if (!cachedVal || cachedVal.length === 0) {
    throw new Error('FAILED: Cache read failed!');
  }
  console.log('8. Cache Hit Verified');

  // Test Cache Invalidation on Delete
  invalidateCache([cacheKey]);
  const afterInvalidate = getCachedValue(cacheKey);
  if (afterInvalidate !== null) {
    throw new Error('FAILED: Cache invalidation failed!');
  }
  console.log('9. Cache Invalidation Verified');

  // Delete Task
  await Task.findByIdAndDelete(task._id);
  const deletedCheck = await Task.findById(task._id);
  if (deletedCheck !== null) {
    throw new Error('FAILED: Task deletion failed!');
  }
  console.log('10. Task Deleted Verified');

  // Cleanup regression user
  await User.findByIdAndDelete(createdUser._id);
  console.log('11. Cleanup Completed');

  await mongoose.disconnect();
  console.log('=== ALL 11 REGRESSION CHECKS PASSED PERFECTLY ===');
}

runRegression().catch((err) => {
  console.error('Regression Failed:', err);
  process.exit(1);
});
