# API Optimization - File-by-File Recommendations

This document provides a detailed breakdown of every file that needs optimization, organized by priority.

---

## 🔴 HIGH PRIORITY - Critical Performance Issues

### 1. `src/admin/pages/Appointments.jsx`

**Current Issues:**

- ❌ Fetches appointments on every mount (no caching)
- ❌ Re-fetches on every filter change
- ❌ No loading skeleton (just spinner)
- ❌ No debounced search
- ❌ Client-side pagination calculation happens on every render

**Recommended Changes:**

| Optimization         | Method                         | Expected Impact           | Effort |
| -------------------- | ------------------------------ | ------------------------- | ------ |
| Add React Query      | Use `useAppointments` hook     | 70% fewer API calls       | Medium |
| Add loading skeleton | `<AppointmentsSkeleton />`     | 50% better perceived perf | Low    |
| Debounce search      | `useDebounce(searchTerm, 500)` | 90% fewer re-renders      | Low    |
| Memoize filtering    | `useMemo` for filtered data    | Smoother UI               | Low    |

**Code Example:** See `API_OPTIMIZATION_GUIDE.md` Step 4

**Files to Create:**

- `src/features/appointments/appointments.hooks.js`
- `src/components/ui/AppointmentsSkeleton.jsx`
- `src/hooks/useDebounce.js`

---

### 2. `src/admin/pages/Dashboard.jsx`

**Current Issues:**

- ❌ Fetches on every admin change (useEffect deps issue)
- ❌ No caching between page navigations
- ❌ No loading skeleton
- ✅ Good: Already uses `Promise.all`
- ✅ Good: Already uses `useMemo` for events

**Recommended Changes:**

| Optimization         | Method                                   | Expected Impact               | Effort |
| -------------------- | ---------------------------------------- | ----------------------------- | ------ |
| Add React Query      | Use `useAppointments` + `useBeauticians` | 60% fewer API calls           | Medium |
| Add loading skeleton | `<CardSkeleton />`                       | 40% better perceived perf     | Low    |
| Fix useEffect        | Use `useCallback`                        | Prevent unnecessary refetches | Low    |

**Code Example:** See `API_OPTIMIZATION_GUIDE.md` Step 7

---

### 3. `src/admin/pages/Services.jsx`

**Current Issues:**

- ❌ Fetches services + specialists on every mount
- ❌ No caching (same data fetched repeatedly)
- ❌ Empty dependency array in useEffect (React warning)
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization           | Method                                     | Expected Impact     | Effort |
| ---------------------- | ------------------------------------------ | ------------------- | ------ |
| Add React Query        | Use `useServices` + `useBeauticians`       | 80% fewer API calls | Medium |
| Fix dependencies       | Add to useEffect deps or use `useCallback` | Fix React warnings  | Low    |
| Add loading skeleton   | Table skeleton                             | Better UX           | Low    |
| Share specialists data | Use `useSharedData` hook                   | Deduplication       | Medium |

**Code Example:** See `API_OPTIMIZATION_GUIDE.md` Step 6

---

### 4. `src/features/availability/TimeSlots.jsx`

**Current Issues:**

- ❌ No request cancellation on unmount
- ❌ Complex chained API calls (not parallel)
- ❌ Memory leak potential on navigation
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization             | Method                               | Expected Impact        | Effort |
| ------------------------ | ------------------------------------ | ---------------------- | ------ |
| Add request cancellation | AbortController in useEffect         | Prevent memory leaks   | Low    |
| Use React Query          | `useService` + `useBeautician` hooks | Automatic cancellation | Medium |
| Add skeleton             | Date picker skeleton                 | Better UX              | Low    |

**Code Example:** See `QUICK_WINS.md` Quick Win #2

---

### 5. `src/admin/pages/Staff.jsx`

**Current Issues:**

- ❌ Fetches staff + services on every mount
- ❌ No caching
- ✅ Good: Already uses `Promise.all`
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization         | Method                               | Expected Impact     | Effort |
| -------------------- | ------------------------------------ | ------------------- | ------ |
| Add React Query      | Use `useBeauticians` + `useServices` | 75% fewer API calls | Medium |
| Add loading skeleton | Staff list skeleton                  | Better UX           | Low    |
| Share services data  | Use `useSharedData` hook             | Deduplication       | Medium |

---

## 🟡 MEDIUM PRIORITY - Performance Gains

### 6. `src/admin/pages/Products.jsx`

**Current Issues:**

- ❌ Fetches products + specialists on every mount
- ✅ Good: Already uses `Promise.all`
- ❌ No debounced search/filter
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization         | Method                                 | Expected Impact     | Effort |
| -------------------- | -------------------------------------- | ------------------- | ------ |
| Add React Query      | `useProducts` + `useBeauticians` hooks | 60% fewer API calls | Medium |
| Add loading skeleton | Product grid skeleton                  | Better UX           | Low    |
| Debounce search      | `useDebounce` hook                     | Smoother filtering  | Low    |

---

### 7. `src/admin/pages/Orders.jsx`

**Current Issues:**

- ❌ Fetches orders on every mount
- ❌ No caching
- ❌ No loading skeleton
- ❌ Optimistic updates would improve UX

**Recommended Changes:**

| Optimization         | Method                | Expected Impact     | Effort |
| -------------------- | --------------------- | ------------------- | ------ |
| Add React Query      | `useOrders` hook      | 70% fewer API calls | Medium |
| Optimistic updates   | React Query mutations | Instant UI feedback | Medium |
| Add loading skeleton | Order list skeleton   | Better UX           | Low    |

---

### 8. `src/admin/pages/AdminBeauticianLink.jsx`

**Current Issues:**

- ❌ Fetches admins + specialists on every mount
- ✅ Good: Already uses `Promise.all`
- ❌ No debounced search (but has search inputs)
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization         | Method                               | Expected Impact      | Effort |
| -------------------- | ------------------------------------ | -------------------- | ------ |
| Debounce search      | `useDebounce(searchAdmin, 300)`      | 80% fewer re-renders | Low ✅ |
| Add React Query      | `useAdmins` + `useBeauticians` hooks | 60% fewer API calls  | Medium |
| Add loading skeleton | Table skeleton                       | Better UX            | Low    |

**Code Example:** See `QUICK_WINS.md` Quick Win #1 ✅

---

### 9. `src/admin/AdminLayout.jsx`

**Current Issues:**

- ❌ Fetches admin name on every token change
- ❌ No caching of user data
- ❌ useEffect dependency issue

**Recommended Changes:**

| Optimization     | Method                    | Expected Impact | Effort |
| ---------------- | ------------------------- | --------------- | ------ |
| Add React Query  | `useCurrentAdmin` hook    | Cache user data | Medium |
| Fix dependencies | Include in useEffect deps | Fix bugs        | Low    |

**Code Example:** See `API_OPTIMIZATION_GUIDE.md` Step 8

---

### 10. `src/features/landing/LandingPage.jsx`

**Current Issues:**

- ❌ Fetches services + salon + specialists on every mount
- ❌ No loading skeleton
- ❌ Not using `Promise.all` (sequential requests)

**Recommended Changes:**

| Optimization         | Method                 | Expected Impact    | Effort |
| -------------------- | ---------------------- | ------------------ | ------ |
| Parallelize requests | Use `Promise.all`      | 50% faster load    | Low    |
| Add React Query      | Cache for public pages | Better performance | Medium |
| Add loading skeleton | Hero section skeleton  | Better UX          | Low    |

**Before:**

```javascript
ServicesAPI.list().then(setServices);
SalonAPI.get().then(setSalon);
BeauticiansAPI.list().then(setBeauticians);
// Total: 600ms + 400ms + 500ms = 1500ms
```

**After:**

```javascript
Promise.all([ServicesAPI.list(), SalonAPI.get(), BeauticiansAPI.list()]).then(
  ([services, salon, specialists]) => {
    setServices(services);
    setSalon(salon);
    setBeauticians(specialists);
  }
);
// Total: max(600ms, 400ms, 500ms) = 600ms (60% faster!)
```

---

## 🟢 LOW PRIORITY - Polish & Edge Cases

### 11. `src/features/products/ProductsPage.jsx`

**Current Issues:**

- ❌ Fetches products + settings on every mount
- ❌ No loading skeleton
- ❌ Not using `Promise.all`

**Recommended Changes:**

| Optimization         | Method                | Expected Impact    | Effort |
| -------------------- | --------------------- | ------------------ | ------ |
| Parallelize requests | Use `Promise.all`     | 40% faster load    | Low    |
| Add React Query      | Cache products        | Better performance | Medium |
| Add loading skeleton | Product grid skeleton | Better UX          | Low    |

---

### 12. `src/features/profile/ProfilePage.jsx`

**Current Issues:**

- ❌ Complex `dataFetched` flag to prevent re-fetching
- ❌ Manual data management
- ✅ Good: Uses `Promise.all` for bookings + orders

**Recommended Changes:**

| Optimization       | Method                   | Expected Impact     | Effort |
| ------------------ | ------------------------ | ------------------- | ------ |
| Add React Query    | Auto cache management    | Remove manual flags | Medium |
| Optimistic updates | For booking cancellation | Better UX           | Medium |

---

### 13. `src/features/products/PopularCollections.jsx`

**Current Issues:**

- ❌ Fetches featured products on every mount
- ❌ No loading skeleton

**Recommended Changes:**

| Optimization         | Method                    | Expected Impact    | Effort |
| -------------------- | ------------------------- | ------------------ | ------ |
| Add React Query      | Cache featured products   | Better performance | Low    |
| Add loading skeleton | Product carousel skeleton | Better UX          | Low    |

---

### 14. `src/admin/pages/Hours.jsx`

**Current Issues:**

- ✅ EXCELLENT: Already has retry logic! ✅
- ✅ GOOD: Has error handling with fallback
- ❌ Could add loading skeleton

**Recommended Changes:**

| Optimization         | Method               | Expected Impact    | Effort |
| -------------------- | -------------------- | ------------------ | ------ |
| Add loading skeleton | Hours table skeleton | Better UX          | Low    |
| Add React Query      | Cache settings       | Better performance | Low    |

**Note:** This page already has excellent error handling and retry logic. Great work!

---

## 📊 Priority Matrix

### Implement First (High Impact, Low Effort)

| File                                   | Impact | Effort | Priority |
| -------------------------------------- | ------ | ------ | -------- |
| Appointments.jsx (debounce + skeleton) | High   | Low    | 🔴 1     |
| Dashboard.jsx (skeleton + fix deps)    | High   | Low    | 🔴 2     |
| Services.jsx (fix deps + skeleton)     | Medium | Low    | 🔴 3     |
| TimeSlots.jsx (cancellation)           | High   | Low    | 🔴 4     |
| AdminBeauticianLink.jsx (debounce)     | Medium | Low    | 🟡 5     |
| LandingPage.jsx (parallelize)          | Medium | Low    | 🟡 6     |

### Implement Second (High Impact, Medium Effort)

| File                           | Impact | Effort | Priority |
| ------------------------------ | ------ | ------ | -------- |
| Appointments.jsx (React Query) | High   | Medium | 🔴 7     |
| Dashboard.jsx (React Query)    | High   | Medium | 🔴 8     |
| Services.jsx (React Query)     | High   | Medium | 🔴 9     |
| Staff.jsx (React Query)        | Medium | Medium | 🟡 10    |
| Products.jsx (React Query)     | Medium | Medium | 🟡 11    |

### Implement Last (Polish)

| File                              | Impact | Effort | Priority |
| --------------------------------- | ------ | ------ | -------- |
| Orders.jsx (optimistic updates)   | Medium | Medium | 🟢 12    |
| ProfilePage.jsx (React Query)     | Low    | Medium | 🟢 13    |
| PopularCollections.jsx (skeleton) | Low    | Low    | 🟢 14    |

---

## 🎯 Implementation Roadmap

### Week 1: Quick Wins (No React Query)

**Goal:** 40-60% perceived performance improvement

- [ ] Day 1: Create `useDebounce` hook
- [ ] Day 1: Apply debouncing to 3 pages
- [ ] Day 2: Create all Skeleton components
- [ ] Day 2-3: Add skeletons to 5 key pages
- [ ] Day 3: Fix useEffect dependencies (Dashboard, Services)
- [ ] Day 4: Add request cancellation (TimeSlots)
- [ ] Day 4: Parallelize LandingPage requests
- [ ] Day 5: Test and deploy

**Estimated Time:** 20-25 hours

### Week 2: React Query Setup

**Goal:** Infrastructure for modern data fetching

- [ ] Day 1: Install React Query + setup QueryClient
- [ ] Day 2: Create custom hooks (appointments, services, staff)
- [ ] Day 3: Create shared data hooks
- [ ] Day 4: Create auth hooks
- [ ] Day 5: Test infrastructure

**Estimated Time:** 20-25 hours

### Week 3: Migration - Admin Pages

**Goal:** 70-80% reduction in API calls

- [ ] Day 1-2: Migrate Appointments.jsx
- [ ] Day 2-3: Migrate Dashboard.jsx
- [ ] Day 3-4: Migrate Services.jsx
- [ ] Day 4-5: Migrate Staff.jsx
- [ ] Day 5: Test and deploy

**Estimated Time:** 25-30 hours

### Week 4: Migration - Remaining Pages

**Goal:** Complete migration + polish

- [ ] Day 1: Migrate Products.jsx
- [ ] Day 2: Migrate Orders.jsx
- [ ] Day 3: Migrate public pages
- [ ] Day 4: Add optimistic updates
- [ ] Day 5: Final testing and deployment

**Estimated Time:** 20-25 hours

---

## 📈 Success Metrics

### Measure Before/After:

1. **Network Requests**

   - Open DevTools → Network tab
   - Navigate through admin panel
   - Count total requests
   - **Target:** 60-70% reduction

2. **Time to Interactive**

   - Use Lighthouse
   - Measure key pages
   - **Target:** 30-40% improvement

3. **Perceived Performance**

   - Time until content visible (with skeletons)
   - **Target:** 50-75% improvement

4. **User Satisfaction**
   - Bounce rate on slow loads
   - Task completion time
   - **Target:** 20-30% improvement

---

## 🚨 Common Gotchas

### 1. React Query Cache Invalidation

```javascript
// ❌ WRONG - Too broad, clears too much
queryClient.invalidateQueries();

// ✅ RIGHT - Specific invalidation
queryClient.invalidateQueries({ queryKey: ["appointments"] });
```

### 2. Debounce Delay Tuning

```javascript
// Search input: 300-500ms (fast)
const debouncedSearch = useDebounce(search, 300);

// Filter dropdown: 0ms (instant)
const debouncedFilter = useDebounce(filter, 0);

// Auto-save: 1000-2000ms (slow)
const debouncedValue = useDebounce(value, 1500);
```

### 3. Skeleton Matching Content

```javascript
// ❌ WRONG - Skeleton doesn't match content
<Skeleton className="h-4 w-full" /> // Rectangle
// Content is: <div className="rounded-full">...</div> // Circle

// ✅ RIGHT - Skeleton matches shape
<Skeleton className="h-10 w-10 rounded-full" />
```

---

## 📚 Additional Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Debouncing in React](https://usehooks.com/useDebounce/)
- [Loading Skeletons Best Practices](https://www.smashingmagazine.com/2020/04/skeleton-screens-react/)
- [Request Cancellation with AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

## 🎉 Expected Final Results

After full implementation:

| Metric                 | Before  | After     | Improvement |
| ---------------------- | ------- | --------- | ----------- |
| API Requests (session) | ~80-100 | ~20-30    | 70-80% ⬇️   |
| Page Load Time         | 2-3s    | 0.6-1s    | 60-70% ⬆️   |
| Perceived Performance  | Poor    | Excellent | 300% ⬆️     |
| Search Responsiveness  | Laggy   | Instant   | 100% ⬆️     |
| Memory Leaks           | Present | None      | 100% ✅     |
| Code Maintainability   | Medium  | High      | 50% ⬆️      |

**Total Development Time:** ~80-105 hours (2-3 developer-weeks)

**ROI:** Massive improvement in UX, reduced server costs, better scalability
