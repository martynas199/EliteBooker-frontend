# Animation Testing Checklist

## ✅ Pre-Flight Checks (All Passed)

### Code Quality

- ✅ All 17 modified files compile without errors
- ✅ No TypeScript/ESLint errors in workspace
- ✅ All imports resolved correctly
- ✅ Framer Motion, react-hot-toast, react-intersection-observer installed

### Infrastructure

- ✅ Tailwind config has 6 custom animations
- ✅ ToastProvider integrated in main.jsx
- ✅ PageTransition components exported correctly
- ✅ Skeleton components available for all use cases

---

## 🧪 Manual Testing Guide

### 1. Toast Notifications

**Test**: Trigger errors/success messages across app

**CheckoutPage**:

- [ ] Submit form with invalid data → toast.error appears
- [ ] Toast has red icon, auto-dismisses after 4s

**ProfilePage**:

- [ ] Cancel a booking → toast.loading appears, then toast.success
- [ ] Cancel with error → toast.error appears

**TimeSlots**:

- [ ] Navigate with missing data → toast.error appears

**Expected Behavior**:

- Toasts appear top-center
- Color-coded icons (success: green, error: red, loading: gold spinner)
- Auto-dismiss after 4 seconds
- No jarring browser alert() calls

---

### 2. Page Transitions

**Test**: Navigate between enhanced pages

**Pages to Test**:

- [ ] ServicesPage (fade+slide entry)
- [ ] CheckoutPage (fade+slide entry)
- [ ] ProfilePage (fade+slide entry)
- [ ] TimeSlots (fade+slide entry)

**Expected Behavior**:

- Pages fade in + slide up slightly (300ms)
- Smooth, not abrupt
- Works on forward AND back navigation

---

### 3. Stagger Animations

**Test**: Load pages with grids/lists

**ServicesPage**:

- [ ] Service cards appear one-by-one (50ms delay between each)
- [ ] Stagger feels intentional, not slow

**ProfilePage**:

- [ ] Bookings grid cards appear sequentially
- [ ] Orders grid cards appear sequentially
- [ ] Stagger works when switching tabs

**TimeSlots (DateTimePicker)**:

- [ ] Time slot buttons appear sequentially when date selected
- [ ] Grid feels alive, not static

**PopularCollections**:

- [ ] Product cards appear one-by-one
- [ ] Works on initial load

**Expected Behavior**:

- Sequential appearance (not all at once)
- 50ms delay between items
- Smooth fade+slide entrance
- No "pop-in" effect

---

### 4. Loading Skeletons

**Test**: Trigger loading states

**ServicesPage**:

- [ ] Shows 4 ServiceCardSkeleton components while loading
- [ ] Skeleton dimensions match final cards
- [ ] Shimmer animation visible (1.5s loop)
- [ ] No layout shift when real cards load

**ProfilePage**:

- [ ] Shows ListSkeleton (4 items, h-32 each) while loading
- [ ] No layout shift when real bookings load

**PopularCollections**:

- [ ] Shows 8 ProductCardSkeleton components while loading
- [ ] Grid layout preserved

**TimeSlots**:

- [ ] Shows pulse skeleton (2 lines) while loading availability

**Expected Behavior**:

- Skeletons appear immediately (no blank screen)
- Shimmer effect smooth
- Dimensions match final content
- CLS (Cumulative Layout Shift) score < 0.1

---

### 5. Button Animations

**Test**: Hover and click buttons across app

**Button Component** (brand variant):

- [ ] Hover → scales to 102%, shadow increases
- [ ] Click → scales to 98% (press feedback)
- [ ] Transition duration: 250ms

**Time Slot Buttons**:

- [ ] Hover → scales to 105%
- [ ] Click → scales to 95%
- [ ] Selected state has ring (brand-400)

**Expected Behavior**:

- Scale changes smooth, not jarring
- Active/press state visible on click
- Hover states clear on desktop

---

### 6. Card Animations

**Test**: Hover over cards

**ServiceCard** (ServicesPage):

- [ ] Hover → card lifts slightly (shadow + translate-y)
- [ ] Image zooms slowly (700ms, scale-110)
- [ ] "Book Now" button scales on press

**ProductCard** (PopularCollections):

- [ ] Hover → card lifts (hover:-translate-y-1)
- [ ] Image zooms slowly (700ms, scale-110)
- [ ] Transition smooth, not abrupt

**ProfilePage Booking Cards**:

- [ ] Hover → card lifts with shadow
- [ ] Cursor changes to pointer

**Expected Behavior**:

- Image zoom noticeably slower than card lift (luxury feel)
- No image overflow (overflow-hidden works)
- Lift effect subtle but visible

---

### 7. Input Animations

**Test**: Focus on form inputs

**CheckoutPage Forms**:

- [ ] Focus → border changes to brand-500 (gold)
- [ ] Focus ring visible (brand-500)
- [ ] Hover → border changes to gray-400
- [ ] Transitions: 250ms

**Expected Behavior**:

- Focus state immediately visible
- Brand color matches design system
- Smooth border color transitions

---

### 8. Modal Animations

**Test**: Open/close modals

**ProductDetailModal** (when clicking product):

- [ ] Backdrop fades in + blurs
- [ ] Modal scales + fades in (200ms)
- [ ] Close: Modal scales + fades out
- [ ] Body scroll locked when open

**Expected Behavior**:

- Smooth entrance/exit (no pop-in)
- Backdrop blur visible
- Body scroll prevented when modal open
- Modal centered on screen

---

### 9. Navigation Animations

**Test**: Open mobile menu, profile dropdown

**Mobile Menu** (routes.jsx):

- [ ] Menu slides down when opened
- [ ] Smooth animation, not abrupt

**Profile Dropdown**:

- [ ] Dropdown scales + fades in
- [ ] Hover backgrounds visible (brand-50)

**Cart Badge**:

- [ ] Subtle bounce animation when items in cart

**Expected Behavior**:

- Mobile menu slide-down smooth (300ms)
- Dropdown animations work on both mobile and desktop
- Hover states visible on desktop only

---

### 10. Category Pills (ServicesPage)

**Test**: Hover over category filter buttons

**Category Pills**:

- [ ] Hover → scales to 105%
- [ ] Active category highlighted (brand background)
- [ ] Transition: 250ms

**Expected Behavior**:

- Scale effect subtle but noticeable
- Active state visually distinct
- Smooth transitions on category change

---

## 📱 Mobile Testing

### Touch Interactions

- [ ] Buttons show active state on tap
- [ ] Cards respond to touch (no hover stuck states)
- [ ] Swipe gestures work (if applicable)
- [ ] Toast notifications visible on small screens

### Performance

- [ ] Animations smooth on mid-range Android (60fps)
- [ ] No lag when scrolling with animations
- [ ] Time slot buttons responsive on touch
- [ ] Images load progressively (skeleton → real image)

### Layout

- [ ] Skeletons match mobile card sizes
- [ ] No horizontal scroll caused by animations
- [ ] Modal full-screen on mobile (if designed that way)
- [ ] Toast notifications don't overlap header

---

## 🎨 Brand Consistency

### Colors

- [ ] Focus rings use brand-500 (#d4a710 - warm gold)
- [ ] Hover backgrounds use brand-50 (pale cream)
- [ ] Active/selected states use brand-600
- [ ] Toast loading spinner uses brand color

### Motion

- [ ] All animations feel "Noble Elegance" (subtle, refined)
- [ ] No flashy or aggressive animations
- [ ] Timing feels intentional, not rushed
- [ ] Image zooms slow and luxurious (700ms)

### Typography

- [ ] Headings use Playfair Display (if specified)
- [ ] Body text readable
- [ ] Font weights consistent

---

## ⚡ Performance Testing

### Lighthouse Audit (Chrome DevTools)

**Target Scores**:

- [ ] Performance: 90+ (mobile)
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 90+

**Key Metrics**:

- [ ] CLS (Cumulative Layout Shift): < 0.1
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] TTI (Time to Interactive): < 3.8s (mobile)

### Chrome DevTools Performance

**Record page load**:

- [ ] No long tasks > 50ms during animation
- [ ] Frame rate 60fps during animations
- [ ] No forced reflows/layouts
- [ ] Animations use compositor (transform/opacity only)

**Network Throttling** (Fast 3G):

- [ ] Skeletons appear within 500ms
- [ ] Page usable within 3s
- [ ] Animations don't block user interaction

---

## ♿ Accessibility Testing

### Reduced Motion

**Test**: Enable "Reduce Motion" in OS settings

**macOS**: System Preferences → Accessibility → Display → Reduce motion
**Windows**: Settings → Ease of Access → Display → Show animations in Windows

**Expected Behavior**:

- [ ] Framer Motion respects `prefers-reduced-motion`
- [ ] Animations either skip or use cross-fade only
- [ ] App fully functional with reduced motion

### Keyboard Navigation

- [ ] Tab through buttons (focus states visible)
- [ ] Enter/Space triggers buttons
- [ ] Escape closes modals
- [ ] Time slots keyboard accessible
- [ ] Focus order logical

### Screen Reader

**Test with NVDA (Windows) or VoiceOver (Mac)**:

- [ ] Toast notifications announced
- [ ] Loading states announced ("Loading...")
- [ ] Button purposes clear
- [ ] Modal focus trapped when open
- [ ] Image alt text descriptive

---

## 🌐 Browser Compatibility

### Desktop

- [ ] **Chrome** (latest): All animations smooth
- [ ] **Safari** (latest): Backdrop blur works, animations smooth
- [ ] **Firefox** (latest): All animations render correctly
- [ ] **Edge** (latest): Chromium-based, should match Chrome

### Mobile

- [ ] **Mobile Safari** (iOS 15+): Touch interactions work, animations smooth
- [ ] **Mobile Chrome** (Android 10+): Performance acceptable on mid-range
- [ ] **Samsung Internet**: Animations work, no visual glitches

### Known Issues

- [ ] Safari may not support backdrop-filter blur on older versions (graceful fallback)
- [ ] Older Android devices may drop frames (acceptable if core functionality works)

---

## 🐛 Common Issues & Fixes

### Issue: Toast notifications don't appear

**Fix**: Verify `<ToastProvider />` in `main.jsx` after `<AppRoutes />`

### Issue: Stagger animations all appear at once

**Fix**: Ensure `<StaggerContainer>` wraps `<StaggerItem>` children

### Issue: Layout shifts during loading

**Fix**: Check skeleton dimensions match final content

### Issue: Animations feel laggy

**Fix**:

1. Check network (slow API calls may appear as lag)
2. Verify animations use `transform`/`opacity` only
3. Test on different device

### Issue: Modal doesn't close body scroll

**Fix**: Verify Framer Motion's body scroll lock enabled in Modal component

### Issue: Images zoom out of bounds

**Fix**: Ensure parent div has `overflow-hidden` class

---

## ✅ Sign-Off Checklist

### Functionality

- [ ] All pages load without errors
- [ ] Booking flow works end-to-end
- [ ] Admin features functional (if tested)
- [ ] Navigation works (forward/back)

### User Experience

- [ ] All browser alert() calls replaced with toasts
- [ ] Loading states informative (no blank screens)
- [ ] Buttons responsive (hover/press feedback)
- [ ] Forms provide clear validation feedback

### Performance

- [ ] Lighthouse score meets targets
- [ ] No animation jank on test devices
- [ ] Mobile performance acceptable

### Accessibility

- [ ] Keyboard navigation works
- [ ] Reduced motion respected
- [ ] Focus states visible

### Documentation

- [ ] ANIMATION_CHANGELOG.md reviewed
- [ ] ANIMATION_GUIDE.md available for devs
- [ ] ANIMATION_SUMMARY.md shows progress

---

## 🚀 Deployment Readiness

### Pre-Deploy

- [ ] All tests passed
- [ ] No console errors in production build
- [ ] Environment variables set
- [ ] Backend API accessible

### Post-Deploy

- [ ] Verify animations work on production URL
- [ ] Test on real devices (iOS + Android)
- [ ] Monitor Lighthouse scores in production
- [ ] Check analytics for user engagement

### Rollback Plan

- [ ] Previous version tagged in git
- [ ] Database migrations reversible (if any)
- [ ] Feature flags available (if needed)

---

**Last Updated**: 2024 (Post-animation implementation)
**Tester**: **********\_**********
**Date**: **********\_**********
**Status**: ⏳ Pending Testing
