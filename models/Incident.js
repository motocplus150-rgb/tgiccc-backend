const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Incident title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    district: {
        type: String,
        required: [true, 'District is required']
    },
    category: {
        type: String,
        enum: ['Traffic', 'Utilities', 'Accident', 'Security', 'Infrastructure', 'Fire', 'Missing Person', 'Civic', 'Public Event', 'Sanitation', 'Other'],
        required: [true, 'Category is required']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'pending', 'closed'],
        default: 'active'
    },
    reportedBy: {
        type: String,
        required: [true, 'Reported by is required']
    },
    reportedByUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: String
    },
    resolvedDate: {
        type: Date
    },
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    notes: [{
        text: String,
        addedBy: String,
        addedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: { createdAt: 'reportedDate', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Incident', incidentSchema);
