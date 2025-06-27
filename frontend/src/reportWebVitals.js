/**
 * Web Vitals Performance Monitoring for HRMS Frontend
 * Tracks Core Web Vitals metrics for performance optimization
 *
 * @description Performance monitoring utility using web-vitals library
 * @version 1.0.0
 */

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
