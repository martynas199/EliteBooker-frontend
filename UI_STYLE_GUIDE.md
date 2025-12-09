# EliteBooker UI Style Guide

This document outlines the color schemes, design patterns, and styling conventions used across the EliteBooker application.

---

## 🎨 Color Palette Overview

### Brand Colors (Tailwind Config)
The application uses a **blue-based brand color** defined in `tailwind.config.js`:

```javascript
brand: {
  50: "#EFF6FF",   // Lightest blue background
  100: "#DBEAFE",  // Very light blue
  200: "#BFDBFE",  // Light blue borders
  300: "#93C5FD",  // Soft blue
  400: "#60A5FA",  // Medium blue
  500: "#3B82F6",  // Primary blue
  600: "#2563EB",  // Main brand blue
  700: "#1D4ED8",  // Dark blue
  800: "#1E40AF",  // Darker blue
  900: "#1E3A8A",  // Darkest blue
}
```

**Primary Brand Color**: `brand-600` (#2563EB) - Blue

---

## 📱 Application Sections

The application has **three distinct visual sections**, each with its own color scheme:

### 1. **System Pages** (Landing, Signup, Login)
**Color Scheme**: Violet → Fuchsia → Cyan Gradients

#### Primary Colors:
- **Violet**: `violet-600` (#7c3aed), `violet-500`, `violet-400`
- **Fuchsia**: `fuchsia-600` (#c026d3), `fuchsia-500`, `fuchsia-400`
- **Cyan**: `cyan-600` (#0891b2), `cyan-400`

#### Usage Examples:
```jsx
// Gradient text
className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"

// Gradient backgrounds
className="bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20"

// Buttons
className="bg-gradient-to-r from-violet-600 to-fuchsia-600"

// Backgrounds
className="bg-gradient-to-br from-slate-50 via-white to-indigo-50"
```

#### Components Using This Style:
- `LandingPage.jsx` - Main marketing page
- `SignupPage.jsx` - Business registration
- `SignupSuccessPage.jsx` - Post-registration
- `Login.jsx` - Admin login page
- `Modal.jsx` - Reusable modal component

#### Design Characteristics:
- Modern, vibrant gradients
- Animated gradient orbs
- Glass morphism effects (backdrop-blur)
- Smooth transitions and animations
- Framer Motion animations

---

### 2. **Dashboard/Admin Pages**
**Color Scheme**: Blue Brand Colors (brand-500 to brand-700)

#### Primary Colors:
- **Main Blue**: `brand-600` (#2563EB)
- **Light Blue**: `brand-500` (#3B82F6)
- **Dark Blue**: `brand-700` (#1D4ED8)
- **Backgrounds**: `brand-50`, `brand-100`
- **Borders**: `brand-200`, `brand-300`

#### Usage Examples:
```jsx
// Primary buttons and CTAs
className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700"

// Hover states
className="hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-50/50"

// Icons and accents
className="text-brand-600"

// Focus states
className="focus:ring-2 focus:ring-brand-500 focus:border-brand-500"

// Cards and containers
className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200"
```

#### Components Using This Style:
- `Dashboard.jsx` - Main admin dashboard
- `Services.jsx` - Service management
- `Staff.jsx` - Staff management
- Admin navigation and sidebars
- Admin forms and tables

#### Design Characteristics:
- Professional, corporate blue
- Consistent with business tools
- Clear hierarchy and spacing
- Focus on functionality
- Clean, modern interface

---

### 3. **Tenant/Salon Pages** (Customer-Facing)
**Color Scheme**: Dark/Elegant with Customizable Accents

#### Primary Colors:
- **Dark Backgrounds**: `slate-900`, `slate-800`, `black`
- **Accents**: Uses `brand-` colors (blue) for consistency
- **Light Elements**: `white`, `gray-100`, `gray-200`

#### Usage Examples:
```jsx
// Dark backgrounds
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"

// Elegant overlays
className="bg-gradient-to-t from-black/90 via-black/40 to-transparent"

// Light cards on dark
className="bg-white/60 backdrop-blur-sm border border-gray-200/50"

// Brand accents on dark
className="hover:from-brand-900/90"
```

#### Components Using This Style:
- `SalonLandingLuxury.jsx` - Salon landing page
- `TimeSlotsPage.jsx` - Booking calendar
- `CheckoutPage.jsx` - Payment flow
- Tenant navigation
- Service cards and listings

#### Design Characteristics:
- Luxury, high-end feel
- Dark mode aesthetic
- Bold typography
- Spotify-style toggle switches
- Large, immersive imagery
- Glass morphism effects

---

## 🎯 Design System Summary

### Color Mapping by Section:

| Section | Primary | Secondary | Accent | Background |
|---------|---------|-----------|--------|------------|
| **System** | Violet-600 | Fuchsia-600 | Cyan-600 | Slate-50/White/Indigo-50 |
| **Dashboard** | Brand-600 (Blue) | Brand-500 | Brand-700 | White/Brand-50 |
| **Tenant** | Slate-900 | Black | Brand-600 | Slate-900/800 |

---

## 🔧 Common Patterns

### Gradient Buttons
```jsx
// System pages (colorful)
className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-xl"

// Dashboard (blue)
className="bg-gradient-to-r from-brand-500 to-brand-600 hover:scale-105"

// Tenant (dark with brand accent)
className="bg-gradient-to-r from-brand-600 to-brand-700"
```

### Cards
```jsx
// System pages (light, airy)
className="bg-white rounded-2xl shadow-2xl border border-gray-200"

// Dashboard (professional)
className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl"

// Tenant (dark, elegant)
className="bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/50"
```

### Text Gradients
```jsx
// System pages
className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"

// Dashboard (less common, but used in modals)
className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"

// Tenant
className="text-white"
```

---

## 📐 Spacing & Borders

### Border Radius
- **Small**: `rounded-lg` (0.5rem)
- **Medium**: `rounded-xl` (1rem)
- **Large**: `rounded-2xl` (1.25rem)
- **Extra Large**: `rounded-3xl` (1.5rem)

### Padding Standards
- **Compact**: `p-4` (1rem)
- **Regular**: `p-6` (1.5rem)
- **Spacious**: `p-8` (2rem)
- **Extra Spacious**: `p-12` (3rem)

### Shadow Levels
```jsx
shadow-sm    // Subtle
shadow-md    // Standard
shadow-lg    // Elevated
shadow-xl    // High elevation
shadow-2xl   // Maximum elevation
```

---

## 🎭 Component-Specific Guidelines

### Modal Component
- **Header**: Gradient background `from-violet-50 to-fuchsia-50`
- **Title**: Gradient text `from-violet-600 via-fuchsia-600 to-cyan-600`
- **Backdrop**: `bg-black/50 backdrop-blur-sm`
- **Size**: Default to `xl` for forms

### Navigation
- **Dashboard**: Blue theme with `brand-` colors
- **Tenant**: Dark theme with white text
- **System**: Light theme with violet accents

### Forms
- **Input Focus**: `focus:ring-2 focus:ring-violet-500` (System) or `focus:ring-brand-500` (Dashboard)
- **Input Borders**: `border-gray-300` default, hover `border-violet-400`
- **Labels**: `font-semibold text-gray-700`

---

## ✨ Animations

### Framer Motion Standards
```jsx
// Modal entrance
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.2, ease: "easeOut" }}

// Button hover
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}

// Staggered children
transition={{ delay: 0.1 + index * 0.1 }}
```

### Tailwind Animations
- `animate-pulse` - Loading states
- `animate-spin` - Spinners
- `animate-fade-in` - Custom fade in
- `transition-all duration-300` - Smooth transitions

---

## 🚨 Important Notes

### Consistency Issues Found:
1. **Dashboard uses different colors** than System pages:
   - Dashboard: Blue (`brand-600`)
   - System: Violet/Fuchsia/Cyan gradients
   
2. **Modal component** uses System colors (violet/fuchsia) but appears in Dashboard:
   - This creates visual inconsistency
   - Consider creating Dashboard-specific modal variant

### ✅ Implementation Complete:
**Option 2 has been implemented** - Modal component now supports context-aware styling.

#### Modal Variant System:
The Modal component now accepts a `variant` prop:

```jsx
// System variant (default) - Violet/Fuchsia/Cyan
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Modal Title"
  variant="system"  // or omit, as this is default
>
  {content}
</Modal>

// Dashboard variant - Blue theme
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Modal Title"
  variant="dashboard"  // Use in admin/dashboard context
>
  {content}
</Modal>
```

#### Updated Components:
All admin modals now use `variant="dashboard"`:
- ✅ `CreateServiceModal.jsx`
- ✅ `CreateStaffModal.jsx`
- ✅ `Appointments.jsx` (3 modals)
- ✅ `Settings.jsx`
- ✅ `WorkingHoursCalendar.jsx` (2 modals)

Tenant modals use default `system` variant:
- ✅ `ServiceCard.jsx`

---

## 📝 Quick Reference

### System Pages Colors:
- Primary: `violet-600`
- Secondary: `fuchsia-600`
- Accent: `cyan-600`

### Dashboard Colors:
- Primary: `brand-600` (Blue)
- Secondary: `brand-500`
- Accent: `brand-700`

### Tenant Colors:
- Primary: `slate-900`
- Secondary: `black`
- Accent: `brand-600`

---

## 🔄 Migration Path (If Needed)

To unify the design system, consider:

1. **Update Dashboard to match System colors**:
   ```jsx
   // Replace all brand-600 with violet-600
   // Replace all brand-500 with violet-500
   // Replace all brand-700 with violet-700
   ```

2. **OR keep both and document when to use each**:
   - System = Violet (Marketing, onboarding)
   - Dashboard = Blue (Business tools, admin)
   - Tenant = Dark (Customer experience)

---

*Last Updated: December 9, 2025*
