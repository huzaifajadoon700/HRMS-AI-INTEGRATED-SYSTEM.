import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * This component automatically scrolls the page to the top whenever the route changes.
 * It's essential for single-page applications where route changes don't trigger
 * the browser's default scroll-to-top behavior.
 *
 * Features:
 * - Scrolls to top on every route change
 * - Cross-browser compatibility
 * - Immediate scroll for better UX
 * - Works with React Router
 * - No visual rendering (utility component)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Multiple scroll methods for maximum browser compatibility

    // Method 1: Standard window.scrollTo (most reliable)
    window.scrollTo(0, 0);

    // Method 2: Document element scroll (fallback)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }

    // Method 3: Body element scroll (additional fallback)
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Method 4: For any scrollable containers
    const scrollableElements = document.querySelectorAll('[data-scroll-container]');
    scrollableElements.forEach(element => {
      element.scrollTop = 0;
    });

  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;
