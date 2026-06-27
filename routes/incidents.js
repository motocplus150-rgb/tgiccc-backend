const express = require('express');
const { body, validationResult } = require('express-validator');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { sendIncidentAlert } = require('../utils/email');

const router = express.Router();

// All routes require login
router.use(protect);

// ──────────────────────────────────────────────
// GET /api/incidents  — Get all incidents (with filters)
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { status, priority, category, district, search, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        if (district) filter.district = district;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await Incident.countDocuments(filter);
        const incidents = await Incident.find(filter)
            .sort({ reportedDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            incidents
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/incidents/stats  — Summary for dashboard
// ──────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [total, active, resolved, critical] = await Promise.all([
            Incident.countDocuments(),
            Incident.countDocuments({ status: 'active' }),
            Incident.countDocuments({ status: 'resolved' }),
            Incident.countDocuments({ priority: 'critical', status: 'active' })
        ]);

        const byCategory = await Incident.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ success: true, stats: { total, active, resolved, critical, byCategory } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/incidents/:id  — Get single incident
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
        res.json({ success: true, incident });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// POST /api/incidents  — Create incident
// ──────────────────────────────────────────────
router.post('/', [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('district').notEmpty().withMessage('District is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const incident = await Incident.create({
            ...req.body,
            reportedBy: req.body.reportedBy || req.user.name,
            reportedByUser: req.user._id
        });

        // Send alert email to admins for critical/high incidents
        if (['critical', 'high'].includes(incident.priority)) {
            const admins = await User.find({ role: 'admin', isActive: true });
            const adminEmails = admins.map(a => a.email).filter(Boolean);
            if (adminEmails.length > 0) {
                sendIncidentAlert(incident, adminEmails).catch(err => console.log('Email error:', err.message));
            }
        }

        res.status(201).json({ success: true, message: 'Incident reported successfully', incident });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// PATCH /api/incidents/:id  — Update incident
// ──────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    try {
        const update = { ...req.body };

        // Auto-set resolvedDate when marking resolved
        if (update.status === 'resolved' && !update.resolvedDate) {
            update.resolvedDate = new Date();
            update.resolvedBy = req.user._id;
        }

        const incident = await Incident.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

        res.json({ success: true, message: 'Incident updated', incident });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ──────────────────────────────────────────────
// DELETE /api/incidents/:id  (Admin only)
// ──────────────────────────────────────────────
router.delete('/:id', restrictTo('admin'), async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);
        if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
        res.json({ success: true, message: 'Incident deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
