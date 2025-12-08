# Frontend Reorganization Plan

## New Structure Overview

```
src/
├── system/              # Platform/Marketing pages (public)
│   ├── components/      # System-specific components
│   ├── pages/          # Landing, Signup, etc.
│   └── layouts/        # System layout wrapper
│
├── tenant/             # Salon customer-facing pages
│   ├── components/     # Tenant-specific components
│   ├── pages/          # Booking, Services, Products, etc.
│   └── layouts/        # Tenant layout wrapper
│
├── admin/              # Admin dashboard
│   ├── components/     # Admin-specific components
│   ├── pages/          # Dashboard, Settings, etc.
│   └── layouts/        # Admin layout wrapper
│
└── shared/             # Shared across all contexts
    ├── components/     # UI library (Card, Button, etc.)
    ├── hooks/          # Custom hooks
    ├── utils/          # Helper functions
    ├── contexts/       # Global contexts
    └── lib/            # API clients, constants
```

## File Migration Map

### SYSTEM (Platform/Marketing)

**From** → **To**

**Pages:**

- `features/landing/LandingPage.jsx` → `system/pages/LandingPage.jsx`
- `pages/TenantSignup.jsx` → `system/pages/SignupPage.jsx`
- `admin/pages/Login.jsx` (admin login) → Keep in admin/
- `features/auth/LoginPage.jsx` (user login) → `tenant/pages/LoginPage.jsx`
- `features/auth/RegisterPage.jsx` → `tenant/pages/RegisterPage.jsx`

**Components:**

- `components/Footer.jsx` → `system/components/Footer.jsx`
- System navigation (from routes.jsx) → Extract to `system/layouts/SystemLayout.jsx`

### TENANT (Salon Customer Pages)

**From** → **To**

**Pages:**

- `features/salon/SalonLanding.jsx` → `tenant/pages/SalonLanding.jsx`
- `features/salon/SalonDetails.jsx` → `tenant/pages/SalonDetails.jsx`
- `features/services/ServicesPage.jsx` → `tenant/pages/ServicesPage.jsx`
- `features/specialists/BeauticianSelectionPage.jsx` → `tenant/pages/BeauticiansPage.jsx`
- `features/availability/TimeSlots.jsx` → `tenant/pages/TimeSlotsPage.jsx`
- `features/checkout/CheckoutPage.jsx` → `tenant/pages/CheckoutPage.jsx`
- `features/booking/ConfirmationPage.jsx` → `tenant/pages/ConfirmationPage.jsx`
- `features/checkout/SuccessPage.jsx` → `tenant/pages/BookingSuccessPage.jsx`
- `features/checkout/CancelPage.jsx` → `tenant/pages/BookingCancelPage.jsx`
- `features/products/ProductsPage.jsx` → `tenant/pages/ProductsPage.jsx`
- `features/products/ProductDetailPage.jsx` → `tenant/pages/ProductDetailPage.jsx`
- `features/orders/ProductCheckoutPage.jsx` → `tenant/pages/ProductCheckoutPage.jsx`
- `features/orders/OrderSuccessPage.jsx` → `tenant/pages/OrderSuccessPage.jsx`
- `features/orders/ShopSuccessPage.jsx` → `tenant/pages/ShopSuccessPage.jsx`
- `features/orders/ShopCancelPage.jsx` → `tenant/pages/ShopCancelPage.jsx`
- `features/profile/ProfilePage.jsx` → `tenant/pages/ProfilePage.jsx`
- `features/profile/ProfileEditPage.jsx` → `tenant/pages/ProfileEditPage.jsx`
- `features/about/AboutUsPage.jsx` → `tenant/pages/AboutUsPage.jsx`
- `features/blog/BlogPage.jsx` → `tenant/pages/BlogPage.jsx`
- `features/blog/BlogPostPage.jsx` → `tenant/pages/BlogPostPage.jsx`
- `features/faq/FAQPage.jsx` → `tenant/pages/FAQPage.jsx`

**Components:**

- `components/TenantFooter.jsx` → `tenant/components/Footer.jsx`
- `components/TenantApp.jsx` → `tenant/layouts/TenantApp.jsx`
- `features/cart/CartSidebar.jsx` → `tenant/components/CartSidebar.jsx`
- `features/cart/cartSlice.js` → `tenant/state/cartSlice.js`
- Customer navigation (from routes.jsx) → Extract to `tenant/layouts/TenantLayout.jsx`

### ADMIN (Dashboard)

**Pages already in admin/pages/** - Keep them there

- Dashboard, Appointments, Orders, Services, Staff, etc.

**Move to admin/components/:**

- Admin-specific form components
- Admin-specific UI elements

**Keep:**

- `admin/AdminLayout.jsx` → `admin/layouts/AdminLayout.jsx`

### SHARED (Reusable across all contexts)

**Components:**

- `components/ui/*` → `shared/components/ui/*`
- `components/seo/*` → `shared/components/seo/*`
- `components/forms/*` → `shared/components/forms/*`
- `components/ErrorBoundary.jsx` → `shared/components/ErrorBoundary.jsx`
- `components/ScrollToTop.jsx` → `shared/components/ScrollToTop.jsx`
- `components/ProtectedRoute.jsx` → `shared/components/ProtectedRoute.jsx`
- `components/CurrencySelector.jsx` → `shared/components/CurrencySelector.jsx`
- `components/DateTimePicker.jsx` → `shared/components/DateTimePicker.jsx`
- `components/CountdownOverlay.jsx` → `shared/components/CountdownOverlay.jsx`
- `components/ServiceVariantSelector.jsx` → `shared/components/ServiceVariantSelector.jsx`

**Hooks:**

- `hooks/*` → `shared/hooks/*`

**Utils:**

- `utils/*` → `shared/utils/*`

**Contexts:**

- `contexts/*` → `shared/contexts/*`
- `app/AuthContext.jsx` → `shared/contexts/AuthContext.jsx`

**Lib:**

- `lib/*` → `shared/lib/*`

## Implementation Steps

1. ✅ Create directory structure
2. Move System files
3. Move Tenant files
4. Reorganize Admin files
5. Move Shared files
6. Update all import paths in routes.jsx
7. Update all import paths across moved files
8. Test each section (system, tenant, admin)
9. Delete old empty directories
10. Update documentation

## Import Path Patterns

**Before:**

```javascript
import Card from "../../components/ui/Card";
import { useTenant } from "../../contexts/TenantContext";
import LandingPage from "../features/landing/LandingPage";
```

**After:**

```javascript
import Card from "@shared/components/ui/Card";
import { useTenant } from "@shared/contexts/TenantContext";
import LandingPage from "@system/pages/LandingPage";
```

Note: Path aliases can be configured in vite.config.js for cleaner imports.
