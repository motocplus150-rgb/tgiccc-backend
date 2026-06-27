const express = require('express');
const { body, validationResult } = require('express-validator');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { sendNoticeEmail } = require('../utils/email');

const router = express.Router();
router.use(protect);

// GET /api/notices
router.get('/', async (req, res) => {
    try {
        const { priority } = req.query;
        const filter = { isActive: true };
        if (priority && priority !== 'all') filter.priority = priority;

        const notices = await Notice.find(filter).sort({ date: -1 });
        res.json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST /api/notices  (Admin only)
router.post('/', restrictTo('admin', 'supervisor'), [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const notice = await Notice.create({
            ...req.body,
            postedBy: req.user.name,
            postedByUser: req.user._id
        });

        // Email all active users about high priority notices
        if (notice.priority === 'high') {
            const users = await User.find({ isActive: true });
            const emails = users.map(u => u.email).filter(Boolean);
            if (emails.length > 0) {
                sendNoticeEmail(notice, emails).catch(err => console.log('Email error:', err.message));
            }
        }

        res.status(201).json({ success: true, message: 'Notice posted', notice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PATCH /api/notices/:id  (Admin only)
router.patch('/:id', restrictTo('admin', 'supervisor'), async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
        res.json({ success: true, message: 'Notice updated', notice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE /api/notices/:id  (Admin only)
router.delete('/:id', restrictTo('admin'), async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
        res.json({ success: true, message: 'Notice deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
