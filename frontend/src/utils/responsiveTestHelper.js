// Responsive Testing Helper Utility
// Add this to browser console for quick testing

window.ResponsiveTestHelper = {
  // Test current viewport
  getCurrentViewport: () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let device = 'Unknown';
    
    if (width <= 480) device = 'Mobile Small';
    else if (width <= 768) device = 'Mobile Large';
    else if (width <= 1024) device = 'Tablet';
    else if (width <= 1366) device = 'Laptop';
    else device = 'Desktop';
    
    return {
      width,
      height,
      device,
      ratio: (width / height).toFixed(2)
    };
  },

  // Test responsive breakpoints
  testBreakpoints: () => {
    const breakpoints = [320, 375, 480, 768, 1024, 1366, 1920];
    console.log('🔍 Testing Responsive Breakpoints:');
    
    breakpoints.forEach(bp => {
      console.log(`📱 ${bp}px: ${bp <= 480 ? 'Mobile' : bp <= 768 ? 'Mobile Large' : bp <= 1024 ? 'Tablet' : 'Desktop'}`);
    });
  },

  // Check for horizontal scroll
  checkHorizontalScroll: () => {
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    console.log(`📏 Horizontal Scroll: ${hasHorizontalScroll ? '❌ DETECTED' : '✅ NONE'}`);
    
    if (hasHorizontalScroll) {
      console.log(`📐 Body Width: ${document.body.scrollWidth}px`);
      console.log(`📐 Viewport Width: ${window.innerWidth}px`);
      console.log(`📐 Overflow: ${document.body.scrollWidth - window.innerWidth}px`);
    }
    
    return hasHorizontalScroll;
  },

  // Check touch target sizes
  checkTouchTargets: () => {
    const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    const smallTargets = [];
    
    buttons.forEach((btn, index) => {
      const rect = btn.getBoundingClientRect();
      const minSize = 44; // Minimum touch target size
      
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets.push({
          element: btn,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          text: btn.textContent?.trim().substring(0, 20) || 'No text'
        });
      }
    });
    
    console.log(`👆 Touch Targets Check: ${smallTargets.length === 0 ? '✅ ALL GOOD' : `❌ ${smallTargets.length} TOO SMALL`}`);
    
    if (smallTargets.length > 0) {
      console.table(smallTargets);
    }
    
    return smallTargets;
  },

  // Check text readability
  checkTextReadability: () => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const smallText = [];
    
    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      
      if (fontSize < 14 && el.textContent?.trim()) {
        smallText.push({
          element: el,
          fontSize: fontSize + 'px',
          text: el.textContent.trim().substring(0, 30) + '...'
        });
      }
    });
    
    console.log(`📖 Text Readability: ${smallText.length === 0 ? '✅ ALL READABLE' : `⚠️ ${smallText.length} TOO SMALL`}`);
    
    if (smallText.length > 0) {
      console.table(smallText.slice(0, 10)); // Show first 10
    }
    
    return smallText;
  },

  // Check color contrast
  checkColorContrast: () => {
    const elements = document.querySelectorAll('*');
    const contrastIssues = [];
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      // Simple check for white background and black text
      if (bgColor === 'rgb(255, 255, 255)' && textColor !== 'rgb(0, 0, 0)' && textColor !== 'rgb(17, 24, 39)') {
        if (el.textContent?.trim()) {
          contrastIssues.push({
            element: el,
            backgroundColor: bgColor,
            textColor: textColor,
            text: el.textContent.trim().substring(0, 20)
          });
        }
      }
    });
    
    console.log(`🎨 Color Contrast: ${contrastIssues.length === 0 ? '✅ CONSISTENT' : `⚠️ ${contrastIssues.length} ISSUES`}`);
    
    return contrastIssues;
  },

  // Run all tests
  runAllTests: () => {
    console.clear();
    console.log('🧪 COMPREHENSIVE RESPONSIVE TESTING');
    console.log('=====================================');
    
    const viewport = ResponsiveTestHelper.getCurrentViewport();
    console.log(`📱 Current Viewport: ${viewport.width}x${viewport.height} (${viewport.device})`);
    console.log('');
    
    ResponsiveTestHelper.testBreakpoints();
    console.log('');
    
    ResponsiveTestHelper.checkHorizontalScroll();
    console.log('');
    
    ResponsiveTestHelper.checkTouchTargets();
    console.log('');
    
    ResponsiveTestHelper.checkTextReadability();
    console.log('');
    
    ResponsiveTestHelper.checkColorContrast();
    console.log('');
    
    console.log('✅ Testing Complete! Check results above.');
  },

  // Quick mobile test
  quickMobileTest: () => {
    if (window.innerWidth > 768) {
      console.log('⚠️ Switch to mobile view first (F12 → Device Toggle)');
      return;
    }
    
    console.log('📱 QUICK MOBILE TEST');
    console.log('===================');
    
    const hasScroll = ResponsiveTestHelper.checkHorizontalScroll();
    const smallTargets = ResponsiveTestHelper.checkTouchTargets();
    
    if (!hasScroll && smallTargets.length === 0) {
      console.log('🎉 Mobile view looks good!');
    } else {
      console.log('⚠️ Issues found - check details above');
    }
  }
};

// Auto-run basic test when loaded
console.log('🔧 Responsive Test Helper Loaded!');
console.log('📋 Available commands:');
console.log('  ResponsiveTestHelper.runAllTests()');
console.log('  ResponsiveTestHelper.quickMobileTest()');
console.log('  ResponsiveTestHelper.getCurrentViewport()');
