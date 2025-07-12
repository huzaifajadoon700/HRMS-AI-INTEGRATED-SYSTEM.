// Performance monitoring helpers for tracking and measuring. No business logic is present in this file.

/**
 * Simple performance timer class
 */
class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.endTime = null;
    this.marks = new Map();
  }

  /**
   * Start the timer
   */
  start() {
    this.startTime = process.hrtime.bigint();
    return this;
  }

  /**
   * Add a performance mark
   * @param {string} markName - Name of the mark
   */
  mark(markName) {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    this.marks.set(markName, process.hrtime.bigint());
    return this;
  }

  /**
   * End the timer and return duration
   * @returns {Object} Performance results
   */
  end() {
    this.endTime = process.hrtime.bigint();
    
    if (!this.startTime) {
      throw new Error('Timer not started');
    }

    const totalDuration = Number(this.endTime - this.startTime) / 1000000; // Convert to milliseconds
    
    const marks = {};
    for (const [markName, markTime] of this.marks) {
      marks[markName] = Number(markTime - this.startTime) / 1000000;
    }

    return {
      name: this.name,
      duration: totalDuration,
      marks,
      startTime: this.startTime,
      endTime: this.endTime
    };
  }
}

/**
 * Create a new performance timer
 * @param {string} name - Timer name
 * @returns {PerformanceTimer} Timer instance
 */
const createTimer = (name) => {
  return new PerformanceTimer(name);
};

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Measurement name
 * @returns {Promise<Object>} Result with timing information
 */
const measureAsync = async (fn, name = 'async-operation') => {
  const timer = createTimer(name).start();
  
  try {
    const result = await fn();
    const timing = timer.end();
    
    return {
      result,
      timing,
      success: true
    };
  } catch (error) {
    const timing = timer.end();
    
    return {
      error,
      timing,
      success: false
    };
  }
};

/**
 * Measure execution time of a synchronous function
 * @param {Function} fn - Function to measure
 * @param {string} name - Measurement name
 * @returns {Object} Result with timing information
 */
const measureSync = (fn, name = 'sync-operation') => {
  const timer = createTimer(name).start();
  
  try {
    const result = fn();
    const timing = timer.end();
    
    return {
      result,
      timing,
      success: true
    };
  } catch (error) {
    const timing = timer.end();
    
    return {
      error,
      timing,
      success: false
    };
  }
};

/**
 * Memory usage tracker
 */
class MemoryTracker {
  constructor() {
    this.snapshots = [];
  }

  /**
   * Take a memory snapshot
   * @param {string} label - Snapshot label
   */
  snapshot(label = 'snapshot') {
    const memUsage = process.memoryUsage();
    const snapshot = {
      label,
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    };
    
    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get memory usage difference between two snapshots
   * @param {string} startLabel - Start snapshot label
   * @param {string} endLabel - End snapshot label
   * @returns {Object} Memory difference
   */
  getDifference(startLabel, endLabel) {
    const start = this.snapshots.find(s => s.label === startLabel);
    const end = this.snapshots.find(s => s.label === endLabel);
    
    if (!start || !end) {
      throw new Error('Snapshot not found');
    }
    
    return {
      rss: end.rss - start.rss,
      heapTotal: end.heapTotal - start.heapTotal,
      heapUsed: end.heapUsed - start.heapUsed,
      external: end.external - start.external,
      arrayBuffers: end.arrayBuffers - start.arrayBuffers,
      duration: end.timestamp - start.timestamp
    };
  }

  /**
   * Get all snapshots
   * @returns {Array} All memory snapshots
   */
  getSnapshots() {
    return this.snapshots;
  }

  /**
   * Clear all snapshots
   */
  clear() {
    this.snapshots = [];
  }
}

/**
 * Create a new memory tracker
 * @returns {MemoryTracker} Memory tracker instance
 */
const createMemoryTracker = () => {
  return new MemoryTracker();
};

/**
 * Get current system performance metrics
 * @returns {Object} System metrics
 */
const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      arrayBuffers: `${(memUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
};

/**
 * Express middleware for request timing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requestTimer = (req, res, next) => {
  const timer = createTimer(`${req.method} ${req.path}`).start();
  
  // Override res.end to capture timing
  const originalEnd = res.end;
  res.end = function(...args) {
    const timing = timer.end();
    
    // Add timing header
    res.set('X-Response-Time', `${timing.duration.toFixed(2)}ms`);
    
    // Log slow requests (> 1000ms)
    if (timing.duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${timing.duration.toFixed(2)}ms`);
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Database query performance wrapper
 * @param {Function} queryFn - Database query function
 * @param {string} queryName - Query identifier
 * @returns {Promise} Query result with timing
 */
const measureDatabaseQuery = async (queryFn, queryName) => {
  return measureAsync(queryFn, `db-query-${queryName}`);
};

module.exports = {
  PerformanceTimer,
  createTimer,
  measureAsync,
  measureSync,
  MemoryTracker,
  createMemoryTracker,
  getSystemMetrics,
  requestTimer,
  measureDatabaseQuery
};
