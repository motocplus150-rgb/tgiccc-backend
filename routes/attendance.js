const express = require('express');
const Attendance = require('../models/Attendance');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Helper: format duration in hours and minutes
function formatDuration(checkIn, checkOut) {
    const ms = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}

// GET /api/attendance  — Own attendance history
router.get('/', async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = { user: req.user._id };

        if (month && year) {
            filter.date = { $regex: `^${year}-${String(month).padStart(2, '0')}` };
        }

        const records = await Attendance.find(filter).sort({ date: -1 }).limit(60);
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// GET /api/attendance/all  — All employees' attendance (Admin only)
router.get('/all', restrictTo('admin', 'supervisor'), async (req, res) => {
    try {
        const { date } = req.query;
        const filter = {};
        if (date) filter.date = date;

        const records = await Attendance.find(filter).populate('user', 'name employeeId department').sort({ date: -1 });
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST /api/attendance/checkin
router.post('/checkin', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const existing = await Attendance.findOne({ user: req.user._id, date: today });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already checked in today' });
        }

        const record = await Attendance.create({
            user: req.user._id,
            employeeId: req.user.employeeId,
            date: today,
            checkIn: new Date(),
            shift: req.body.shift || 'morning'
        });

        res.status(201).json({ success: true, message: 'Checked in successfully', record });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PATCH /api/attendance/checkout
router.patch('/checkout', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({ user: req.user._id, date: today });

        if (!record) return res.status(404).json({ success: false, message: 'No check-in found for today' });
        if (record.checkOut) return res.status(400).json({ success: false, message: 'You have already checked out' });

        record.checkOut = new Date();
        record.duration = formatDuration(record.checkIn, record.checkOut);
        await record.save();

        res.json({ success: true, message: 'Checked out successfully', record });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// GET /api/attendance/today  — Today's status
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({ user: req.user._id, date: today });
        res.json({ success: true, record: record || null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
