/**
 * HRMS AI Integrated System - Data Export Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive data export functionality for reports, analytics, and data migration
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');

/**
 * Data Exporter Class
 */
class DataExporter {
    constructor() {
        this.exportFormats = new Set(['csv', 'json', 'xml', 'excel', 'pdf']);
        this.exportHistory = new Map();
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.tempDir = path.join(process.cwd(), 'temp', 'exports');
        this.ensureTempDir();
    }

    /**
     * Ensure temp directory exists
     */
    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create temp directory:', error.message);
        }
    }

    /**
     * Export data to specified format
     * @param {Array|Object} data - Data to export
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportData(data, options = {}) {
        const {
            format = 'csv',
            filename = `export_${Date.now()}`,
            fields = null,
            title = 'Data Export',
            metadata = {},
            compression = false
        } = options;

        // Validate format
        if (!this.exportFormats.has(format.toLowerCase())) {
            throw new Error(`Unsupported export format: ${format}`);
        }

        // Validate data
        if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new Error('No data provided for export');
        }

        const exportId = this.generateExportId();
        const timestamp = new Date();

        try {
            // Prepare data
            const processedData = this.preprocessData(data, fields);
            
            // Generate file content based on format
            let fileContent;
            let mimeType;
            let fileExtension;

            switch (format.toLowerCase()) {
                case 'csv':
                    fileContent = await this.generateCSV(processedData, options);
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                
                case 'json':
                    fileContent = await this.generateJSON(processedData, options);
                    mimeType = 'application/json';
                    fileExtension = 'json';
                    break;
                
                case 'xml':
                    fileContent = await this.generateXML(processedData, options);
                    mimeType = 'application/xml';
                    fileExtension = 'xml';
                    break;
                
                case 'excel':
                    fileContent = await this.generateExcel(processedData, options);
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    fileExtension = 'xlsx';
                    break;
                
                case 'pdf':
                    fileContent = await this.generatePDF(processedData, options);
                    mimeType = 'application/pdf';
                    fileExtension = 'pdf';
                    break;
                
                default:
                    throw new Error(`Format ${format} not implemented`);
            }

            // Check file size
            const fileSize = Buffer.byteLength(fileContent);
            if (fileSize > this.maxFileSize) {
                throw new Error(`Export file size (${this.formatFileSize(fileSize)}) exceeds maximum allowed size`);
            }

            // Save file
            const fullFilename = `${filename}.${fileExtension}`;
            const filePath = path.join(this.tempDir, fullFilename);
            
            if (compression && format !== 'pdf') {
                // TODO: Implement compression
                console.log('Compression requested but not implemented');
            }

            await fs.writeFile(filePath, fileContent);

            // Record export
            const exportRecord = {
                id: exportId,
                filename: fullFilename,
                filePath,
                format,
                size: fileSize,
                recordCount: Array.isArray(processedData) ? processedData.length : 1,
                timestamp,
                metadata: {
                    title,
                    fields: fields || Object.keys(processedData[0] || {}),
                    ...metadata
                },
                status: 'completed'
            };

            this.exportHistory.set(exportId, exportRecord);

            return {
                success: true,
                exportId,
                filename: fullFilename,
                filePath,
                size: fileSize,
                formattedSize: this.formatFileSize(fileSize),
                recordCount: exportRecord.recordCount,
                downloadUrl: `/api/exports/download/${exportId}`,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };

        } catch (error) {
            // Record failed export
            this.exportHistory.set(exportId, {
                id: exportId,
                status: 'failed',
                error: error.message,
                timestamp
            });

            throw error;
        }
    }

    /**
     * Preprocess data for export
     * @param {Array|Object} data - Raw data
     * @param {Array} fields - Fields to include
     * @returns {Array} Processed data
     */
    preprocessData(data, fields = null) {
        let processedData = Array.isArray(data) ? data : [data];

        // Filter fields if specified
        if (fields && fields.length > 0) {
            processedData = processedData.map(item => {
                const filteredItem = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        // Clean data
        processedData = processedData.map(item => {
            const cleanedItem = {};
            Object.keys(item).forEach(key => {
                let value = item[key];
                
                // Handle dates
                if (value instanceof Date) {
                    value = value.toISOString();
                }
                
                // Handle objects (stringify)
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                
                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }
                
                cleanedItem[key] = value;
            });
            return cleanedItem;
        });

        return processedData;
    }

    /**
     * Generate CSV content
     * @param {Array} data - Data array
     * @param {Object} options - CSV options
     * @returns {string} CSV content
     */
    async generateCSV(data, options = {}) {
        const {
            delimiter = ',',
            includeHeaders = true,
            quote = '"'
        } = options;

        try {
            const parser = new Parser({
                delimiter,
                header: includeHeaders,
                quote
            });
            
            return parser.parse(data);
        } catch (error) {
            throw new Error(`CSV generation failed: ${error.message}`);
        }
    }

    /**
     * Generate JSON content
     * @param {Array} data - Data array
     * @param {Object} options - JSON options
     * @returns {string} JSON content
     */
    async generateJSON(data, options = {}) {
        const {
            pretty = true,
            includeMetadata = true
        } = options;

        const jsonData = {
            ...(includeMetadata && {
                metadata: {
                    exportDate: new Date().toISOString(),
                    recordCount: data.length,
                    format: 'json'
                }
            }),
            data
        };

        return JSON.stringify(jsonData, null, pretty ? 2 : 0);
    }

    /**
     * Generate XML content
     * @param {Array} data - Data array
     * @param {Object} options - XML options
     * @returns {string} XML content
     */
    async generateXML(data, options = {}) {
        const {
            rootElement = 'export',
            itemElement = 'record'
        } = options;

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<${rootElement}>\n`;
        xml += `  <metadata>\n`;
        xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
        xml += `    <recordCount>${data.length}</recordCount>\n`;
        xml += `  </metadata>\n`;
        xml += `  <data>\n`;

        data.forEach(item => {
            xml += `    <${itemElement}>\n`;
            Object.keys(item).forEach(key => {
                const value = this.escapeXML(String(item[key]));
                xml += `      <${key}>${value}</${key}>\n`;
            });
            xml += `    </${itemElement}>\n`;
        });

        xml += `  </data>\n`;
        xml += `</${rootElement}>`;

        return xml;
    }

    /**
     * Generate Excel content (placeholder)
     * @param {Array} data - Data array
     * @param {Object} options - Excel options
     * @returns {Buffer} Excel content
     */
    async generateExcel(data, options = {}) {
        // This is a placeholder - in real implementation, you would use a library like 'exceljs'
        throw new Error('Excel export not implemented. Please use CSV format instead.');
    }

    /**
     * Generate PDF content (placeholder)
     * @param {Array} data - Data array
     * @param {Object} options - PDF options
     * @returns {Buffer} PDF content
     */
    async generatePDF(data, options = {}) {
        // This is a placeholder - in real implementation, you would use a library like 'pdfkit' or 'puppeteer'
        throw new Error('PDF export not implemented. Please use CSV or JSON format instead.');
    }

    /**
     * Get export by ID
     * @param {string} exportId - Export ID
     * @returns {Object|null} Export record
     */
    getExport(exportId) {
        return this.exportHistory.get(exportId) || null;
    }

    /**
     * Get export file content
     * @param {string} exportId - Export ID
     * @returns {Promise<Buffer>} File content
     */
    async getExportFile(exportId) {
        const exportRecord = this.getExport(exportId);
        if (!exportRecord || exportRecord.status !== 'completed') {
            throw new Error('Export not found or not completed');
        }

        try {
            return await fs.readFile(exportRecord.filePath);
        } catch (error) {
            throw new Error(`Failed to read export file: ${error.message}`);
        }
    }

    /**
     * Delete export file
     * @param {string} exportId - Export ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteExport(exportId) {
        const exportRecord = this.getExport(exportId);
        if (!exportRecord) {
            return false;
        }

        try {
            if (exportRecord.filePath) {
                await fs.unlink(exportRecord.filePath);
            }
            this.exportHistory.delete(exportId);
            return true;
        } catch (error) {
            console.error(`Failed to delete export ${exportId}:`, error.message);
            return false;
        }
    }

    /**
     * Get export history
     * @param {Object} options - Query options
     * @returns {Array} Export history
     */
    getExportHistory(options = {}) {
        const { limit = 50, status = null, format = null } = options;
        
        let exports = Array.from(this.exportHistory.values());
        
        if (status) {
            exports = exports.filter(exp => exp.status === status);
        }
        
        if (format) {
            exports = exports.filter(exp => exp.format === format);
        }
        
        return exports
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Clean up old exports
     * @param {number} maxAge - Maximum age in hours
     * @returns {Promise<number>} Number of cleaned exports
     */
    async cleanupOldExports(maxAge = 24) {
        const cutoffTime = Date.now() - (maxAge * 60 * 60 * 1000);
        let cleanedCount = 0;

        for (const [exportId, exportRecord] of this.exportHistory.entries()) {
            if (new Date(exportRecord.timestamp).getTime() < cutoffTime) {
                await this.deleteExport(exportId);
                cleanedCount++;
            }
        }

        console.log(`🧹 Cleaned up ${cleanedCount} old exports`);
        return cleanedCount;
    }

    /**
     * Get export statistics
     * @returns {Object} Export statistics
     */
    getStatistics() {
        const exports = Array.from(this.exportHistory.values());
        
        const stats = {
            total: exports.length,
            byStatus: {},
            byFormat: {},
            totalSize: 0,
            averageSize: 0
        };

        exports.forEach(exp => {
            // Count by status
            stats.byStatus[exp.status] = (stats.byStatus[exp.status] || 0) + 1;
            
            // Count by format
            if (exp.format) {
                stats.byFormat[exp.format] = (stats.byFormat[exp.format] || 0) + 1;
            }
            
            // Calculate total size
            if (exp.size) {
                stats.totalSize += exp.size;
            }
        });

        stats.averageSize = exports.length > 0 ? stats.totalSize / exports.length : 0;
        stats.formattedTotalSize = this.formatFileSize(stats.totalSize);
        stats.formattedAverageSize = this.formatFileSize(stats.averageSize);

        return stats;
    }

    /**
     * Export booking data with specific formatting
     * @param {Array} bookings - Booking data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportBookings(bookings, options = {}) {
        const processedBookings = bookings.map(booking => ({
            'Booking ID': booking.id || booking._id,
            'Guest Name': booking.guestName,
            'Email': booking.email,
            'Phone': booking.phone,
            'Room Type': booking.roomType,
            'Check-in Date': booking.checkInDate,
            'Check-out Date': booking.checkOutDate,
            'Guests': booking.guestCount,
            'Total Amount': booking.totalAmount,
            'Status': booking.status,
            'Created Date': booking.createdAt,
            'Special Requests': booking.specialRequests || ''
        }));

        return await this.exportData(processedBookings, {
            ...options,
            title: 'Booking Report',
            filename: options.filename || `bookings_${new Date().toISOString().split('T')[0]}`
        });
    }

    /**
     * Export reservation data with specific formatting
     * @param {Array} reservations - Reservation data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportReservations(reservations, options = {}) {
        const processedReservations = reservations.map(reservation => ({
            'Reservation ID': reservation.id || reservation._id,
            'Customer Name': reservation.customerName,
            'Email': reservation.email,
            'Phone': reservation.phone,
            'Date': reservation.date,
            'Time': reservation.time,
            'Party Size': reservation.partySize,
            'Table Number': reservation.tableNumber,
            'Status': reservation.status,
            'Created Date': reservation.createdAt,
            'Special Requests': reservation.specialRequests || ''
        }));

        return await this.exportData(processedReservations, {
            ...options,
            title: 'Reservation Report',
            filename: options.filename || `reservations_${new Date().toISOString().split('T')[0]}`
        });
    }

    /**
     * Escape XML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Format file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate unique export ID
     * @returns {string} Export ID
     */
    generateExportId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create singleton instance
const dataExporter = new DataExporter();

module.exports = {
    DataExporter,
    dataExporter
};
