const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Notice content is required']
    },
    priority: {
        type: String,
        enum: ['normal', 'medium', 'high'],
        default: 'normal'
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    postedBy: {
        type: String,
        required: true
    },
    postedByUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'date', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Notice', noticeSchema);
