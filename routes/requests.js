const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { sendAccessRequestEmail, sendAccessApprovedEmail, sendAccessRejectedEmail } = require('../utils/email');

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/requests  — Staff submits access request (public)
// ──────────────────────────────────────────────
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, employeeId, email, phone, department, designation } = req.body;

        // Check if request already exists
        const existingRequest = await Request.findOne({
            $or: [
                { employeeId: employeeId.toUpperCase() },
                { email: email.toLowerCase() }
            ],
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A request with this Employee ID or email is already pending.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { employeeId: employeeId.toUpperCase() },
                { email: email.toLowerCase() }
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this Employee ID or email already exists.'
            });
        }

        const request = await Request.create({
            name, employeeId, email, phone, department, designation
        });

        // Notify admin by email (non-blocking)
        sendAccessRequestEmail(request).catch(err => console.log('Email error:', err.message));

        res.status(201).json({
            success: true,
            message: 'Your access request has been submitted. Admin will review and notify you by email.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/requests  — Admin gets all requests
// ──────────────────────────────────────────────
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const requests = await Request.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, total: requests.length, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// PATCH /api/requests/:id/approve  — Admin approves request
// ──────────────────────────────────────────────
router.patch('/:id/approve', protect, restrictTo('admin'), async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request already reviewed' });
        }

        // Generate a temporary password
        const tempPassword = 'TGiCCC@' + Math.random().toString(36).slice(-6).toUpperCase();

        // Create the user account
        const user = await User.create({
            employeeId: request.employeeId,
            name: request.name,
            email: request.email,
            password: tempPassword,
            department: request.department,
            designation: request.designation,
            phone: request.phone,
            role: 'employee',
            avatar: request.name.substring(0, 2).toUpperCase()
        });

        // Update request status
        request.status = 'approved';
        request.reviewedBy = req.user.name;
        request.reviewedAt = new Date();
        await request.save();

        // Send approval email with credentials (non-blocking)
        sendAccessApprovedEmail(request, tempPassword).catch(err => console.log('Email error:', err.message));

        res.json({
            success: true,
            message: `Account created for ${request.name}. Login credentials sent to ${request.email}.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// PATCH /api/requests/:id/reject  — Admin rejects request
// ──────────────────────────────────────────────
router.patch('/:id/reject', protect, restrictTo('admin'), async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request already reviewed' });
        }

        request.status = 'rejected';
        request.reviewedBy = req.user.name;
        request.reviewedAt = new Date();
        request.rejectReason = req.body.reason || 'Not eligible';
        await request.save();

        // Send rejection email (non-blocking)
        sendAccessRejectedEmail(request).catch(err => console.log('Email error:', err.message));

        res.json({ success: true, message: `Request from ${request.name} has been rejected.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
