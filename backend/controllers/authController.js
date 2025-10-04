const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const { verifyFirebaseToken, isAllowedGoogleDomain } = require('../config/firebase');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user, role) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role,
      level: user.level,
      accessible_levels: user.accessible_levels || []
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await Admin.verifyPassword(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin, 'admin');

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!student.password_hash) {
      return res.status(401).json({ error: 'Please use Google login for this account' });
    }

    const isValidPassword = await Student.verifyPassword(password, student.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(student, 'student');

    res.json({
      token,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        level: student.level,
        accessible_levels: student.accessible_levels,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.studentSignup = async (req, res) => {
  try {
    const { name, email, password, phone, address, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await Student.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const studentId = await Student.create({
      name,
      email,
      password,
      phone,
      address,
      level: level || 1,
      authProvider: 'email'
    });

    const student = await Student.findById(studentId);
    const token = generateToken(student, 'student');

    res.status(201).json({
      token,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        level: student.level,
        accessible_levels: student.accessible_levels,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name } = decodedToken;

    // Temporarily allow all domains for testing
    console.log(`Google login attempt for email: ${email}`);
    console.log(`Domain: ${email.split('@')[1]} - ALLOWING ALL DOMAINS FOR NOW`);
    
    // Uncomment the lines below to re-enable domain checking
    // if (!isAllowedGoogleDomain(email)) {
    //   console.log(`Google login blocked for domain: ${email.split('@')[1]}`);
    //   return res.status(403).json({ 
    //     error: 'Your email domain is not allowed to sign in. Please contact administrator to add your domain.' 
    //   });
    // }

    if (role === 'admin') {
      let admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(403).json({ error: 'Admin account not found. Please contact support.' });
      }

      const token = generateToken(admin, 'admin');
      return res.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        }
      });
    } else {
      let student = await Student.findByFirebaseUid(uid);

      if (!student) {
        student = await Student.findByEmail(email);
      }

      if (!student) {
        console.log(`Creating new student with Google login: ${email}`);
        const studentId = await Student.create({
          name: name || email.split('@')[0],
          email,
          firebaseUid: uid,
          authProvider: 'google',
          level: 1
        });
        console.log(`Student created with ID: ${studentId}`);
        student = await Student.findById(studentId);
        console.log(`Retrieved student:`, student);
      } else if (!student.firebase_uid) {
        console.log(`Updating existing student ${student.id} with Firebase UID: ${uid}`);
        const { pool } = require('../config/database');
        await pool.execute(
          'UPDATE students SET firebase_uid = ?, auth_provider = ? WHERE id = ?',
          [uid, 'google', student.id]
        );
        student.firebase_uid = uid;
        student.auth_provider = 'google';
      }

      const token = generateToken(student, 'student');
      return res.json({
        token,
        user: {
          id: student.id,
          email: student.email,
          name: student.name,
          level: student.level,
          accessible_levels: student.accessible_levels,
          role: 'student'
        }
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed: ' + error.message });
  }
};

exports.verifyToken = async (req, res) => {
  res.json({ user: req.user });
};
