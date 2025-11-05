import React, { useEffect } from 'react';
import './MobileNotice.css';
import './MobileNoticeGlobal.css';

const MobileNotice: React.FC = () => {
  useEffect(() => {
    // Save current body styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPosition = originalStyle.position;
    const originalHeight = originalStyle.height;
    const originalWidth = originalStyle.width;
    
    // Disable scrolling with multiple techniques
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    
    // Add classes to html and body
    document.documentElement.classList.add('mobile-notice-active');
    document.body.classList.add('mobile-notice-active');
    
    // Prevent touchmove events
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    // Prevent wheel events
    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    // Prevent keyboard scroll
    const preventKeyScroll = (e: KeyboardEvent) => {
      // Space, Page Up, Page Down, End, Home, Left, Up, Right, Down
      if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = '';
      
      // Remove classes
      document.documentElement.classList.remove('mobile-notice-active');
      document.body.classList.remove('mobile-notice-active');
      
      // Remove event listeners
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('keydown', preventKeyScroll);
    };
  }, []);

  return (
    <div className="mobile-notice">
      <div className="mobile-notice-content">
        <h2 style={{ color: '#0066cc', fontWeight: 'bold' }}>Mobile View Coming Soon</h2>
        <p>Please use desktop for the best experience.</p>
        <div style={{ width: '15vw', height: '0.5vh', backgroundColor: '#0066cc', margin: '0 auto' }}></div>
      </div>
    </div>
  );
};

export default MobileNotice;
