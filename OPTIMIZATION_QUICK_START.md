# 🚀 Booking Flow Optimization - Quick Start

## ✅ What's Done

**All React Query hooks created and working:**
- ✅ `useTenantServices()` - 5min cache
- ✅ `useTenantSpecialists()` - 10min cache  
- ✅ `useSalon()` - 20min cache
- ✅ `useSlots()` - 45s cache + 300ms debounce
- ✅ `useAppointment()` + `useReserveAppointment()`
- ✅ DateTimePicker updated to use hooks

## 🔧 Next Steps (Priority Order)

### 1️⃣ BeauticiansPage.jsx (30 min)

**Replace lines 1-7:**
```jsx
import { useState, useEffect } from "react";
import { api } from "../../shared/lib/apiClient";
// ... other imports

// WITH:
import { useState } from "react";
import { useTenantSpecialists, useTenantSpecialist, useTenantServices } from "../hooks";
// ... other imports
```

**Replace lines 20-32 (state):**
```jsx
const [specialists, setSpecialists] = useState([]);
const [selectedSpecialist, setSelectedSpecialist] = useState(null);
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);
const [servicesLoading, setServicesLoading] = useState(false);

// WITH:
const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
const { data: specialists = [], isLoading: loading } = useTenantSpecialists({ activeOnly: true });
const { data: selectedSpecialist } = useTenantSpecialist(selectedSpecialistId, { enabled: !!selectedSpecialistId });
const { data: services = [], isLoading: servicesLoading } = useTenantServices({
  filters: { specialistId: selectedSpecialistId },
  enabled: !!selectedSpecialistId,
});
```

**Delete lines 34-100:**
- Remove both useEffect blocks (fetching specialists, URL restoration)

**Simplify handleSpecialistSelect (lines 104-176):**
```jsx
const handleSpecialistSelect = (specialist) => {
  setSelectedSpecialistId(specialist._id);
  
  // Update URL
  const params = new URLSearchParams({ selected: specialist._id });
  const serviceParam = searchParams.get("service");
  const variantParam = searchParams.get("variant");
  if (serviceParam) params.set("service", serviceParam);
  if (variantParam) params.set("variant", variantParam);
  navigate(`/salon/${tenant?.slug}/specialists?${params.toString()}`, { replace: true });
  
  // React Query will automatically fetch specialist details and services
};
```

### 2️⃣ TimeSlotsPage.jsx (15 min)

**Add imports:**
```jsx
import { useTenantService, useTenantSpecialist } from "../hooks";
```

**Add after line 43:**
```jsx
const { data: service } = useTenantService(serviceId, { enabled: !!serviceId });
const { data: specialist } = useTenantSpecialist(specialistId, { enabled: !!specialistId });
```

**Delete lines 44-94:**
- Remove URL restoration useEffect
- Variables `service` and `specialist` now come from hooks

### 3️⃣ CheckoutPage.jsx (20 min)

**Add imports:**
```jsx
import { useReserveAppointment } from "../hooks";
```

**Add after line 63:**
```jsx
const reserveAppointment = useReserveAppointment();
```

**Update submit function (line 208):**
```jsx
if (mode === "pay_in_salon") {
  const res = await reserveAppointment.mutateAsync(bookingData);
  if (res?.appointmentId) dispatch(setAppointmentId(res.appointmentId));
  navigate("/confirmation");
}
```

**Delete lines 64-104:**
- Remove URL restoration useEffect

## 📊 Expected Results

### Before
- 🔴 Specialists fetched every mount
- 🔴 Services fetched every selection
- 🔴 Slots fetched on every keystroke
- 🔴 No deduplication
- 🔴 No cancellation

### After  
- ✅ Specialists cached 10min
- ✅ Services cached 5min
- ✅ Slots debounced 300ms
- ✅ Automatic deduplication
- ✅ Automatic cancellation
- ✅ **60-80% fewer API calls**

## 🧪 Quick Test

1. Open Network tab
2. Navigate to specialists page
3. Select specialist → Select service → Pick date
4. **Count API calls** (should see ~3-4 instead of 10-15)
5. Go back, select same specialist
6. **Verify NO new API calls** (loaded from cache)

## 📁 Files Created

- `src/tenant/hooks/useTenantServices.js`
- `src/tenant/hooks/useTenantSpecialists.js`
- `src/tenant/hooks/useSalon.js`
- `src/tenant/hooks/useSlots.js`
- `src/tenant/hooks/useAppointment.js`
- `src/tenant/hooks/index.js`
- `BOOKING_FLOW_OPTIMIZATION.md` (full guide)

## 🔍 Debug Commands

**View cache:**
```javascript
import { useQueryClient } from '@tanstack/react-query';
const qc = useQueryClient();
console.log(qc.getQueryState(['tenant', 'specialists', 'list', { activeOnly: true }]));
```

**Enable DevTools:**
```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Add to main.jsx: <ReactQueryDevtools />
```
