const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function runMigrations() {
  console.log('Running database migrations...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await pool.execute(statement);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error('Migration error:', error.message);
      }
    }
  }

  console.log('✅ Migrations completed');
}

async function seedAdmin() {
  console.log('Seeding admin user...');

  const adminEmail = 'admin@brainstermath.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin User';

  const [existing] = await pool.execute(
    'SELECT * FROM admins WHERE email = ?',
    [adminEmail]
  );

  if (existing.length > 0) {
    console.log('Admin user already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await pool.execute(
    'INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)',
    [adminEmail, passwordHash, adminName]
  );

  console.log('✅ Admin created:');
  console.log('   Email:', adminEmail);
  console.log('   Password:', adminPassword);
}

async function seedStudents() {
  console.log('Seeding example students...');

  const students = [
    { name: 'Alice Johnson', email: 'alice@example.com', level: 1, phone: '1234567890', address: '123 Main St' },
    { name: 'Bob Smith', email: 'bob@example.com', level: 2, phone: '2345678901', address: '456 Oak Ave' },
    { name: 'Carol White', email: 'carol@example.com', level: 3, phone: '3456789012', address: '789 Pine Rd' },
    { name: 'David Brown', email: 'david@example.com', level: 4, phone: '4567890123', address: '321 Elm St' },
    { name: 'Emma Davis', email: 'emma@example.com', level: 5, phone: '5678901234', address: '654 Maple Dr' },
    { name: 'Frank Wilson', email: 'frank@example.com', level: 6, phone: '6789012345', address: '987 Cedar Ln' },
    { name: 'Grace Lee', email: 'grace@example.com', level: 7, phone: '7890123456', address: '147 Birch Way' },
    { name: 'Henry Martinez', email: 'henry@example.com', level: 8, phone: '8901234567', address: '258 Spruce Ct' },
  ];

  const defaultPassword = 'student123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const student of students) {
    const [existing] = await pool.execute(
      'SELECT * FROM students WHERE email = ?',
      [student.email]
    );

    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO students (name, email, password_hash, phone, address, level, accessible_levels, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [student.name, student.email, passwordHash, student.phone, student.address, student.level, JSON.stringify([]), 'email']
      );
      console.log(`   ✅ Created ${student.name} (Level ${student.level})`);
    } else {
      console.log(`   Student ${student.email} already exists`);
    }
  }

  console.log('\n✅ Students seeded. Default password for all: student123');
}

async function seed() {
  try {
    await runMigrations();
    await seedAdmin();
    await seedStudents();

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Next steps:');
    console.log('1. Start the backend: npm start');
    console.log('2. Open the frontend in a browser');
    console.log('3. Login with admin@brainstermath.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
