/**
 * Capacitor Mobile App Initialization
 * Configures native plugins and mobile-specific behaviors
 */

import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export async function initializeCapacitor() {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in web mode');
    return;
  }

  console.log('Initializing Capacitor for native platform');

  try {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#d4a710' }); // Brand gold color
    
    // Hide splash screen after app is ready
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 1000);

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Prevent overscroll/bounce effect
    document.body.style.overscrollBehavior = 'none';
    
    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
}

// Add iOS safe area CSS variables
export function addSafeAreaSupport() {
  if (Capacitor.getPlatform() === 'ios') {
    // Add CSS custom properties for safe areas
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
      }
      
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    `;
    document.head.appendChild(style);
  }
}

// Disable pull-to-refresh on mobile
export function disablePullToRefresh() {
  document.body.style.overscrollBehaviorY = 'none';
  
  let startY = 0;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Prevent pull-to-refresh if at top of page and pulling down
    if (window.scrollY === 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });
}
