import { useState, useEffect } from 'react';

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Function to check if the device is mobile
    const checkIsMobile = () => {
      const mobileWidth = 768; // Common breakpoint for mobile devices
      setIsMobile(window.innerWidth < mobileWidth);
    };

    // Check on initial load
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default useIsMobile;
