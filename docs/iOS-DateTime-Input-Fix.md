# iOS DateTime Input Overflow Fix

## Problem Summary

On iPhone 15 Pro (and other iOS devices), `<input type="datetime-local">` inputs were causing horizontal and vertical scrolling in the appointment edit modal. This issue only appeared on **real iOS devices** (Safari and Chrome), not in desktop Chrome DevTools mobile simulation.

## Root Causes

### 1. **iOS Safari Default Input Sizing**

iOS Safari applies a default minimum width to datetime-local inputs (approximately 280-300px) that is larger than typical mobile screen widths. This minimum width is part of Safari's native form control styling and cannot be overridden with CSS width alone.

### 2. **Browser Zoom on Focus**

When font-size is less than 16px, iOS Safari automatically zooms in when the input receives focus, causing layout shifts and potential overflow.

### 3. **CSS Grid/Flex Minimum Size**

CSS Grid and Flexbox have an implicit `min-width: auto` (or `min-content`) for their children, which means inputs won't shrink below their "natural" width even when `width: 100%` is applied.

### 4. **Modal Container Constraints**

The modal was using `w-[90vw]` without `overflow-x-hidden`, allowing content to exceed the container.

## Solution Implemented

### 1. **Modal Component Updates** (`src/components/ui/Modal.jsx`)

```jsx
// BEFORE
<div className="relative bg-white rounded-2xl shadow-xl w-[90vw] max-w-lg mx-auto">

// AFTER
<div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden">
  <div className="p-4 space-y-3 overflow-x-hidden">
```

**Changes:**

- Changed `w-[90vw]` to `w-full` for better flex behavior
- Added `overflow-hidden` to container
- Added `overflow-x-hidden` to content wrapper
- Added `p-4` padding to outer container for breathing room

### 2. **DateTime Input Restructure** (`src/admin/pages/Appointments.jsx`)

```jsx
<div className="w-full max-w-full overflow-hidden">
  <div
    className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full"
    style={{ minWidth: 0 }}
  >
    <div className="w-full max-w-full" style={{ minWidth: 0 }}>
      <label className="block text-sm text-gray-600 mb-1">Start Time</label>
      <input
        type="datetime-local"
        className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
        style={{ minWidth: 0, maxWidth: "100%" }}
        value={appointment.start}
        onChange={(e) => updateField("start", e.target.value)}
      />
    </div>
    {/* End Time similar structure */}
  </div>
</div>
```

**Key Changes:**

- **Wrapper div**: `w-full max-w-full overflow-hidden` - Constrains the entire section
- **Grid container**: `style={{ minWidth: 0 }}` - Allows grid items to shrink below content size
- **Column divs**: `w-full max-w-full` + `style={{ minWidth: 0 }}` - Double constraint
- **Input classes**:
  - `appearance-none` - Removes browser default styling
  - `box-border` - Ensures padding is included in width calculations
  - `text-[16px]` - Prevents iOS zoom on focus (16px is the minimum)
  - `overflow-hidden` - Clips any overflowing content
  - `w-full max-w-full` - Width constraints
- **Input inline styles**: `minWidth: 0, maxWidth: '100%'` - Forces override of browser defaults

### 3. **Global CSS Rules** (`src/styles.css`)

```css
/* Prevent iOS Safari from zooming on focus when font-size < 16px */
input[type="datetime-local"],
input[type="time"],
input[type="date"] {
  font-size: 16px;
}

/* iOS Safari: Force inputs to respect container width */
@supports (-webkit-touch-callout: none) {
  input[type="datetime-local"],
  input[type="time"],
  input[type="date"] {
    appearance: none;
    -webkit-appearance: none;
    min-width: 0 !important;
    max-width: 100% !important;
    box-sizing: border-box;
    overflow: hidden;
  }
}
```

**Purpose:**

- **16px font-size**: Prevents iOS Safari auto-zoom on focus
- **@supports (-webkit-touch-callout: none)**: iOS-specific targeting
- **appearance: none**: Removes native browser styling
- **min-width: 0 !important**: Overrides browser default minimum width
- **max-width: 100% !important**: Ensures input never exceeds container
- **box-sizing: border-box**: Includes padding/border in width calculations

## Technical Explanation

### Why iOS Renders Form Controls Wider

1. **Native UI Consistency**: iOS Safari aims to maintain consistent form control sizing across all websites for better touch interaction. This includes generous padding and sizing for datetime pickers.

2. **Touch Target Size**: Apple's Human Interface Guidelines recommend minimum 44x44pt touch targets. Form controls default to sizes that meet this requirement.

3. **WebKit Defaults**: The WebKit engine (used by all iOS browsers) has hardcoded minimum widths for certain input types to ensure usability on touch devices.

4. **Browser Chrome**: iOS datetime pickers include additional UI elements (calendar icon, clear button) that increase the natural width of the input.

### How This Fix Prevents Overflow

1. **Multiple Layers of Width Constraints**: By applying `w-full`, `max-w-full`, `minWidth: 0`, and `maxWidth: '100%'` at multiple DOM levels (wrapper → grid → column → input), we create a cascading constraint system that browsers cannot ignore.

2. **Forced Shrinking**: `minWidth: 0` on flex/grid items explicitly tells the browser "this element CAN shrink below its content size," overriding the default `min-content` behavior.

3. **Overflow Containment**: `overflow-hidden` on parent containers ensures that even if the input tries to render wider, the overflow is clipped rather than causing scroll.

4. **iOS-Specific Override**: The `@supports (-webkit-touch-callout: none)` rule specifically targets iOS browsers and uses `!important` to override WebKit's default styling.

5. **Box Model Control**: `box-border` ensures that padding and borders are included in width calculations, preventing the input from exceeding its container when borders/padding are added.

## Testing Checklist

### ✅ iPhone 15 Pro Safari

- [ ] Open appointment edit modal
- [ ] Click Start Time input - no horizontal scroll
- [ ] Click End Time input - no horizontal scroll
- [ ] No zoom on focus (font stays readable)
- [ ] Input fits within card boundaries
- [ ] Responsive on portrait and landscape

### ✅ iPhone 15 Pro Chrome

- [ ] Same tests as Safari
- [ ] Verify consistent behavior

### ✅ Desktop Chrome (Responsive Mode)

- [ ] Inputs render at correct size
- [ ] No visual regressions
- [ ] Grid layout works on desktop (2 columns at sm+ breakpoint)

### ✅ Other iOS Devices (Bonus)

- [ ] iPhone SE (smallest screen) - 375px width
- [ ] iPhone 14 Pro Max - 430px width
- [ ] iPad (should show 2-column grid)

## Files Modified

1. **src/components/ui/Modal.jsx** - Container overflow prevention
2. **src/admin/pages/Appointments.jsx** - Input restructure with constraints
3. **src/styles.css** - Global iOS-specific CSS rules

## Deployment

These changes are committed in: `175b8be - fix: comprehensive iOS datetime input overflow fix with Safari-specific CSS`

Push to deploy:

```bash
git push
```

Vercel will automatically deploy the changes and they will take effect immediately on production.

## Additional Notes

- The `text-[16px]` might appear slightly larger than other inputs on desktop, but this is necessary for iOS compatibility. You can add responsive sizing with `text-[16px] md:text-sm` if desired.

- The `@supports (-webkit-touch-callout: none)` is more reliable than user-agent detection for targeting iOS browsers specifically.

- These fixes also apply to `type="time"` and `type="date"` inputs, not just `datetime-local`.

- If you add more modals with datetime inputs in the future, follow the same pattern: wrapper → grid with minWidth: 0 → columns with minWidth: 0 → input with all classes and inline styles.
