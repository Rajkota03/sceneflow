
import { useEffect } from 'react';

/**
 * A hook that prevents body scrolling when active
 * @param isActive Whether to lock the body scroll
 */
export const useLockBodyScroll = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;
    
    // Save the original body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Lock the scroll by setting overflow to hidden
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore original scroll behavior
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isActive]); // Only re-run when isActive changes
};
