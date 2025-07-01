/**
 * HRMS AI Integrated System - Email Template Management Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Professional email templates for notifications, confirmations, and communications
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Email Template Manager Class
 */
class EmailTemplateManager {
    constructor() {
        this.templates = new Map();
        this.defaultStyles = this.getDefaultStyles();
        this.loadTemplates();
    }

    /**
     * Get default CSS styles for email templates
     * @returns {string} CSS styles
     */
    getDefaultStyles() {
        return `
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .button:hover { background: #0056b3; }
                .alert { padding: 15px; margin: 20px 0; border-radius: 5px; }
                .alert-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
                .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
                .booking-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .booking-details h3 { margin-top: 0; color: #495057; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                .detail-label { font-weight: bold; }
                .social-links { text-align: center; margin: 20px 0; }
                .social-links a { margin: 0 10px; color: #007bff; text-decoration: none; }
            </style>
        `;
    }

    /**
     * Load all email templates
     */
    loadTemplates() {
        // Welcome email template
        this.templates.set('welcome', {
            subject: 'Welcome to {{businessName}} - Your Account is Ready!',
            html: this.createWelcomeTemplate(),
            text: this.createWelcomeTextTemplate()
        });

        // Booking confirmation template
        this.templates.set('booking-confirmation', {
            subject: 'Booking Confirmation - {{bookingId}} at {{businessName}}',
            html: this.createBookingConfirmationTemplate(),
            text: this.createBookingConfirmationTextTemplate()
        });

        // Reservation confirmation template
        this.templates.set('reservation-confirmation', {
            subject: 'Table Reservation Confirmed - {{reservationId}} at {{businessName}}',
            html: this.createReservationConfirmationTemplate(),
            text: this.createReservationConfirmationTextTemplate()
        });

        // Password reset template
        this.templates.set('password-reset', {
            subject: 'Reset Your Password - {{businessName}}',
            html: this.createPasswordResetTemplate(),
            text: this.createPasswordResetTextTemplate()
        });

        // Email verification template
        this.templates.set('email-verification', {
            subject: 'Verify Your Email Address - {{businessName}}',
            html: this.createEmailVerificationTemplate(),
            text: this.createEmailVerificationTextTemplate()
        });

        // Booking reminder template
        this.templates.set('booking-reminder', {
            subject: 'Reminder: Your Stay at {{businessName}} is Tomorrow',
            html: this.createBookingReminderTemplate(),
            text: this.createBookingReminderTextTemplate()
        });

        // Payment receipt template
        this.templates.set('payment-receipt', {
            subject: 'Payment Receipt - {{transactionId}} from {{businessName}}',
            html: this.createPaymentReceiptTemplate(),
            text: this.createPaymentReceiptTextTemplate()
        });

        // Cancellation confirmation template
        this.templates.set('cancellation-confirmation', {
            subject: 'Cancellation Confirmed - {{bookingId}} at {{businessName}}',
            html: this.createCancellationConfirmationTemplate(),
            text: this.createCancellationConfirmationTextTemplate()
        });
    }

    /**
     * Create welcome email template
     * @returns {string} HTML template
     */
    createWelcomeTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to {{businessName}}</title>
                ${this.defaultStyles}
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to {{businessName}}!</h1>
                        <p>Your premium hospitality experience awaits</p>
                    </div>
                    <div class="content">
                        <h2>Hello {{userName}},</h2>
                        <p>Thank you for joining {{businessName}}! We're excited to have you as part of our community.</p>
                        
                        <div class="alert alert-success">
                            <strong>Account Created Successfully!</strong><br>
                            Your account has been set up and you can now enjoy all our services.
                        </div>

                        <h3>What's Next?</h3>
                        <ul>
                            <li>Complete your profile for personalized recommendations</li>
                            <li>Browse our rooms and dining options</li>
                            <li>Make your first booking and earn loyalty points</li>
                            <li>Download our mobile app for exclusive deals</li>
                        </ul>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{loginUrl}}" class="button">Access Your Account</a>
                        </div>

                        <p>If you have any questions, our support team is here to help 24/7.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{currentYear}} {{businessName}}. All rights reserved.</p>
                        <p>{{businessAddress}} | {{businessPhone}} | {{businessEmail}}</p>
                        <div class="social-links">
                            <a href="{{facebookUrl}}">Facebook</a>
                            <a href="{{twitterUrl}}">Twitter</a>
                            <a href="{{instagramUrl}}">Instagram</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Create booking confirmation template
     * @returns {string} HTML template
     */
    createBookingConfirmationTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Booking Confirmation</title>
                ${this.defaultStyles}
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Confirmed!</h1>
                        <p>We look forward to hosting you</p>
                    </div>
                    <div class="content">
                        <h2>Hello {{guestName}},</h2>
                        <p>Your booking has been confirmed! Here are your reservation details:</p>
                        
                        <div class="booking-details">
                            <h3>Booking Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Booking ID:</span>
                                <span>{{bookingId}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Room Type:</span>
                                <span>{{roomType}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-in:</span>
                                <span>{{checkInDate}} at {{checkInTime}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-out:</span>
                                <span>{{checkOutDate}} at {{checkOutTime}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Guests:</span>
                                <span>{{guestCount}} {{guestCount === 1 ? 'Guest' : 'Guests'}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Total Amount:</span>
                                <span><strong>{{totalAmount}}</strong></span>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <strong>Important Information:</strong><br>
                            • Check-in starts at {{checkInTime}}<br>
                            • Please bring a valid ID and credit card<br>
                            • Free cancellation until {{cancellationDeadline}}
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{bookingUrl}}" class="button">View Booking Details</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; {{currentYear}} {{businessName}}. All rights reserved.</p>
                        <p>{{businessAddress}} | {{businessPhone}} | {{businessEmail}}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Create password reset template
     * @returns {string} HTML template
     */
    createPasswordResetTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                ${this.defaultStyles}
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                        <p>Secure your account with a new password</p>
                    </div>
                    <div class="content">
                        <h2>Hello {{userName}},</h2>
                        <p>We received a request to reset your password for your {{businessName}} account.</p>
                        
                        <div class="alert alert-warning">
                            <strong>Security Notice:</strong><br>
                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </div>

                        <p>To reset your password, click the button below. This link will expire in {{expirationTime}} for security reasons.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{resetUrl}}" class="button">Reset Password</a>
                        </div>

                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">{{resetUrl}}</p>

                        <p>For security reasons, this link will expire on {{expirationDate}}.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{currentYear}} {{businessName}}. All rights reserved.</p>
                        <p>{{businessAddress}} | {{businessPhone}} | {{businessEmail}}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Create text versions of templates
     */
    createWelcomeTextTemplate() {
        return `
Welcome to {{businessName}}!

Hello {{userName}},

Thank you for joining {{businessName}}! We're excited to have you as part of our community.

Your account has been created successfully and you can now enjoy all our services.

What's Next?
- Complete your profile for personalized recommendations
- Browse our rooms and dining options
- Make your first booking and earn loyalty points
- Download our mobile app for exclusive deals

Access your account: {{loginUrl}}

If you have any questions, our support team is here to help 24/7.

Best regards,
{{businessName}} Team

{{businessAddress}} | {{businessPhone}} | {{businessEmail}}
        `;
    }

    createBookingConfirmationTextTemplate() {
        return `
Booking Confirmed!

Hello {{guestName}},

Your booking has been confirmed! Here are your reservation details:

Booking Information:
- Booking ID: {{bookingId}}
- Room Type: {{roomType}}
- Check-in: {{checkInDate}} at {{checkInTime}}
- Check-out: {{checkOutDate}} at {{checkOutTime}}
- Guests: {{guestCount}}
- Total Amount: {{totalAmount}}

Important Information:
• Check-in starts at {{checkInTime}}
• Please bring a valid ID and credit card
• Free cancellation until {{cancellationDeadline}}

View booking details: {{bookingUrl}}

We look forward to hosting you!

{{businessName}} Team
{{businessAddress}} | {{businessPhone}} | {{businessEmail}}
        `;
    }

    createPasswordResetTextTemplate() {
        return `
Password Reset Request

Hello {{userName}},

We received a request to reset your password for your {{businessName}} account.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

To reset your password, visit this link: {{resetUrl}}

This link will expire on {{expirationDate}} for security reasons.

{{businessName}} Team
{{businessAddress}} | {{businessPhone}} | {{businessEmail}}
        `;
    }

    /**
     * Get template by name
     * @param {string} templateName - Template name
     * @returns {Object|null} Template object
     */
    getTemplate(templateName) {
        return this.templates.get(templateName) || null;
    }

    /**
     * Render template with data
     * @param {string} templateName - Template name
     * @param {Object} data - Template data
     * @returns {Object} Rendered template
     */
    render(templateName, data = {}) {
        const template = this.getTemplate(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        // Add default data
        const templateData = {
            currentYear: new Date().getFullYear(),
            businessName: 'HRMS Hotel & Restaurant',
            businessAddress: '123 Hospitality Street, City, State 12345',
            businessPhone: '+1 (555) 123-4567',
            businessEmail: 'info@hrms.com',
            ...data
        };

        return {
            subject: this.interpolate(template.subject, templateData),
            html: this.interpolate(template.html, templateData),
            text: this.interpolate(template.text, templateData)
        };
    }

    /**
     * Interpolate template variables
     * @param {string} template - Template string
     * @param {Object} data - Data object
     * @returns {string} Interpolated string
     */
    interpolate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Add custom template
     * @param {string} name - Template name
     * @param {Object} template - Template object
     */
    addTemplate(name, template) {
        this.templates.set(name, template);
    }

    /**
     * Get all template names
     * @returns {Array} Array of template names
     */
    getTemplateNames() {
        return Array.from(this.templates.keys());
    }
}

// Create additional template methods for missing templates
EmailTemplateManager.prototype.createReservationConfirmationTemplate = function() {
    return this.createBookingConfirmationTemplate().replace(/Booking/g, 'Reservation').replace(/booking/g, 'reservation');
};

EmailTemplateManager.prototype.createEmailVerificationTemplate = function() {
    return this.createPasswordResetTemplate().replace(/Password Reset Request/g, 'Email Verification').replace(/reset your password/g, 'verify your email');
};

EmailTemplateManager.prototype.createBookingReminderTemplate = function() {
    return this.createBookingConfirmationTemplate().replace(/Booking Confirmed!/g, 'Booking Reminder').replace(/Your booking has been confirmed!/g, 'Your stay is coming up soon!');
};

EmailTemplateManager.prototype.createPaymentReceiptTemplate = function() {
    return this.createBookingConfirmationTemplate().replace(/Booking Confirmed!/g, 'Payment Receipt').replace(/booking/g, 'payment');
};

EmailTemplateManager.prototype.createCancellationConfirmationTemplate = function() {
    return this.createBookingConfirmationTemplate().replace(/Booking Confirmed!/g, 'Cancellation Confirmed').replace(/confirmed/g, 'cancelled');
};

// Text template methods
EmailTemplateManager.prototype.createReservationConfirmationTextTemplate = function() {
    return this.createBookingConfirmationTextTemplate().replace(/Booking/g, 'Reservation').replace(/booking/g, 'reservation');
};

EmailTemplateManager.prototype.createEmailVerificationTextTemplate = function() {
    return this.createPasswordResetTextTemplate().replace(/Password Reset Request/g, 'Email Verification');
};

EmailTemplateManager.prototype.createBookingReminderTextTemplate = function() {
    return this.createBookingConfirmationTextTemplate().replace(/Booking Confirmed!/g, 'Booking Reminder');
};

EmailTemplateManager.prototype.createPaymentReceiptTextTemplate = function() {
    return this.createBookingConfirmationTextTemplate().replace(/Booking Confirmed!/g, 'Payment Receipt');
};

EmailTemplateManager.prototype.createCancellationConfirmationTextTemplate = function() {
    return this.createBookingConfirmationTextTemplate().replace(/Booking Confirmed!/g, 'Cancellation Confirmed');
};

// Create singleton instance
const emailTemplateManager = new EmailTemplateManager();

module.exports = {
    EmailTemplateManager,
    emailTemplateManager
};
