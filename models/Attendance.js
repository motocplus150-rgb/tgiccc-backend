const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    date: {
        type: String,  // "YYYY-MM-DD" format for easy querying
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    duration: {
        type: String  // e.g. "8h 30m"
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'half-day', 'late'],
        default: 'present'
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'night'],
        default: 'morning'
    },
    notes: String
}, {
    timestamps: true
});

// One attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
