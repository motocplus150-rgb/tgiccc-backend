const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
router.post('/login', [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { employeeId, password } = req.body;

        const user = await User.findOne({ employeeId: employeeId.toUpperCase() }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid Employee ID or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
                designation: user.designation,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// POST /api/auth/register  (Admin only)
// ──────────────────────────────────────────────
router.post('/register', protect, restrictTo('admin'), [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { employeeId, name, email, password, role, department, phone, designation } = req.body;

        const existingUser = await User.findOne({
            $or: [{ employeeId: employeeId.toUpperCase() }, { email: email.toLowerCase() }]
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Employee ID or email already exists' });
        }

        const user = await User.create({
            employeeId, name, email, password,
            role: role || 'employee',
            department, phone, designation,
            avatar: name.substring(0, 2).toUpperCase()
        });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(user).catch(err => console.log('Email error:', err.message));

        res.status(201).json({
            success: true,
            message: `Employee ${name} registered successfully`,
            user: { id: user._id, employeeId: user.employeeId, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/auth/me  — Get current user
// ──────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

// ──────────────────────────────────────────────
// PATCH /api/auth/change-password
// ──────────────────────────────────────────────
router.patch('/change-password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = req.body.newPassword;
        user.passwordChangedAt = new Date();
        await user.save();
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
