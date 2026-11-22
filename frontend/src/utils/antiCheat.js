import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Log event to backend
const logEvent = async (eventType, details = '') => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await axios.post(
        `${API_URL}/students/log-event`,
        { eventType, details },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

// Detect tab switch
export const setupTabSwitchDetection = () => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      logEvent('tab_switch', 'User switched tab or minimized window');
      alert('⚠️ Warning: Tab switching is being monitored. This event has been logged.');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Detect window blur
export const setupWindowBlurDetection = () => {
  const handleBlur = () => {
    logEvent('window_blur', 'User left the window');
    alert('⚠️ Warning: Leaving the quiz window is being monitored. This event has been logged.');
  };

  window.addEventListener('blur', handleBlur);
  
  return () => {
    window.removeEventListener('blur', handleBlur);
  };
};

// Block keyboard shortcuts
export const setupKeyboardShortcutBlocking = () => {
  const handleKeyDown = (e) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
      (e.ctrlKey && (e.key === 'v' || e.key === 'V')) ||
      (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
      (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      logEvent('shortcut_blocked', `Blocked shortcut: ${e.key} ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}`);
      return false;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

// Block right-click context menu
export const setupContextMenuBlocking = () => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  document.addEventListener('contextmenu', handleContextMenu);
  
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
  };
};

// Block copy in code editor
export const handleCopy = (e) => {
  e.preventDefault();
  logEvent('copy_attempt', 'User attempted to copy text');
  alert('⚠️ Copying is disabled during the quiz. This event has been logged.');
  return false;
};

// Block paste in code editor
export const handlePaste = (e) => {
  e.preventDefault();
  logEvent('paste_attempt', 'User attempted to paste text');
  alert('⚠️ Pasting is disabled during the quiz. This event has been logged.');
  return false;
};

// Block cut in code editor
export const handleCut = (e) => {
  e.preventDefault();
  logEvent('copy_attempt', 'User attempted to cut text');
  alert('⚠️ Cutting is disabled during the quiz. This event has been logged.');
  return false;
};

// Setup all anti-cheating measures
export const setupAntiCheat = () => {
  const cleanupFunctions = [
    setupTabSwitchDetection(),
    setupWindowBlurDetection(),
    setupKeyboardShortcutBlocking(),
    setupContextMenuBlocking()
  ];

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup && cleanup());
  };
};
