import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'student-portfolio-lab-secret';

// Helper script to obtain a valid JWT token for Apache Bench load testing (A3)
// Usage: node scripts/get-token.js
async function getToken() {
  await mongoose.connect(MONGO_URI);

  const benchmarkEmail = 'loadtest-user@benchmark.local';
  let user = await User.findOne({ email: benchmarkEmail });
  if (!user) {
    user = await User.findOne({});
  }

  if (!user) {
    console.error('No user found in database. Run `node scripts/seed.js` first.');
    process.exit(1);
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log('\n=== JWT AUTHORIZATION TOKEN ===');
  console.log(token);
  console.log('===============================\n');
  console.log('Use in Apache Bench:');
  console.log(`ab -n 200 -c 10 -H "Authorization: Bearer ${token}" http://localhost:5000/tasks\n`);

  await mongoose.disconnect();
}

getToken().catch(console.error);
