import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * BottomDrawer - Mobile-first draggable bottom sheet component
 *
 * Features:
 * - Three snap points: collapsed (25vh), mid (60vh), expanded (95vh)
 * - Smooth drag-to-follow behavior
 * - Velocity-based fast swipe detection
 * - Smart scroll coordination (drawer drag when list at top, scroll otherwise)
 * - Spring animations with natural physics
 * - 60fps performance with GPU acceleration
 * - Keyboard-aware: freezes snap points on input focus to prevent layout shift
 *
 * Based on Fresha's bottom sheet UX pattern
 */

// Snap point configurations (as percentage of viewport height)
const SNAP_POINTS = {
  COLLAPSED: 0.25,
  MID: 0.6,
  EXPANDED: 0.95,
};

// Animation spring configuration
const SPRING_CONFIG = {
  type: "spring",
  damping: 30,
  stiffness: 300,
  mass: 0.8,
};

// Fast swipe detection thresholds
const VELOCITY_THRESHOLD = 0.5; // px/ms
const SWIPE_DISTANCE_MIN = 50; // px

const BottomDrawer = ({
  children,
  initialSnap = "mid",
  onSnapChange,
  showOverlay = false,
  header,
  className = "",
}) => {
  // State management
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs for drag tracking
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const velocityTracker = useRef({ y: 0, timestamp: 0, history: [] });
  const contentRef = useRef(null);
  const animationRef = useRef(null);

  // 🔒 CRITICAL: Freeze viewport height on mount to prevent snap point drift
  // Capture height immediately on component creation (before first render)
  const frozenViewportHeight = useRef(
    window.visualViewport?.height || window.innerHeight
  );

  // Motion values for smooth animations
  const drawerHeight = useMotionValue(0);

  /**
   * Get frozen viewport height (captured on mount, never changes)
   * This prevents snap points from recalculating when keyboard opens
   */
  const getViewportHeight = useCallback(() => {
    // Return the pre-captured frozen height
    return frozenViewportHeight.current;
  }, []);

  /**
   * Calculate pixel height for a snap point using FROZEN viewport height
   */
  function getSnapHeight(snap) {
    const vh = frozenViewportHeight.current || getViewportHeight();
    return vh * SNAP_POINTS[snap.toUpperCase()];
  }

  /**
   * Get snap point name from height
   */
  const getSnapFromHeight = useCallback(
    (height) => {
      const vh = getViewportHeight();
      const collapsedHeight = vh * SNAP_POINTS.COLLAPSED;
      const midHeight = vh * SNAP_POINTS.MID;
      const expandedHeight = vh * SNAP_POINTS.EXPANDED;

      // Find nearest snap point
      const distances = {
        collapsed: Math.abs(height - collapsedHeight),
        mid: Math.abs(height - midHeight),
        expanded: Math.abs(height - expandedHeight),
      };

      return Object.keys(distances).reduce((a, b) =>
        distances[a] < distances[b] ? a : b
      );
    },
    [getViewportHeight]
  );

  /**
   * Animate to a specific snap point
   */
  const animateToSnap = useCallback(
    (snap, velocity = 0) => {
      const targetHeight = getSnapHeight(snap);

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Animate with spring physics
      animationRef.current = animate(drawerHeight, targetHeight, {
        ...SPRING_CONFIG,
        velocity: velocity * -1, // Invert velocity for correct direction
        onComplete: () => {
          setCurrentSnap(snap);
          if (onSnapChange) onSnapChange(snap);
        },
      });
    },
    [drawerHeight, onSnapChange]
  );

  /**
   * Clamp height between collapsed and expanded bounds
   */
  const clampHeight = useCallback(
    (height) => {
      const vh = getViewportHeight();
      const min = vh * SNAP_POINTS.COLLAPSED;
      const max = vh * SNAP_POINTS.EXPANDED;
      return Math.max(min, Math.min(max, height));
    },
    [getViewportHeight]
  );

  /**
   * Calculate velocity from touch history
   */
  const calculateVelocity = useCallback(() => {
    const history = velocityTracker.current.history;
    if (history.length < 2) return 0;

    // Use last few samples for velocity
    const samples = history.slice(-5);
    const first = samples[0];
    const last = samples[samples.length - 1];

    const deltaY = last.y - first.y;
    const deltaTime = last.timestamp - first.timestamp;

    return deltaTime > 0 ? deltaY / deltaTime : 0;
  }, []);

  /**
   * Determine next snap point based on velocity and direction
   */
  const getNextSnapFromVelocity = useCallback(
    (velocity, currentHeight) => {
      const vh = getViewportHeight();
      const snapOrder = ["collapsed", "mid", "expanded"];
      const currentIndex = snapOrder.indexOf(currentSnap);

      // Fast upward swipe (negative velocity)
      if (velocity < -VELOCITY_THRESHOLD) {
        return snapOrder[Math.min(currentIndex + 1, 2)];
      }

      // Fast downward swipe (positive velocity)
      if (velocity > VELOCITY_THRESHOLD) {
        return snapOrder[Math.max(currentIndex - 1, 0)];
      }

      // Slow drag - snap to nearest
      return getSnapFromHeight(currentHeight);
    },
    [currentSnap, getSnapFromHeight, getViewportHeight]
  );

  /**
   * Handle scroll inside drawer content
   */
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setIsAtTop(scrollTop <= 5); // 5px threshold for better UX
  }, []);

  /**
   * Touch Start Handler - Responds from handle area or when at scroll top
   */
  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      dragStartHeight.current = drawerHeight.get();

      // Get handle element (top 60px of drawer)
      const drawerElement = e.currentTarget;
      const drawerRect = drawerElement.getBoundingClientRect();
      const touchY = touch.clientY;
      const relativeY = touchY - drawerRect.top;

      // Allow dragging if:
      // 1. Touch is in handle area (top 60px) OR
      // 2. Content is scrolled to top
      const inHandleArea = relativeY < 60;
      if (!inHandleArea && !isAtTop) return;

      // Initialize velocity tracking
      velocityTracker.current = {
        y: touch.clientY,
        timestamp: Date.now(),
        history: [{ y: touch.clientY, timestamp: Date.now() }],
      };

      setIsDragging(true);

      // Prevent scroll while dragging drawer
      if (contentRef.current) {
        contentRef.current.style.overflowY = "hidden";
      }
    },
    [isAtTop, drawerHeight]
  );

  /**
   * Touch Move Handler
   */
  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaY = dragStartY.current - touch.clientY;
      const newHeight = dragStartHeight.current + deltaY;
      const clampedHeight = clampHeight(newHeight);

      // Update drawer height (follow finger)
      drawerHeight.set(clampedHeight);

      // Track velocity
      const now = Date.now();
      velocityTracker.current.history.push({
        y: touch.clientY,
        timestamp: now,
      });

      // Keep only recent history (last 100ms)
      velocityTracker.current.history = velocityTracker.current.history.filter(
        (point) => now - point.timestamp < 100
      );

      // Prevent default to avoid scroll bounce
      e.preventDefault();
    },
    [isDragging, clampHeight, drawerHeight]
  );

  /**
   * Touch End Handler
   */
  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Re-enable scroll
    if (contentRef.current) {
      contentRef.current.style.overflowY = "auto";
    }

    // Calculate velocity
    const velocity = calculateVelocity();
    const currentHeight = drawerHeight.get();
    const distance = Math.abs(currentHeight - dragStartHeight.current);

    // Determine target snap point
    let targetSnap;

    if (
      Math.abs(velocity) > VELOCITY_THRESHOLD &&
      distance > SWIPE_DISTANCE_MIN
    ) {
      // Fast swipe - skip to next snap
      targetSnap = getNextSnapFromVelocity(velocity, currentHeight);
    } else {
      // Slow drag - snap to nearest
      targetSnap = getSnapFromHeight(currentHeight);
    }

    // Animate to target
    animateToSnap(targetSnap, velocity);
  }, [
    isDragging,
    calculateVelocity,
    drawerHeight,
    getSnapFromHeight,
    getNextSnapFromVelocity,
    animateToSnap,
  ]);

  /**
   * Handle window resize (orientation change, keyboard, etc)
   * 🔒 DISABLED - We use frozen viewport height to prevent snap point drift
   */
  useEffect(() => {
    // Detect keyboard open/close using VisualViewport API
    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return;

      const visualHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const heightDiff = windowHeight - visualHeight;

      // Keyboard is open if visual viewport is significantly smaller
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
        console.log("[BottomDrawer] Keyboard detected, height:", heightDiff);
      } else {
        setKeyboardHeight(0);
      }
    };

    // Attach listeners

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportResize
      );
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleVisualViewportResize
        );
      }
    };
  }, []);

  /**
   * Initialize drawer height on mount using frozen viewport
   */
  useEffect(() => {
    // Set initial frozen viewport height
    frozenViewportHeight.current =
      window.visualViewport?.height || window.innerHeight;

    // Set initial drawer height
    const initialHeight = getSnapHeight(initialSnap);
    drawerHeight.set(initialHeight);

    console.log(
      "[BottomDrawer] Initialized with frozen height:",
      frozenViewportHeight.current
    );
  }, [initialSnap, drawerHeight]);

  /**
   * Expose imperative handle for programmatic control
   */
  useEffect(() => {
    // Allow parent to trigger snap changes
    window.bottomDrawerAPI = {
      snapTo: (snap) => animateToSnap(snap),
      getCurrentSnap: () => currentSnap,
    };

    return () => {
      delete window.bottomDrawerAPI;
    };
  }, [animateToSnap, currentSnap]);

  // Convert height motion value to translateY
  // Drawer is positioned at bottom, so we translate upward
  const translateY = useTransform(
    drawerHeight,
    (height) => `calc(100vh - ${height}px)`
  );

  return (
    <>
      {/* Optional backdrop overlay */}
      {showOverlay && currentSnap === "expanded" && (
        <motion.div
          className="fixed inset-0 bg-black/20 z-[99]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => animateToSnap("mid")}
        />
      )}

      {/* Drawer container */}
      <motion.div
        className={`fixed left-0 right-0 bg-white rounded-t-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[100] touch-none ${className}`}
        style={{
          top: translateY,
          height: "100vh", // Full viewport, positioned from bottom
          willChange: "transform",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`w-10 h-1 rounded-full transition-colors duration-200 ${
              isDragging ? "bg-gray-400" : "bg-gray-300"
            }`}
          />
        </div>

        {/* Optional sticky header */}
        {header && (
          <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
            {header}
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            // EXTRA LARGE bottom padding to ensure last item is fully scrollable
            // 20rem = 320px base + safe-area-inset for iPhone home indicator
            paddingBottom:
              keyboardHeight > 0
                ? `calc(${keyboardHeight}px + 15rem)`
                : "max(20rem, calc(18rem + env(safe-area-inset-bottom, 0px)))",
          }}
          onScroll={handleScroll}
        >
          {/* Prevent iOS zoom on inputs */}
          <style>{`
            input, textarea, select {
              font-size: 16px !important;
              touch-action: manipulation;
            }
            
            /* Lock body scroll when drawer is being dragged */
            body.drawer-dragging {
              overflow: hidden;
              position: fixed;
              width: 100%;
            }
          `}</style>
          {children}
        </div>
      </motion.div>
    </>
  );
};

export default React.memo(BottomDrawer);
