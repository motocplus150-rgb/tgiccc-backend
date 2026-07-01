const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        trim: true,
        uppercase: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: String
    },
    reviewedAt: {
        type: Date
    },
    rejectReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
