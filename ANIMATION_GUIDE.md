# 🎬 Animation Implementation Guide

Quick reference for applying animations to remaining pages.

---

## Quick Patterns

### 1. Page Entry Animation

```jsx
import PageTransition from "../components/ui/PageTransition";

export default function YourPage() {
  return <PageTransition>{/* Your content */}</PageTransition>;
}
```

---

### 2. Loading States (Replace Spinners)

```jsx
import {
  ServiceCardSkeleton,
  StatsCardSkeleton,
  ListSkeleton,
} from "../components/ui/Skeleton";

if (loading) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
    </div>
  );
}
```

---

### 3. Staggered Grid/List

```jsx
import { StaggerContainer, StaggerItem } from "../components/ui/PageTransition";

<StaggerContainer className="grid grid-cols-2 gap-4">
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card hoverable clickable>
        {/* Card content */}
      </Card>
    </StaggerItem>
  ))}
</StaggerContainer>;
```

---

### 4. Toast Notifications (Replace Alerts)

```jsx
import toast from "react-hot-toast";

// Success
toast.success("Booking confirmed!");

// Error
toast.error("Something went wrong");

// Loading (dismissible)
const loadingToast = toast.loading("Processing payment...");
// Later:
toast.dismiss(loadingToast);
toast.success("Payment complete!");
```

---

### 5. Animated Buttons

```jsx
// Already enhanced! Just use as normal:
<Button variant="brand" loading={isSubmitting}>
  Submit
</Button>;

// For custom buttons, add these classes:
className = "transition-all duration-250 hover:scale-105 active:scale-95";
```

---

### 6. Hover Cards

```jsx
<Card hoverable clickable onClick={handleClick}>
  {/* Content */}
</Card>

// Or manually:
<div className="transition-all duration-250 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
  {/* Content */}
</div>
```

---

### 7. Animated Inputs (Already Enhanced)

```jsx
import { Input, Textarea } from "../components/ui/Input";

// Focus ring and hover states are automatic:
<Input type="email" placeholder="Enter email" />;
```

---

### 8. Category/Tab Pills

```jsx
<button
  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-250 ${
    isActive
      ? "bg-brand-600 text-white shadow-md scale-105"
      : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-105"
  }`}
>
  Category
</button>
```

---

### 9. Scroll-Based Animation

```jsx
import { FadeInWhenVisible } from "../components/ui/PageTransition";

<FadeInWhenVisible>
  <div className="hero-section">
    {/* Content fades in when scrolled into view */}
  </div>
</FadeInWhenVisible>;
```

---

### 10. Modal/Dialog (Already Enhanced)

```jsx
import Modal from "../components/ui/Modal";

// Animations are automatic:
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  footer={
    <>
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button variant="brand" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>;
```

---

## Priority Pages to Update

### High Priority (Customer-Facing)

1. ✅ **ServicesPage** - DONE
2. **CheckoutPage** - Add PageTransition, toast for errors
3. **ProfilePage** - Stagger booking/order cards
4. **ProfileEditPage** - Toast for success/error messages
5. **TimeSlots** - Stagger slot buttons, skeleton for loading

### Medium Priority (Internal)

6. **Dashboard** - Counter animations for stats
7. **Appointments** - Stagger table rows
8. **Revenue** - Animate chart entrance
9. **Products/Orders** - Stagger grid items

### Low Priority (Static/Rare)

10. **SalonDetails** - Fade in sections
11. **FAQPage** - Stagger accordion items
12. **LoginPage/RegisterPage** - Subtle form transitions

---

## Class Reference

### Hover Effects

```css
hover:scale-105        /* Gentle grow */
hover:scale-110        /* Stronger grow */
hover:shadow-lg        /* Lift with shadow */
hover:-translate-y-1   /* Vertical lift */
hover:bg-brand-50      /* Background tint */
hover:border-brand-300 /* Border highlight */
```

### Active/Press States

```css
active:scale-95        /* Press feedback */
active:scale-[0.98]    /* Subtle press */
```

### Transitions

```css
transition-all duration-200  /* Fast (buttons) */
transition-all duration-250  /* Standard (cards) */
transition-all duration-300  /* Slow (pages) */
transition-all duration-500  /* Luxe (images) */
```

### Custom Animations

```css
animate-fade-in        /* Fade in once */
animate-slide-up       /* Slide from bottom */
animate-slide-down     /* Slide from top (menus) */
animate-scale-in       /* Scale + fade */
animate-pulse          /* Loading skeleton */
animate-bounce-subtle  /* Notification badge */
```

---

## Performance Checklist

Before deploying animations:

- [ ] All animations use `transform` or `opacity` (not width/height)
- [ ] Skeleton loaders prevent layout shift
- [ ] Stagger animations limited to ≤10 items
- [ ] Images have `loading="lazy"` attribute
- [ ] No animations on scroll events (use Intersection Observer)
- [ ] Toast notifications auto-dismiss
- [ ] Modals lock body scroll when open
- [ ] Reduced motion preference is respected (automatic with Framer Motion)

---

## Common Mistakes

❌ **Don't**:

- Animate `width`, `height`, `padding`, `margin` (causes reflow)
- Use JavaScript for hover effects (CSS is faster)
- Stagger more than 10 items (feels slow)
- Set durations >500ms for interactions (feels laggy)
- Chain multiple animations (can cause jank)

✅ **Do**:

- Animate `transform` and `opacity` (GPU-accelerated)
- Use CSS transitions for hovers
- Group items after 10 (show all at once)
- Keep interactions snappy (200-300ms)
- Use separate animations for different states

---

## Testing Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check bundle size
npm run build -- --analyze
```

---

## Browser Testing

| Browser       | Version | Animation Support | Notes                   |
| ------------- | ------- | ----------------- | ----------------------- |
| Chrome        | 90+     | ✅ Full           | Best performance        |
| Safari        | 14+     | ✅ Full           | Test backdrop-filter    |
| Firefox       | 88+     | ✅ Full           | Test grid gaps          |
| Edge          | 90+     | ✅ Full           | Same as Chrome          |
| Mobile Safari | iOS 14+ | ✅ Full           | Test touch interactions |

---

## Quick Wins

Easy pages to animate (< 10 mins each):

1. **CheckoutPage**: Wrap in PageTransition, add toast on submit
2. **ProfilePage**: Add StaggerContainer to bookings grid
3. **TimeSlots**: Add hover:scale-105 to slot buttons
4. **LoginPage**: Add PageTransition, toast for errors

---

## Example: Full Page Implementation

```jsx
import { useState, useEffect } from "react";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../components/ui/PageTransition";
import { ServiceCardSkeleton } from "../components/ui/Skeleton";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function ExamplePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async () => {
    try {
      await submitData();
      toast.success("Action completed!");
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceCardSkeleton />
        <ServiceCardSkeleton />
      </div>
    );
  }

  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-6">Page Title</h1>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2">
        {data.map((item) => (
          <StaggerItem key={item.id}>
            <Card hoverable clickable onClick={() => handleSelect(item)}>
              <div className="p-4">
                <h3>{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
                <Button variant="brand" className="mt-4">
                  Select
                </Button>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
}
```

---

## Support

For animation issues:

1. Check browser console for errors
2. Verify Framer Motion is installed (`npm list framer-motion`)
3. Clear browser cache (animations are cached)
4. Test in incognito mode (disable extensions)

For performance issues:

1. Use Chrome DevTools Performance tab
2. Enable paint flashing to see repaints
3. Check for `will-change` warnings
4. Reduce stagger delay if slow (default: 50ms)
