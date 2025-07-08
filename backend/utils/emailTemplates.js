/**
 * Email template utilities for HRMS application
 * Provides reusable email templates and formatting functions
 */

/**
 * Base email template wrapper
 * @param {string} content - Email content
 * @param {string} title - Email title
 * @returns {string} Formatted HTML email
 */
const baseTemplate = (content, title = 'HRMS Notification') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }
            .footer {
                text-align: center;
                border-top: 1px solid #eee;
                padding-top: 20px;
                font-size: 12px;
                color: #666;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 10px;
                border-left: 4px solid #ffc107;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">HRMS Dashboard</div>
                <p>Hotel & Restaurant Management System</p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>This is an automated message from HRMS Dashboard.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Welcome email template for new users
 * @param {Object} user - User object
 * @param {string} loginUrl - Login URL
 * @returns {string} Welcome email HTML
 */
const welcomeTemplate = (user, loginUrl = '#') => {
  const content = `
    <h2>Welcome to HRMS Dashboard, ${user.name}!</h2>
    <p>Your account has been successfully created. We're excited to have you on board!</p>
    
    <div class="highlight">
        <strong>Account Details:</strong><br>
        Email: ${user.email}<br>
        Role: ${user.role || 'User'}<br>
        Account Created: ${new Date().toLocaleDateString()}
    </div>
    
    <p>You can now access your dashboard using the button below:</p>
    <a href="${loginUrl}" class="button">Access Dashboard</a>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
  `;
  
  return baseTemplate(content, 'Welcome to HRMS Dashboard');
};

/**
 * Password reset email template
 * @param {Object} user - User object
 * @param {string} resetUrl - Password reset URL
 * @param {number} expiryMinutes - Token expiry time in minutes
 * @returns {string} Password reset email HTML
 */
const passwordResetTemplate = (user, resetUrl, expiryMinutes = 30) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.name},</p>
    <p>We received a request to reset your password for your HRMS Dashboard account.</p>
    
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    
    <div class="highlight">
        <strong>Important:</strong><br>
        This link will expire in ${expiryMinutes} minutes for security reasons.<br>
        If you didn't request this reset, please ignore this email.
    </div>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
  `;
  
  return baseTemplate(content, 'Password Reset - HRMS Dashboard');
};

/**
 * Booking confirmation email template
 * @param {Object} booking - Booking details
 * @param {Object} customer - Customer details
 * @returns {string} Booking confirmation email HTML
 */
const bookingConfirmationTemplate = (booking, customer) => {
  const content = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${customer.name},</p>
    <p>Thank you for your booking! Your reservation has been confirmed.</p>
    
    <div class="highlight">
        <strong>Booking Details:</strong><br>
        Booking ID: ${booking.id}<br>
        Date: ${booking.date}<br>
        Time: ${booking.time}<br>
        Guests: ${booking.guests}<br>
        Table: ${booking.tableName || 'TBD'}<br>
        Total Amount: $${booking.totalAmount || '0.00'}
    </div>
    
    <p>We look forward to serving you. If you need to make any changes to your reservation, please contact us as soon as possible.</p>
    
    <p><strong>Contact Information:</strong><br>
    Phone: (555) 123-4567<br>
    Email: reservations@hrms.com</p>
  `;
  
  return baseTemplate(content, 'Booking Confirmation - HRMS');
};

/**
 * Staff notification email template
 * @param {Object} staff - Staff member details
 * @param {string} message - Notification message
 * @param {string} type - Notification type (shift, announcement, etc.)
 * @returns {string} Staff notification email HTML
 */
const staffNotificationTemplate = (staff, message, type = 'notification') => {
  const typeLabels = {
    shift: 'Shift Update',
    announcement: 'Important Announcement',
    schedule: 'Schedule Change',
    notification: 'Notification'
  };
  
  const content = `
    <h2>${typeLabels[type] || 'Notification'}</h2>
    <p>Hello ${staff.name},</p>
    
    <div class="highlight">
        ${message}
    </div>
    
    <p>Please check your dashboard for more details and take any necessary action.</p>
    <a href="#" class="button">View Dashboard</a>
  `;
  
  return baseTemplate(content, `${typeLabels[type]} - HRMS Dashboard`);
};

/**
 * System alert email template
 * @param {string} alertType - Type of alert
 * @param {string} message - Alert message
 * @param {Object} details - Additional details
 * @returns {string} System alert email HTML
 */
const systemAlertTemplate = (alertType, message, details = {}) => {
  const content = `
    <h2>System Alert: ${alertType}</h2>
    <p>A system alert has been triggered that requires attention.</p>
    
    <div class="highlight">
        <strong>Alert Details:</strong><br>
        Type: ${alertType}<br>
        Time: ${new Date().toLocaleString()}<br>
        Message: ${message}
    </div>
    
    ${Object.keys(details).length > 0 ? `
    <p><strong>Additional Information:</strong></p>
    <ul>
      ${Object.entries(details).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
    </ul>
    ` : ''}
    
    <p>Please investigate this alert and take appropriate action if necessary.</p>
  `;
  
  return baseTemplate(content, `System Alert - ${alertType}`);
};

/**
 * Generate plain text version of email
 * @param {string} htmlContent - HTML email content
 * @returns {string} Plain text version
 */
const generatePlainText = (htmlContent) => {
  return htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Email template factory
 * @param {string} templateType - Type of template
 * @param {Object} data - Template data
 * @returns {Object} Email template with HTML and text versions
 */
const createEmailTemplate = (templateType, data) => {
  let html = '';
  let subject = '';
  
  switch (templateType) {
    case 'welcome':
      html = welcomeTemplate(data.user, data.loginUrl);
      subject = 'Welcome to HRMS Dashboard';
      break;
      
    case 'passwordReset':
      html = passwordResetTemplate(data.user, data.resetUrl, data.expiryMinutes);
      subject = 'Password Reset Request';
      break;
      
    case 'bookingConfirmation':
      html = bookingConfirmationTemplate(data.booking, data.customer);
      subject = 'Booking Confirmation';
      break;
      
    case 'staffNotification':
      html = staffNotificationTemplate(data.staff, data.message, data.type);
      subject = `${data.type || 'Notification'} - HRMS Dashboard`;
      break;
      
    case 'systemAlert':
      html = systemAlertTemplate(data.alertType, data.message, data.details);
      subject = `System Alert: ${data.alertType}`;
      break;
      
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
  
  return {
    html,
    text: generatePlainText(html),
    subject
  };
};

module.exports = {
  baseTemplate,
  welcomeTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  staffNotificationTemplate,
  systemAlertTemplate,
  generatePlainText,
  createEmailTemplate
};
