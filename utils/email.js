const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    };
    await transporter.sendMail(mailOptions);
};

// Welcome email for new employees
exports.sendWelcomeEmail = async (user) => {
    await sendEmail({
        to: user.email,
        subject: 'Welcome to TGiCCC Portal',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0047AB, #00D9FF); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏛️ TGiCCC Portal</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Telangana Integrated Command & Control Centre</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #00D9FF;">Welcome, ${user.name}!</h2>
                <p>Your TGiCCC portal account has been created successfully.</p>
                <div style="background: rgba(0,71,171,0.2); border: 1px solid #0047AB; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Employee ID:</strong> ${user.employeeId}</p>
                    <p style="margin: 8px 0 0;"><strong>Department:</strong> ${user.department}</p>
                    <p style="margin: 8px 0 0;"><strong>Role:</strong> ${user.role}</p>
                </div>
                <p>Please log in and change your password immediately.</p>
                <p style="color: #ff9800; font-size: 13px;">⚠️ Keep your credentials confidential. Do not share with anyone.</p>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana | Banjara Hills, Hyderabad
            </div>
        </div>`
    });
};

// Incident alert email
exports.sendIncidentAlert = async (incident, adminEmails) => {
    const priorityColors = { critical: '#FF1744', high: '#FF9100', medium: '#FFD600', low: '#00E676' };
    await sendEmail({
        to: adminEmails.join(', '),
        subject: `[${incident.priority.toUpperCase()}] New Incident: ${incident.title}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: ${priorityColors[incident.priority] || '#0047AB'}; padding: 20px 30px;">
                <h2 style="color: white; margin: 0;">⚠️ Incident Report</h2>
            </div>
            <div style="padding: 30px;">
                <h3 style="color: #00D9FF;">${incident.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; color: #888;">Priority</td><td style="padding: 8px; color: ${priorityColors[incident.priority]}; font-weight: bold; text-transform: uppercase;">${incident.priority}</td></tr>
                    <tr><td style="padding: 8px; color: #888;">Category</td><td style="padding: 8px;">${incident.category}</td></tr>
                    <tr><td style="padding: 8px; color: #888;">Location</td><td style="padding: 8px;">${incident.location}</td></tr>
                    <tr><td style="padding: 8px; color: #888;">District</td><td style="padding: 8px;">${incident.district}</td></tr>
                    <tr><td style="padding: 8px; color: #888;">Reported By</td><td style="padding: 8px;">${incident.reportedBy}</td></tr>
                    <tr><td style="padding: 8px; color: #888;">Assigned To</td><td style="padding: 8px;">${incident.assignedTo || 'Unassigned'}</td></tr>
                </table>
                <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-top: 16px;">
                    <p style="margin: 0; color: #ccc;">${incident.description}</p>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana
            </div>
        </div>`
    });
};

// Access request notification to admin
exports.sendAccessRequestEmail = async (request) => {
    await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `[Access Request] ${request.name} - ${request.employeeId}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0047AB, #00D9FF); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏛️ TGiCCC Portal</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">New Access Request</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #00D9FF;">New Staff Access Request</h2>
                <p>A new access request has been submitted and is awaiting your review.</p>
                <div style="background: rgba(0,71,171,0.2); border: 1px solid #0047AB; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Name:</strong> ${request.name}</p>
                    <p style="margin: 8px 0 0;"><strong>Employee ID:</strong> ${request.employeeId}</p>
                    <p style="margin: 8px 0 0;"><strong>Email:</strong> ${request.email}</p>
                    <p style="margin: 8px 0 0;"><strong>Phone:</strong> ${request.phone}</p>
                    <p style="margin: 8px 0 0;"><strong>Department:</strong> ${request.department}</p>
                    <p style="margin: 8px 0 0;"><strong>Designation:</strong> ${request.designation || 'Not specified'}</p>
                </div>
                <p>Please log in to the admin panel to approve or reject this request.</p>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana | Banjara Hills, Hyderabad
            </div>
        </div>`
    });
};

// Access approved email to staff
exports.sendAccessApprovedEmail = async (request, tempPassword) => {
    await sendEmail({
        to: request.email,
        subject: 'TGiCCC Portal Access Approved',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0047AB, #00D9FF); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏛️ TGiCCC Portal</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Access Approved</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #00E676;">✅ Your Access Has Been Approved!</h2>
                <p>Dear ${request.name}, your request to access the TGiCCC Portal has been approved.</p>
                <div style="background: rgba(0,71,171,0.2); border: 1px solid #0047AB; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Employee ID:</strong> ${request.employeeId}</p>
                    <p style="margin: 8px 0 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                <p style="color: #ff9800;">⚠️ Please log in and change your password immediately.</p>
                <p style="color: #ff9800;">⚠️ Keep your credentials confidential. Do not share with anyone.</p>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana | Banjara Hills, Hyderabad
            </div>
        </div>`
    });
};

// Access rejected email to staff
exports.sendAccessRejectedEmail = async (request) => {
    await sendEmail({
        to: request.email,
        subject: 'TGiCCC Portal Access Request Update',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0047AB, #00D9FF); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏛️ TGiCCC Portal</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Access Request Update</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #FF1744;">Access Request Not Approved</h2>
                <p>Dear ${request.name}, unfortunately your request to access the TGiCCC Portal could not be approved at this time.</p>
                <div style="background: rgba(255,23,68,0.1); border: 1px solid #FF1744; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Reason:</strong> ${request.rejectReason}</p>
                </div>
                <p>If you believe this is an error, please contact your department head or the system administrator.</p>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana | Banjara Hills, Hyderabad
            </div>
        </div>`
    });
};

// Notice notification email
exports.sendNoticeEmail = async (notice, recipientEmails) => {
    await sendEmail({
        to: recipientEmails.join(', '),
        subject: `[Notice] ${notice.title}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0047AB, #00D9FF); padding: 20px 30px;">
                <h2 style="color: white; margin: 0;">📢 TGiCCC Notice Board</h2>
            </div>
            <div style="padding: 30px;">
                <h3 style="color: #00D9FF;">${notice.title}</h3>
                <p style="color: #888; font-size: 13px;">Posted by ${notice.postedBy} | ${notice.department} Department</p>
                <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-top: 16px;">
                    <p style="margin: 0; color: #ccc; line-height: 1.6;">${notice.content}</p>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; text-align: center; font-size: 12px; color: #888;">
                © 2024 TGiCCC | Government of Telangana
            </div>
        </div>`
    });
};
