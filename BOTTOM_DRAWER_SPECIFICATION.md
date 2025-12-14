# Bottom Drawer (Bottom Sheet) - UX Specification

**Design Goal:** Mobile-first draggable drawer with Fresha-like behavior for map-based venue discovery.

---

## 1. Behavior Specification

### 1.1 Drawer States

The drawer has **three snap points**:

| State         | Height | Use Case                                 |
| ------------- | ------ | ---------------------------------------- |
| **Collapsed** | ~25vh  | Peek at content, maximize map visibility |
| **Mid**       | ~60vh  | Browse multiple items, balanced view     |
| **Expanded**  | ~95vh  | Deep scroll, full immersion              |

**Constants:**

```javascript
const SNAP_POINTS = {
  COLLAPSED: 0.25, // 25% of viewport height
  MID: 0.6, // 60% of viewport height
  EXPANDED: 0.95, // 95% of viewport height (leaves status bar visible)
};
```

### 1.2 Drag Interaction

**Touch Start:**

- Track initial touch Y position
- Record current drawer height
- Disable scroll while dragging (when list at top)

**Touch Move:**

- Calculate delta from initial position
- Update drawer height in real-time (follow finger)
- Clamp between COLLAPSED and EXPANDED bounds
- Track velocity for swipe detection

**Touch End:**

- Calculate velocity (pixels/ms)
- If **fast swipe** detected (velocity > 0.5px/ms):
  - Skip to next snap point in swipe direction
  - Upward swipe → next higher snap point
  - Downward swipe → next lower snap point
- If **slow drag**:
  - Snap to nearest snap point
- Animate to target with spring physics

**Velocity Calculation:**

```javascript
velocity = (currentY - previousY) / timeDelta;
isFastSwipe = Math.abs(velocity) > 0.5; // px/ms threshold
```

---

## 2. Scroll Coordination

### 2.1 The Problem

Bottom sheets need intelligent scroll handling:

- When list is **scrolled down**, drag gestures should **scroll the list** (not move drawer)
- When list is **at top**, drag gestures should **move the drawer**
- Transition must be seamless with no dead zones

### 2.2 Solution: Scroll Lock Pattern

**Implementation:**

1. Monitor internal scroll position via `onScroll` event
2. When `scrollTop === 0`, enable drawer dragging
3. When `scrollTop > 0`, disable drawer dragging (let list scroll)
4. On downward swipe at top, lock scroll and engage drawer

**State Machine:**

```
┌─────────────────────────────────────┐
│  Scroll at Top (scrollTop === 0)    │
│  → Drawer dragging ENABLED          │
│  → Downward touch moves drawer      │
└─────────────────────────────────────┘
              ↓ (user scrolls down)
┌─────────────────────────────────────┐
│  Scroll Active (scrollTop > 0)      │
│  → Drawer dragging DISABLED         │
│  → Touch events scroll list          │
└─────────────────────────────────────┘
              ↓ (user scrolls to top)
         (returns to top state)
```

**Edge Case Handling:**

- **Overscroll bounce:** Prevent rubber-band effect when dragging drawer at top
- **Momentum scroll:** If user flings list to top, immediately enable drawer drag
- **Mid-gesture transition:** If scroll reaches top during touch, smoothly hand off to drawer

### 2.3 Implementation Code Pattern

```javascript
const [isAtTop, setIsAtTop] = useState(true);
const scrollRef = useRef(null);

const handleScroll = (e) => {
  const scrollTop = e.target.scrollTop;
  setIsAtTop(scrollTop <= 0);
};

const handleTouchStart = (e) => {
  if (isAtTop) {
    // Enable drawer drag
    startDragging(e);
  }
  // Otherwise, let list scroll naturally
};
```

---

## 3. Interaction States

### 3.1 State Transitions

```
COLLAPSED (25vh)
    ↕ drag/swipe
MID (60vh)
    ↕ drag/swipe
EXPANDED (95vh)
```

**Valid Transitions:**

- Collapsed ↔ Mid ↔ Expanded
- Fast upward swipe can jump: Collapsed → Expanded
- Fast downward swipe can jump: Expanded → Collapsed

### 3.2 Animation Curves

**Spring Configuration (Framer Motion):**

```javascript
const springConfig = {
  type: "spring",
  damping: 30, // Higher = less oscillation
  stiffness: 300, // Higher = faster response
  mass: 0.8, // Lower = lighter feel
};
```

**Use Cases:**

- **Snap animation:** Use spring for natural deceleration
- **Follow finger:** Direct translation (no animation)
- **Fast swipe:** Slightly higher stiffness (350) for snappy feel

---

## 4. Component Structure

### 4.1 Component Hierarchy

```
<BottomDrawer>
  ├─ <div className="drawer-overlay" />          // backdrop (optional)
  ├─ <motion.div className="drawer-container">   // animated wrapper
  │   ├─ <div className="drawer-handle" />       // drag handle
  │   ├─ <div className="drawer-header" />       // sticky header
  │   └─ <div className="drawer-content">        // scrollable content
  │       └─ {children}
  └─ </motion.div>
```

### 4.2 Props API

```typescript
interface BottomDrawerProps {
  children: React.ReactNode;
  initialSnap?: "collapsed" | "mid" | "expanded";
  onSnapChange?: (snap: string) => void;
  showOverlay?: boolean;
  header?: React.ReactNode;
  className?: string;
}
```

### 4.3 Internal State

```javascript
const [currentSnap, setCurrentSnap] = useState("collapsed");
const [isDragging, setIsDragging] = useState(false);
const [dragStartY, setDragStartY] = useState(0);
const [dragStartHeight, setDragStartHeight] = useState(0);
const [isAtTop, setIsAtTop] = useState(true);
const velocityTracker = useRef({ y: 0, timestamp: 0 });
```

---

## 5. Performance Requirements

### 5.1 Target Metrics

| Metric            | Target | Measurement                          |
| ----------------- | ------ | ------------------------------------ |
| **Animation FPS** | 60fps  | Chrome DevTools Performance          |
| **Touch Latency** | <16ms  | Time from touchmove to visual update |
| **Jank Events**   | 0      | No dropped frames during drag        |
| **Memory**        | Stable | No leaks during repeated open/close  |

### 5.2 Optimization Techniques

**1. GPU Acceleration:**

```css
.drawer-container {
  transform: translate3d(0, 0, 0); /* Force GPU layer */
  will-change: transform; /* Hint to browser */
}
```

**2. Transform Over Top/Height:**

```javascript
// ❌ Bad: Triggers layout
element.style.height = `${newHeight}px`;

// ✅ Good: GPU-accelerated
element.style.transform = `translateY(${-newHeight}px)`;
```

**3. Passive Touch Listeners:**

```javascript
element.addEventListener("touchmove", handler, { passive: false });
// passive: false needed for preventDefault() to block scroll
```

**4. RAF Throttling:**

```javascript
const handleTouchMove = (e) => {
  requestAnimationFrame(() => {
    updateDrawerPosition(e.touches[0].clientY);
  });
};
```

**5. Debounce Scroll Handler:**

```javascript
const handleScroll = debounce((e) => {
  setIsAtTop(e.target.scrollTop <= 0);
}, 16); // 1 frame at 60fps
```

---

## 6. Visual Design

### 6.1 Styling Specifications

```css
.drawer-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  touch-action: none; /* Prevent browser gestures */
}

.drawer-handle {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 12px auto 8px;
  cursor: grab;
}

.drawer-handle:active {
  cursor: grabbing;
}

.drawer-header {
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 10;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.drawer-content {
  overflow-y: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
  overscroll-behavior: contain; /* Prevent overscroll propagation */
}
```

### 6.2 Visual States

**Default:**

- Handle: `#d1d5db` (gray-300)
- Background: `#ffffff`
- Shadow: subtle elevation

**Dragging:**

- Handle: `#9ca3af` (gray-400, darker)
- Cursor: `grabbing`
- Shadow: increased elevation (optional)

**Expanded:**

- Full screen minus status bar
- Disable map interactions (optional overlay)

---

## 7. Integration with Map View

### 7.1 Z-Index Layering

```
┌─────────────────────────────────┐
│  Floating Controls (z: 200)     │  ← Search, location button
├─────────────────────────────────┤
│  Bottom Drawer (z: 100)         │  ← Drawer
├─────────────────────────────────┤
│  Map View (z: 1)                │  ← Google Maps
└─────────────────────────────────┘
```

### 7.2 Map Interaction During Drag

**Collapsed State:**

- Map fully interactive
- Pan, zoom, marker clicks work

**Mid State:**

- Map visible above drawer
- Map interactive

**Expanded State:**

- Map mostly hidden
- Map still interactive in visible area
- Optional: dim map with overlay

**During Drag:**

- Touch events on drawer don't propagate to map
- Touch events on map area work normally

### 7.3 SearchPage Layout

```jsx
<div className="search-page">
  <MapView className="map-container" />
  <BottomDrawer initialSnap="mid">
    <VenueCardList venues={filteredVenues} />
  </BottomDrawer>
</div>
```

```css
.search-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
```

---

## 8. Edge Cases & Handling

### 8.1 Fast Swipe Detection

**Problem:** Distinguish between "slow drag to mid" vs "fast swipe to expanded"

**Solution:**

```javascript
const VELOCITY_THRESHOLD = 0.5; // px/ms
const SWIPE_DISTANCE_MIN = 50; // px

const isFastSwipe = (velocity, distance) => {
  return (
    Math.abs(velocity) > VELOCITY_THRESHOLD &&
    Math.abs(distance) > SWIPE_DISTANCE_MIN
  );
};
```

### 8.2 Rapid State Changes

**Problem:** User taps drawer during snap animation

**Solution:**

- Interrupt current animation
- Start new animation from current position
- Use `dragTransition={{ bounceStiffness: 300 }}` to allow interruptions

### 8.3 Overscroll at Expanded

**Problem:** At 95vh, user tries to drag up further

**Solution:**

```javascript
const clampHeight = (height) => {
  const min = window.innerHeight * SNAP_POINTS.COLLAPSED;
  const max = window.innerHeight * SNAP_POINTS.EXPANDED;
  return Math.max(min, Math.min(max, height));
};
```

### 8.4 iOS Safari Bottom Bar

**Problem:** iOS Safari has dynamic bottom bar that affects `100vh`

**Solution:**

```javascript
// Use visualViewport API for accurate height
const getViewportHeight = () => {
  return window.visualViewport?.height || window.innerHeight;
};
```

### 8.5 Horizontal Scroll Conflict

**Problem:** If content has horizontal scroll (carousels), vertical drag might conflict

**Solution:**

- Detect horizontal vs vertical drag intent
- If `abs(deltaX) > abs(deltaY)`, disable drawer drag
- Use first 10px of movement as "intent detection zone"

---

## 9. Accessibility

### 9.1 Keyboard Support

- **Escape:** Collapse drawer
- **Tab:** Navigate through drawer content
- **Space/Enter:** Activate focused item

### 9.2 Screen Reader

```jsx
<div
  role="dialog"
  aria-modal="false"
  aria-label="Venue results"
  aria-expanded={currentSnap === "expanded"}
>
  <button
    className="drawer-handle"
    aria-label="Drag to resize venue list"
    tabIndex={0}
  />
  {/* content */}
</div>
```

### 9.3 Reduced Motion

```javascript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const springConfig = prefersReducedMotion
  ? { type: "tween", duration: 0.2 }
  : { type: "spring", damping: 30, stiffness: 300 };
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Snap point calculations
- Velocity detection logic
- Nearest snap point algorithm
- Scroll lock state transitions

### 10.2 Integration Tests

- Drag from collapsed to expanded
- Fast swipe up/down
- Scroll coordination (at top vs scrolled)
- Map interaction during drawer states

### 10.3 Manual Testing Checklist

- [ ] Smooth 60fps dragging on mid-range device
- [ ] Snap animations feel natural (spring physics)
- [ ] Fast swipe skips to next state
- [ ] Scroll works when list not at top
- [ ] Drawer drag works when list at top
- [ ] No stuck states or dead zones
- [ ] Works on iOS Safari with bottom bar
- [ ] Works on Android Chrome
- [ ] Touch-optimized (no lag)
- [ ] Map interactions don't conflict

### 10.4 Performance Testing

```javascript
// Chrome DevTools Performance timeline
// Monitor during drag:
- FPS (target: 60)
- CPU usage (target: <50% on mid-tier device)
- Layout/Paint events (minimize)
- Memory (stable, no leaks)
```

---

## 11. Implementation Phases

### Phase 1: Basic Drawer (MVP)

- Fixed position container
- Three snap points
- Basic drag handling
- Spring animations
- No scroll coordination yet

### Phase 2: Scroll Coordination

- Monitor scroll position
- Enable/disable drag based on scroll
- Smooth handoff between modes

### Phase 3: Polish

- Fast swipe detection
- Visual feedback (handle darkens)
- Optimize for 60fps
- Test on real devices

### Phase 4: Edge Cases

- iOS Safari compatibility
- Overscroll handling
- Rapid state changes
- Accessibility features

---

## 12. Reference Implementations

### Fresha App Analysis

**Observed Behavior:**

1. Drawer starts at ~mid position showing 2-3 items
2. Drag handle visible at top (gray pill)
3. Smooth follow-finger during drag
4. Snap points feel like: 20%, 55%, 92%
5. Fast swipe has velocity threshold ~0.4-0.5px/ms
6. List scroll takes priority when scrolled
7. Very snappy, no lag or jank
8. Spring animation has slight bounce

**Spring Feel:**

- Damping: ~25-30 (slight bounce)
- Stiffness: ~300-350 (snappy)
- Duration: ~300-400ms to settle

### Similar Patterns

- **Google Maps:** Bottom sheet for place details
- **Uber:** Ride options drawer
- **Airbnb:** Filter drawer
- **Apple Maps:** Place card drawer

---

## Summary

This specification provides a complete blueprint for implementing a Fresha-like bottom drawer:

✅ **Behavior:** Three snap points with spring animations  
✅ **Interactions:** Smart scroll coordination, velocity detection  
✅ **Performance:** 60fps, GPU-accelerated, optimized touch  
✅ **Integration:** Works over map view, proper z-index layering  
✅ **Polish:** Edge cases, accessibility, cross-platform support

**Key Innovation:** Scroll lock pattern that intelligently switches between drawer drag and list scroll based on scroll position, creating a seamless UX.

**Next:** Implement `BottomDrawer.jsx` component following this specification.
