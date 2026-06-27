/**
 * TGiCCC Database Seeder
 * Run: node seeder.js --import   (to add sample data)
 * Run: node seeder.js --destroy  (to clear all data)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Incident = require('./models/Incident');
const Notice = require('./models/Notice');

connectDB();

const seedUsers = [
    {
        employeeId: 'ADMIN001',
        name: 'System Admin',
        email: 'admin@tgiccc.gov.in',
        password: 'Admin@1234',
        role: 'admin',
        department: 'IT Operations',
        phone: '+91-40-2345-6789',
        designation: 'System Administrator',
        avatar: 'SA'
    },
    {
        employeeId: 'EMP001',
        name: 'PC Ramesh Kumar',
        email: 'emp001@tgiccc.gov.in',
        password: 'Emp@1234',
        role: 'employee',
        department: 'Operations',
        phone: '+91-40-2345-6790',
        designation: 'Police Constable',
        avatar: 'RK'
    },
    {
        employeeId: 'SUP001',
        name: 'Inspector Vijay Reddy',
        email: 'sup001@tgiccc.gov.in',
        password: 'Sup@1234',
        role: 'supervisor',
        department: 'Law & Order',
        phone: '+91-40-2345-6791',
        designation: 'Inspector of Police',
        avatar: 'VR'
    }
];

const seedIncidents = [
    {
        title: 'Traffic Congestion - Hitech City',
        description: 'Major traffic jam reported at Hitech City junction due to road construction.',
        location: 'Hitech City, Hyderabad',
        district: 'Hyderabad',
        category: 'Traffic',
        priority: 'high',
        status: 'active',
        reportedBy: 'Traffic Control',
        assignedTo: 'Traffic Department'
    },
    {
        title: 'Power Outage - Jubilee Hills',
        description: 'Electricity supply disrupted in Jubilee Hills area affecting 500+ households.',
        location: 'Jubilee Hills, Hyderabad',
        district: 'Hyderabad',
        category: 'Utilities',
        priority: 'critical',
        status: 'active',
        reportedBy: 'Citizen Report',
        assignedTo: 'TSSPDCL'
    },
    {
        title: 'Road Accident - ORR',
        description: 'Two-vehicle collision on Outer Ring Road near Shamshabad exit. Minor injuries.',
        location: 'ORR, Shamshabad',
        district: 'Hyderabad',
        category: 'Accident',
        priority: 'critical',
        status: 'resolved',
        reportedBy: 'Traffic Police',
        assignedTo: 'Emergency Services',
        resolvedDate: new Date()
    }
];

const seedNotices = [
    {
        title: 'System Maintenance Scheduled',
        content: 'Scheduled maintenance on the portal. All systems will be temporarily unavailable from 02:00 AM to 04:00 AM.',
        priority: 'high',
        department: 'IT',
        postedBy: 'System Admin'
    },
    {
        title: 'Security Protocol Update',
        content: 'New security protocols have been implemented. Please review the updated guidelines in your dashboard.',
        priority: 'medium',
        department: 'Security',
        postedBy: 'Security Team'
    }
];

const importData = async () => {
    try {
        console.log('🌱 Seeding database...');
        await User.deleteMany();
        await Incident.deleteMany();
        await Notice.deleteMany();

        await User.create(seedUsers);
        await Incident.create(seedIncidents);
        await Notice.create(seedNotices);

        console.log('✅ Database seeded successfully!');
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin     → ID: ADMIN001  | Password: Admin@1234');
        console.log('   Employee  → ID: EMP001    | Password: Emp@1234');
        console.log('   Supervisor→ ID: SUP001    | Password: Sup@1234\n');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Incident.deleteMany();
        await Notice.deleteMany();
        console.log('🗑️  All data cleared');
        process.exit();
    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--destroy') destroyData();
else {
    console.log('Usage: node seeder.js --import | --destroy');
    process.exit();
}
