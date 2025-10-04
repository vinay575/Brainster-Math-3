const Student = require('../models/Student');
const LevelRequest = require('../models/LevelRequest');
const ActivityLog = require('../models/ActivityLog');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    delete student.password_hash;
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, address, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await Student.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
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
    delete student.password_hash;

    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone, address, level } = req.body;
    await Student.update(req.params.id, { name, email, phone, address, level });

    const student = await Student.findById(req.params.id);
    delete student.password_hash;

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.delete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Student.getTotalCount();
    const byLevel = await Student.getCountByLevel();
    const recentActivity = await ActivityLog.getRecent(10);

    res.json({
      totalStudents: total,
      studentsByLevel: byLevel,
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    delete student.password_hash;
    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.getMyActivity = async (req, res) => {
  try {
    const activity = await ActivityLog.getByStudentId(req.user.id);
    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

exports.logActivity = async (req, res) => {
  try {
    const { sheet, slide, level } = req.body;
    await ActivityLog.create(req.user.id, sheet, slide, level);
    res.json({ message: 'Activity logged' });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
};
