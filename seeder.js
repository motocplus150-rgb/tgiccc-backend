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
        name: 'TGiCCC Administrator',
        email: 'photoshop9011@gmail.com',
        password: 'Admin@9011',
        role: 'admin',
        department: 'DAPP TGICCC',
        phone: '+91-40-2345-6789',
        designation: 'System Administrator',
        avatar: 'TA'
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
        title: 'Welcome to TGiCCC Portal',
        content: 'Welcome to the Telangana Integrated Command and Control Centre staff portal. Please complete your profile and review the guidelines.',
        priority: 'high',
        department: 'DAPP TGICCC',
        postedBy: 'TGiCCC Administrator'
    },
    {
        title: 'Security Protocol',
        content: 'All staff must use their official credentials only. Do not share passwords. Report any suspicious activity immediately.',
        priority: 'medium',
        department: 'DAPP TGICCC',
        postedBy: 'TGiCCC Administrator'
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
        console.log('   Admin → ID: ADMIN001  | Password: Admin@9011\n');
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
