const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/users  — Directory (all employees)
router.get('/', async (req, res) => {
    try {
        const { department, search } = req.query;
        const filter = { isActive: true };
        if (department) filter.department = department;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').sort({ name: 1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// GET /api/users/departments  — Unique departments list
router.get('/departments', async (req, res) => {
    try {
        const departments = await User.distinct('department', { isActive: true });
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PATCH /api/users/profile/me  — Update own profile (MUST be before /:id)
router.patch('/profile/me', [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const allowedFields = ['name', 'email', 'phone', 'designation', 'avatar'];
        const update = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) update[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select('-password');
        res.json({ success: true, message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// GET /api/users/:id  — Single user profile (AFTER specific routes)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PATCH /api/users/:id  — Admin: update any user
router.patch('/:id', restrictTo('admin'), async (req, res) => {
    try {
        delete req.body.password;
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE /api/users/:id  (Admin only — soft delete)
router.delete('/:id', restrictTo('admin'), async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: `${user.name}'s account deactivated` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
