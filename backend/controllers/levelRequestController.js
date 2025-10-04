const LevelRequest = require('../models/LevelRequest');
const Student = require('../models/Student');

exports.createRequest = async (req, res) => {
  try {
    const { requestedLevel, message } = req.body;
    const studentId = req.user.id;

    if (!requestedLevel) {
      return res.status(400).json({ error: 'Requested level is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (requestedLevel <= student.level) {
      return res.status(400).json({ error: 'Requested level must be higher than current level' });
    }

    const existingPending = await LevelRequest.getByStudentId(studentId);
    const hasPending = existingPending.some(r => r.status === 'pending' && r.requested_level === parseInt(requestedLevel));

    if (hasPending) {
      return res.status(400).json({ error: 'You already have a pending request for this level' });
    }

    const requestId = await LevelRequest.create(
      studentId,
      student.level,
      parseInt(requestedLevel),
      message
    );

    res.status(201).json({
      message: 'Level upgrade request submitted successfully',
      requestId
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await LevelRequest.getByStudentId(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await LevelRequest.getAll();
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await LevelRequest.getPending();
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

exports.getPendingCount = async (req, res) => {
  try {
    const count = await LevelRequest.getPendingCount();
    res.json({ count });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    const request = await LevelRequest.getById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await LevelRequest.updateStatus(id, 'approved', adminResponse);

    await Student.updateLevel(request.student_id, request.requested_level);

    res.json({ message: 'Request approved and student level updated' });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    const request = await LevelRequest.getById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await LevelRequest.updateStatus(id, 'rejected', adminResponse);

    res.json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};
