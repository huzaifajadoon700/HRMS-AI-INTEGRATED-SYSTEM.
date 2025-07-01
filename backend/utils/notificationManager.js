/**
 * HRMS AI Integrated System - Notification Management Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive notification system for real-time alerts, emails, and push notifications
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const EventEmitter = require('events');

/**
 * Notification Manager Class
 */
class NotificationManager extends EventEmitter {
    constructor() {
        super();
        this.notifications = new Map();
        this.subscribers = new Map();
        this.channels = new Set(['email', 'push', 'sms', 'in-app', 'webhook']);
        this.templates = new Map();
        this.queue = [];
        this.processing = false;
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
        
        this.setupDefaultTemplates();
        this.startQueueProcessor();
    }

    /**
     * Setup default notification templates
     */
    setupDefaultTemplates() {
        this.templates.set('booking-confirmed', {
            title: 'Booking Confirmed',
            message: 'Your booking {{bookingId}} has been confirmed for {{date}}',
            channels: ['email', 'in-app', 'push'],
            priority: 'high',
            category: 'booking'
        });

        this.templates.set('payment-received', {
            title: 'Payment Received',
            message: 'Payment of {{amount}} received for booking {{bookingId}}',
            channels: ['email', 'in-app'],
            priority: 'medium',
            category: 'payment'
        });

        this.templates.set('booking-reminder', {
            title: 'Booking Reminder',
            message: 'Your stay at {{businessName}} starts tomorrow',
            channels: ['email', 'push', 'sms'],
            priority: 'high',
            category: 'reminder'
        });

        this.templates.set('reservation-confirmed', {
            title: 'Table Reserved',
            message: 'Table reservation confirmed for {{date}} at {{time}}',
            channels: ['email', 'in-app', 'push'],
            priority: 'high',
            category: 'reservation'
        });

        this.templates.set('order-ready', {
            title: 'Order Ready',
            message: 'Your order {{orderId}} is ready for pickup',
            channels: ['push', 'sms', 'in-app'],
            priority: 'urgent',
            category: 'order'
        });

        this.templates.set('system-maintenance', {
            title: 'System Maintenance',
            message: 'System will be under maintenance from {{startTime}} to {{endTime}}',
            channels: ['email', 'in-app'],
            priority: 'low',
            category: 'system'
        });

        this.templates.set('security-alert', {
            title: 'Security Alert',
            message: 'Unusual login activity detected on your account',
            channels: ['email', 'push', 'sms'],
            priority: 'urgent',
            category: 'security'
        });
    }

    /**
     * Subscribe user to notification channels
     * @param {string} userId - User ID
     * @param {Array} channels - Array of channels to subscribe to
     * @param {Object} preferences - User notification preferences
     */
    subscribe(userId, channels = [], preferences = {}) {
        if (!this.subscribers.has(userId)) {
            this.subscribers.set(userId, {
                channels: new Set(),
                preferences: {},
                createdAt: new Date(),
                active: true
            });
        }

        const subscriber = this.subscribers.get(userId);
        channels.forEach(channel => {
            if (this.channels.has(channel)) {
                subscriber.channels.add(channel);
            }
        });

        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        subscriber.updatedAt = new Date();

        this.emit('user-subscribed', { userId, channels, preferences });
    }

    /**
     * Unsubscribe user from notification channels
     * @param {string} userId - User ID
     * @param {Array} channels - Array of channels to unsubscribe from
     */
    unsubscribe(userId, channels = []) {
        if (!this.subscribers.has(userId)) return;

        const subscriber = this.subscribers.get(userId);
        channels.forEach(channel => subscriber.channels.delete(channel));
        subscriber.updatedAt = new Date();

        this.emit('user-unsubscribed', { userId, channels });
    }

    /**
     * Create and send notification
     * @param {Object} notification - Notification object
     * @returns {Promise<Object>} Notification result
     */
    async send(notification) {
        const notificationId = this.generateId();
        const timestamp = new Date();

        const notificationData = {
            id: notificationId,
            ...notification,
            timestamp,
            status: 'pending',
            attempts: 0,
            results: {}
        };

        // Validate notification
        const validation = this.validateNotification(notificationData);
        if (!validation.isValid) {
            throw new Error(`Invalid notification: ${validation.errors.join(', ')}`);
        }

        // Store notification
        this.notifications.set(notificationId, notificationData);

        // Add to queue for processing
        this.queue.push(notificationId);

        // Emit event
        this.emit('notification-created', notificationData);

        // Start processing if not already running
        if (!this.processing) {
            this.processQueue();
        }

        return { id: notificationId, status: 'queued' };
    }

    /**
     * Send notification using template
     * @param {string} templateName - Template name
     * @param {Object} data - Template data
     * @param {Array} recipients - Array of recipient user IDs
     * @returns {Promise<Object>} Notification result
     */
    async sendFromTemplate(templateName, data = {}, recipients = []) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        const notification = {
            template: templateName,
            title: this.interpolate(template.title, data),
            message: this.interpolate(template.message, data),
            channels: template.channels,
            priority: template.priority,
            category: template.category,
            recipients,
            data
        };

        return await this.send(notification);
    }

    /**
     * Validate notification object
     * @param {Object} notification - Notification to validate
     * @returns {Object} Validation result
     */
    validateNotification(notification) {
        const errors = [];

        if (!notification.title || typeof notification.title !== 'string') {
            errors.push('Title is required and must be a string');
        }

        if (!notification.message || typeof notification.message !== 'string') {
            errors.push('Message is required and must be a string');
        }

        if (!notification.recipients || !Array.isArray(notification.recipients) || notification.recipients.length === 0) {
            errors.push('Recipients array is required and must not be empty');
        }

        if (!notification.channels || !Array.isArray(notification.channels) || notification.channels.length === 0) {
            errors.push('Channels array is required and must not be empty');
        }

        // Validate channels
        if (notification.channels) {
            const invalidChannels = notification.channels.filter(channel => !this.channels.has(channel));
            if (invalidChannels.length > 0) {
                errors.push(`Invalid channels: ${invalidChannels.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Process notification queue
     */
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const notificationId = this.queue.shift();
            const notification = this.notifications.get(notificationId);

            if (!notification) continue;

            try {
                await this.processNotification(notification);
            } catch (error) {
                console.error(`Failed to process notification ${notificationId}:`, error.message);
                
                // Retry logic
                if (notification.attempts < this.retryAttempts) {
                    notification.attempts++;
                    notification.status = 'retrying';
                    
                    // Add back to queue with delay
                    setTimeout(() => {
                        this.queue.push(notificationId);
                    }, this.retryDelay);
                } else {
                    notification.status = 'failed';
                    notification.error = error.message;
                    this.emit('notification-failed', notification);
                }
            }
        }

        this.processing = false;
    }

    /**
     * Process individual notification
     * @param {Object} notification - Notification to process
     */
    async processNotification(notification) {
        notification.status = 'processing';
        notification.processedAt = new Date();

        const results = {};

        // Process each recipient
        for (const recipientId of notification.recipients) {
            const subscriber = this.subscribers.get(recipientId);
            
            if (!subscriber || !subscriber.active) {
                results[recipientId] = { status: 'skipped', reason: 'User not subscribed or inactive' };
                continue;
            }

            // Check user preferences
            if (!this.shouldSendToUser(notification, subscriber)) {
                results[recipientId] = { status: 'skipped', reason: 'User preferences' };
                continue;
            }

            // Send through each channel
            const channelResults = {};
            for (const channel of notification.channels) {
                if (subscriber.channels.has(channel)) {
                    try {
                        const result = await this.sendThroughChannel(notification, recipientId, channel);
                        channelResults[channel] = result;
                    } catch (error) {
                        channelResults[channel] = { status: 'failed', error: error.message };
                    }
                } else {
                    channelResults[channel] = { status: 'skipped', reason: 'Channel not subscribed' };
                }
            }

            results[recipientId] = channelResults;
        }

        notification.results = results;
        notification.status = 'completed';
        notification.completedAt = new Date();

        this.emit('notification-completed', notification);
    }

    /**
     * Check if notification should be sent to user based on preferences
     * @param {Object} notification - Notification object
     * @param {Object} subscriber - Subscriber object
     * @returns {boolean} Should send notification
     */
    shouldSendToUser(notification, subscriber) {
        const preferences = subscriber.preferences;

        // Check if user has disabled this category
        if (preferences.categories && preferences.categories[notification.category] === false) {
            return false;
        }

        // Check priority preferences
        if (preferences.minPriority) {
            const priorityLevels = { low: 1, medium: 2, high: 3, urgent: 4 };
            const notificationLevel = priorityLevels[notification.priority] || 1;
            const minLevel = priorityLevels[preferences.minPriority] || 1;
            
            if (notificationLevel < minLevel) {
                return false;
            }
        }

        // Check quiet hours
        if (preferences.quietHours) {
            const now = new Date();
            const currentHour = now.getHours();
            const { start, end } = preferences.quietHours;
            
            if (start <= end) {
                if (currentHour >= start && currentHour < end) {
                    return notification.priority === 'urgent';
                }
            } else {
                if (currentHour >= start || currentHour < end) {
                    return notification.priority === 'urgent';
                }
            }
        }

        return true;
    }

    /**
     * Send notification through specific channel
     * @param {Object} notification - Notification object
     * @param {string} recipientId - Recipient user ID
     * @param {string} channel - Channel name
     * @returns {Promise<Object>} Send result
     */
    async sendThroughChannel(notification, recipientId, channel) {
        // This is a placeholder - in real implementation, you would integrate with:
        // - Email service (SendGrid, AWS SES, etc.)
        // - Push notification service (Firebase, OneSignal, etc.)
        // - SMS service (Twilio, AWS SNS, etc.)
        // - WebSocket for in-app notifications
        // - Webhook endpoints

        const channelHandlers = {
            email: this.sendEmail.bind(this),
            push: this.sendPushNotification.bind(this),
            sms: this.sendSMS.bind(this),
            'in-app': this.sendInAppNotification.bind(this),
            webhook: this.sendWebhook.bind(this)
        };

        const handler = channelHandlers[channel];
        if (!handler) {
            throw new Error(`No handler for channel: ${channel}`);
        }

        return await handler(notification, recipientId);
    }

    /**
     * Send email notification (placeholder)
     */
    async sendEmail(notification, recipientId) {
        // Placeholder for email sending logic
        console.log(`📧 Sending email to ${recipientId}: ${notification.title}`);
        return { status: 'sent', channel: 'email', timestamp: new Date() };
    }

    /**
     * Send push notification (placeholder)
     */
    async sendPushNotification(notification, recipientId) {
        // Placeholder for push notification logic
        console.log(`📱 Sending push notification to ${recipientId}: ${notification.title}`);
        return { status: 'sent', channel: 'push', timestamp: new Date() };
    }

    /**
     * Send SMS notification (placeholder)
     */
    async sendSMS(notification, recipientId) {
        // Placeholder for SMS sending logic
        console.log(`📱 Sending SMS to ${recipientId}: ${notification.title}`);
        return { status: 'sent', channel: 'sms', timestamp: new Date() };
    }

    /**
     * Send in-app notification (placeholder)
     */
    async sendInAppNotification(notification, recipientId) {
        // Placeholder for in-app notification logic
        console.log(`🔔 Sending in-app notification to ${recipientId}: ${notification.title}`);
        return { status: 'sent', channel: 'in-app', timestamp: new Date() };
    }

    /**
     * Send webhook notification (placeholder)
     */
    async sendWebhook(notification, recipientId) {
        // Placeholder for webhook sending logic
        console.log(`🔗 Sending webhook for ${recipientId}: ${notification.title}`);
        return { status: 'sent', channel: 'webhook', timestamp: new Date() };
    }

    /**
     * Get notification by ID
     * @param {string} notificationId - Notification ID
     * @returns {Object|null} Notification object
     */
    getNotification(notificationId) {
        return this.notifications.get(notificationId) || null;
    }

    /**
     * Get notifications for user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Array} Array of notifications
     */
    getUserNotifications(userId, options = {}) {
        const { limit = 50, offset = 0, category, priority, status } = options;
        
        const userNotifications = Array.from(this.notifications.values())
            .filter(notification => notification.recipients.includes(userId))
            .filter(notification => !category || notification.category === category)
            .filter(notification => !priority || notification.priority === priority)
            .filter(notification => !status || notification.status === status)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(offset, offset + limit);

        return userNotifications;
    }

    /**
     * Mark notification as read for user
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID
     */
    markAsRead(notificationId, userId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        if (!notification.readBy) {
            notification.readBy = new Map();
        }

        notification.readBy.set(userId, new Date());
        this.emit('notification-read', { notificationId, userId });
    }

    /**
     * Get notification statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const notifications = Array.from(this.notifications.values());
        
        const stats = {
            total: notifications.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            byChannel: {},
            subscribers: this.subscribers.size,
            queueSize: this.queue.length
        };

        notifications.forEach(notification => {
            // Count by status
            stats.byStatus[notification.status] = (stats.byStatus[notification.status] || 0) + 1;
            
            // Count by priority
            stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
            
            // Count by category
            stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
            
            // Count by channels
            notification.channels.forEach(channel => {
                stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
            });
        });

        return stats;
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
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start queue processor interval
     */
    startQueueProcessor() {
        setInterval(() => {
            if (!this.processing && this.queue.length > 0) {
                this.processQueue();
            }
        }, 1000); // Check every second
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
     * Get all templates
     * @returns {Array} Array of template names
     */
    getTemplates() {
        return Array.from(this.templates.keys());
    }

    /**
     * Clean up old notifications
     * @param {number} daysOld - Days to keep notifications
     */
    cleanup(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        let cleanedCount = 0;
        for (const [id, notification] of this.notifications.entries()) {
            if (notification.timestamp < cutoffDate) {
                this.notifications.delete(id);
                cleanedCount++;
            }
        }

        console.log(`🧹 Cleaned up ${cleanedCount} old notifications`);
        return cleanedCount;
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

module.exports = {
    NotificationManager,
    notificationManager
};
