import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portfolio';

// Idempotent seed script to insert >= 50 tasks for load testing (A3)
// Never runs automatically; run manually with `node scripts/seed.js`
async function seedDatabase() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Find or create a dedicated benchmark user
  const benchmarkEmail = 'loadtest-user@benchmark.local';
  let user = await User.findOne({ email: benchmarkEmail });
  if (!user) {
    user = await User.create({
      email: benchmarkEmail,
      password: 'password123',
    });
    console.log('Created benchmark user:', benchmarkEmail);
  }

  // Idempotent cleanup of previous seed data
  const deleteResult = await Task.deleteMany({ title: /^Seed Task #/ });
  console.log(`Cleaned up ${deleteResult.deletedCount} existing seed tasks.`);

  const categories = ['Frontend', 'Backend', 'DevOps', 'Testing', 'Security', 'Database'];
  const priorities = ['low', 'medium', 'high'];

  const tasksToInsert = [];
  for (let i = 1; i <= 60; i++) {
    const category = categories[i % categories.length];
    const priority = priorities[i % priorities.length];
    tasksToInsert.push({
      title: `Seed Task #${i.toString().padStart(2, '0')}: Optimize ${category} Workflow`,
      description: `Automated test task for Apache Bench / load-testing verification in category ${category}.`,
      priority,
      completed: i % 3 === 0,
      user: user._id,
      createdAt: new Date(Date.now() - i * 3600000),
    });
  }

  const inserted = await Task.insertMany(tasksToInsert);
  console.log(`✓ Successfully seeded ${inserted.length} tasks for user ${user.email} (ID: ${user._id})`);

  const totalCount = await Task.countDocuments();
  console.log(`Current total task count in database: ${totalCount}`);

  await mongoose.disconnect();
  console.log('Database connection closed.');
}

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
