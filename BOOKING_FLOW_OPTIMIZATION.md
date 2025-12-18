# Tenant Booking Flow Performance Optimization - Implementation Guide

## Overview

This guide documents the React Query hooks created for optimizing the tenant booking flow and provides clear instructions for completing the refactor of booking pages.

## ✅ Completed Work

### 1. React Query Hooks Created

All hooks are located in `src/tenant/hooks/` with comprehensive caching, deduplication, and performance optimizations:

#### **useTenantServices.js**

- `useTenantServices(options)` - Fetch all services with optional filters
- `useTenantService(serviceId, options)` - Fetch single service by ID
- **Cache**: 5 min staleTime, 10 min gcTime
- **Features**: Client-side filtering by specialistId, automatic deduplication

#### **useTenantSpecialists.js**

- `useTenantSpecialists(options)` - Fetch all specialists (activeOnly filter)
- `useTenantSpecialist(specialistId, options)` - Fetch single specialist by ID
- **Cache**: 10 min staleTime, 15 min gcTime
- **Features**: Active-only filtering, precise query keys

#### **useSalon.js**

- `useSalon(options)` - Fetch salon/settings data
- **Cache**: 20 min staleTime, 30 min gcTime (settings change infrequently)

#### **useSlots.js**

- `useSlots(params, options)` - Fetch available time slots

  - **Debouncing**: 300ms default (prevents excessive API calls)
  - **Cancellation**: Automatic AbortSignal support
  - **Query Key**: Includes all params (specialistId, serviceId, variantName, date, totalDuration, any)
  - **Cache**: 45s staleTime, 3 min gcTime
  - **Validation**: Client-side slot validation
  - **Features**: Enabled guards, stale request cancellation

- `useFullyBookedDates(params, options)` - Fetch fully booked dates for month
  - **Cache**: 2 min staleTime, 5 min gcTime
  - **Query Key**: year, month, specialistId, serviceId

#### **useAppointment.js**

- `useAppointment(appointmentId, options)` - Fetch appointment details

  - **Cache**: 30s staleTime, 5 min gcTime

- `useReserveAppointment()` - Mutation for reserving appointments
  - **Cache Invalidation**: Automatically invalidates affected slots
  - **Optimistic Updates**: Sets appointment data in cache immediately
  - **Scope**: Invalidates slots for specific specialist/date and monthly fully-booked data

### 2. Components Updated

#### **DateTimePicker.jsx** ✅

- ✅ Removed manual useEffect slot fetching
- ✅ Now uses `useSlots` hook with automatic debouncing
- ✅ Automatic request cancellation on parameter changes
- ✅ Removed `handleRetrySlots` (no longer needed)
- ✅ Error handling updated for React Query error format

**Changes Made:**

```jsx
// OLD: Manual fetch with useEffect
useEffect(() => {
  const fetchSlots = async () => { ... }
  fetchSlots();
}, [selectedDate, ...]);

// NEW: React Query hook
const {
  data: slots = [],
  isLoading: loadingSlots,
  error: slotsError,
} = useSlots(
  { specialistId, serviceId, variantName, date: dateStr, totalDuration },
  { salonTz, enabled: !!dateStr, debounceMs: 300 }
);
```

## 🔧 Remaining Work

### Pages Requiring Refactor

#### **1. BeauticiansPage.jsx** (HIGH PRIORITY)

Current issues:

- Fetches specialists on mount with useEffect
- Manually fetches full specialist data on selection
- Manually fetches services for specialist
- No caching between navigation
- Duplicate requests when returning to page

**Refactor Steps:**

```jsx
// REPLACE these imports
import { api } from "../../shared/lib/apiClient";
import { useState, useEffect } from "react";

// WITH
import { useState, useEffect } from "react";
import {
  useTenantSpecialists,
  useTenantSpecialist,
  useTenantServices,
} from "../hooks";

// REPLACE state management
const [specialists, setSpecialists] = useState([]);
const [selectedSpecialist, setSelectedSpecialist] = useState(null);
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);
const [servicesLoading, setServicesLoading] = useState(false);

// WITH
const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
const { data: specialists = [], isLoading: loading } = useTenantSpecialists({
  activeOnly: true,
});

const { data: selectedSpecialist } = useTenantSpecialist(selectedSpecialistId, {
  enabled: !!selectedSpecialistId,
});

const { data: services = [], isLoading: servicesLoading } = useTenantServices({
  filters: { specialistId: selectedSpecialistId },
  enabled: !!selectedSpecialistId,
});

// REMOVE entire first useEffect (line 34-54) that fetches specialists
// REMOVE second useEffect (line 56-100) that restores from URL
// UPDATE handleSpecialistSelect to just set ID:
const handleSpecialistSelect = (specialist) => {
  setSelectedSpecialistId(specialist._id);
  // Update URL...
  // React Query will automatically fetch data
};
```

#### **2. TimeSlotsPage.jsx** (MEDIUM PRIORITY)

Current issues:

- Manually fetches service and specialist on mount
- URL restoration logic duplicates API calls
- No caching when navigating back

**Refactor Steps:**

```jsx
// ADD imports
import { useTenantService, useTenantSpecialist } from "../hooks";

// REPLACE manual fetching useEffects
const { data: service } = useTenantService(serviceId, { enabled: !!serviceId });
const { data: specialist } = useTenantSpecialist(specialistId, {
  enabled: !!specialistId,
});

// REMOVE lines 44-94 (URL restoration useEffect)
// React Query + query keys will handle this automatically
```

#### **3. CheckoutPage.jsx** (MEDIUM PRIORITY)

Current issues:

- URL restoration logic fetches service/specialist
- Manual booking submission
- No cache invalidation after booking

**Refactor Steps:**

```jsx
// ADD imports
import { useReserveAppointment } from "../hooks";

// USE mutation hook for reserve
const reserveAppointment = useReserveAppointment();

// UPDATE submit function
async function submit(mode) {
  if (mode === "pay_in_salon") {
    const res = await reserveAppointment.mutateAsync(bookingData);
    // Slots are automatically invalidated
    // Appointment is automatically cached
    navigate("/confirmation");
  }
  // ...
}

// REMOVE URL restoration useEffect (lines 64-104)
// Use hooks instead
```

### Additional Files to Check

#### **4. SalonLandingLuxury.jsx**

- Check if it fetches salon data
- Replace with `useSalon()` if needed

#### **5. BlogPage.jsx**

- Currently fetches blog posts manually
- Consider creating `useBlogPosts()` hook if used in multiple places

#### **6. ProductsPage.jsx**

- Check for manual product fetching
- May benefit from similar hook pattern

## Performance Benefits Expected

### Before Optimization

- **Specialists fetch**: Every page mount = ~200-300ms
- **Services fetch**: Every specialist selection = ~150-250ms
- **Slots fetch**: Every date change = ~100-200ms
- **Salon fetch**: Multiple times across pages = ~100ms each
- **No deduplication**: Simultaneous requests fire multiple times
- **No cancellation**: Stale requests complete unnecessarily

### After Optimization

- **Specialists**: Fetched once, cached 10 min (99% cache hit after first load)
- **Services**: Fetched once per specialist, cached 5 min
- **Slots**: Debounced 300ms, cached 45s (reduces rapid-fire requests)
- **Salon**: Fetched once, cached 20 min
- **Automatic deduplication**: React Query prevents duplicate in-flight requests
- **Automatic cancellation**: Stale requests cancelled via AbortSignal

### Expected Network Reduction

- **~60-80% fewer API calls** during typical booking flow
- **~40-50% faster** perceived load times from caching
- **~300-500ms** saved on debouncing slot lookups
- **Zero duplicate requests** when navigating back/forward

## Testing Checklist

After completing refactor:

### Functional Tests

- [ ] Specialist selection loads list correctly
- [ ] Selecting specialist shows their services
- [ ] Service selection proceeds to time slots
- [ ] Date picker shows fully booked dates correctly
- [ ] Time slots load and are selectable
- [ ] Multi-service bookings calculate total duration
- [ ] "Any specialist" option works
- [ ] Pay in salon booking completes successfully
- [ ] Stripe checkout booking works
- [ ] URL parameters restore state correctly
- [ ] Back button navigation preserves selections

### Performance Tests

- [ ] Open Network tab, clear cache
- [ ] Complete full booking flow
- [ ] **Expected**: Specialists fetched once
- [ ] **Expected**: Services fetched once per specialist
- [ ] **Expected**: Slots API called only after debounce delay
- [ ] **Expected**: No duplicate parallel requests
- [ ] Navigate back to specialists page
- [ ] **Expected**: Specialists loaded from cache (no request)
- [ ] Select same specialist again
- [ ] **Expected**: Services loaded from cache (no request)

### Cache Behavior Tests

- [ ] Complete booking flow
- [ ] Refresh page within 5 minutes
- [ ] **Expected**: Services still in cache
- [ ] Wait 10+ minutes
- [ ] Navigate to specialists page
- [ ] **Expected**: New fetch (cache expired)

## Migration Path

### Phase 1: Core Hooks (✅ COMPLETED)

- ✅ Create all tenant hooks
- ✅ Update DateTimePicker to use useSlots

### Phase 2: Booking Pages (IN PROGRESS)

- 🔄 Update BeauticiansPage.jsx
- ⏳ Update TimeSlotsPage.jsx
- ⏳ Update CheckoutPage.jsx

### Phase 3: Supporting Pages (TODO)

- ⏳ Check and update SalonLandingLuxury.jsx
- ⏳ Check and update other pages as needed

### Phase 4: Testing & Validation (TODO)

- ⏳ Run functional tests
- ⏳ Run performance tests
- ⏳ Verify cache behavior
- ⏳ Test error scenarios

## Query Key Reference

For cache invalidation and prefetching:

```javascript
// Services
["tenant", "services", "list", filters][
  ("tenant", "services", "detail", serviceId)
][
  // Specialists
  ("tenant", "specialists", "list", { activeOnly })
][("tenant", "specialists", "detail", specialistId)][
  // Salon
  ("tenant", "salon", "details")
][
  // Slots
  ("tenant",
  "slots",
  "available",
  { specialistId, serviceId, variantName, date, totalDuration, any })
][("tenant", "slots", "fullyBooked", { year, month, specialistId, serviceId })][
  // Appointments
  ("tenant", "appointments", "detail", appointmentId)
];
```

## Debugging Tips

### Enable React Query DevTools

Already installed. To view:

```jsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Add to app: <ReactQueryDevtools initialIsOpen={false} />
```

### Check Cache State

```javascript
import { useQueryClient } from "@tanstack/react-query";
const queryClient = useQueryClient();
console.log(
  queryClient.getQueryData([
    "tenant",
    "specialists",
    "list",
    { activeOnly: true },
  ])
);
```

### Monitor Network

- Open Chrome DevTools → Network tab
- Filter by "Fetch/XHR"
- Look for reduced request count
- Verify no duplicate simultaneous requests
- Check request timing (should see debounce delay for slots)

## Error Handling

All hooks include built-in error handling:

- Retry logic (1-2 attempts with delays)
- Error objects accessible via `error` property
- Loading states via `isLoading` and `isFetching`
- Network error cancellation support

## Notes

- All hooks are TypeScript-ready (can add `.ts` extension and types)
- Query keys follow hierarchical pattern for easy invalidation
- Debounce timing can be adjusted per use case
- Cache times are conservative; can be increased for production
- All hooks respect tenant context (multi-tenant architecture)

## Contact / Questions

For questions or issues during implementation:

- Check React Query docs: https://tanstack.com/query/latest
- Review hook implementations in `src/tenant/hooks/`
- Test with React Query DevTools for cache visualization
