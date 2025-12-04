# API Optimization Implementation Checklist

Track your progress as you implement the recommended optimizations.

---

## 📋 Phase 1: Quick Wins (No React Query)

**Goal:** 40-60% perceived performance improvement  
**Estimated Time:** 20-25 hours  
**Priority:** 🔴 HIGH

### Setup & Infrastructure

- [ ] Create `src/hooks/useDebounce.js`
  - [ ] Copy code from `QUICK_WINS.md` Quick Win #1
  - [ ] Test with simple example
  - [ ] Verify 300-500ms delay works

- [ ] Create Skeleton Components
  - [ ] `src/components/ui/Skeleton.jsx` - Base skeleton component
  - [ ] `src/components/ui/TableSkeleton.jsx` - Table skeleton
  - [ ] `src/components/ui/CardSkeleton.jsx` - Card skeleton
  - [ ] `src/components/ui/AppointmentsSkeleton.jsx` - Appointments specific
  - [ ] Test all variants render correctly

- [ ] Create Error Components
  - [ ] `src/components/ui/ErrorDisplay.jsx` - Enhanced error display
  - [ ] `src/components/ui/SlowRequestWarning.jsx` - Timeout warning
  - [ ] Test error states

### File Modifications

#### 🔴 Critical Files (Do First)

- [ ] **`src/admin/pages/Appointments.jsx`**
  - [ ] Add `useDebounce` for search input
  - [ ] Replace loading spinner with `<AppointmentsSkeleton />`
  - [ ] Add `useMemo` for filtered appointments
  - [ ] Add `useMemo` for pagination calculation
  - [ ] Test: Type in search, verify API not called on every keystroke
  - [ ] Test: Loading shows skeleton instead of spinner

- [ ] **`src/admin/pages/Dashboard.jsx`**
  - [ ] Fix `fetchData` with `useCallback`
  - [ ] Fix useEffect dependencies
  - [ ] Add `<CardSkeleton />` for loading state
  - [ ] Test: No duplicate fetches on admin change
  - [ ] Test: Skeleton appears during load

- [ ] **`src/admin/pages/Services.jsx`**
  - [ ] Fix useEffect dependencies (add or use `useCallback`)
  - [ ] Add `<TableSkeleton />` for loading state
  - [ ] Test: No React warnings in console
  - [ ] Test: Skeleton appears during load

- [ ] **`src/features/availability/TimeSlots.jsx`**
  - [ ] Add `AbortController` for request cancellation
  - [ ] Add `isCancelled` flag
  - [ ] Return cleanup function from useEffect
  - [ ] Add skeleton for date picker
  - [ ] Test: Navigate away during load, verify no errors
  - [ ] Test: No memory leaks in Chrome DevTools

- [ ] **`src/admin/pages/Staff.jsx`**
  - [ ] Add `<TableSkeleton />` for loading state
  - [ ] Test: Skeleton appears during load

#### 🟡 Medium Priority Files

- [ ] **`src/admin/pages/AdminBeauticianLink.jsx`**
  - [ ] Add `useDebounce` for admin search
  - [ ] Add `useDebounce` for beautician search
  - [ ] Add `<TableSkeleton />` for loading states
  - [ ] Test: Search is smooth, no lag

- [ ] **`src/admin/AdminLayout.jsx`**
  - [ ] Fix fetchAdminName with proper dependencies
  - [ ] Consider moving to useCallback
  - [ ] Test: No unnecessary re-fetches

- [ ] **`src/features/landing/LandingPage.jsx`**
  - [ ] Convert to `Promise.all` (if not already)
  - [ ] Add hero section skeleton
  - [ ] Test: Faster page load

- [ ] **`src/admin/pages/Products.jsx`**
  - [ ] Add `useDebounce` for search/filter
  - [ ] Add product grid skeleton
  - [ ] Test: Smooth search experience

- [ ] **`src/admin/pages/Orders.jsx`**
  - [ ] Add `<TableSkeleton />` for loading state
  - [ ] Test: Skeleton appears during load

#### 🟢 Low Priority Files

- [ ] **`src/features/products/ProductsPage.jsx`**
  - [ ] Convert to `Promise.all` if sequential
  - [ ] Add product grid skeleton
  - [ ] Test: Faster load time

- [ ] **`src/features/products/PopularCollections.jsx`**
  - [ ] Add product carousel skeleton
  - [ ] Test: Skeleton appears during load

- [ ] **`src/admin/pages/Hours.jsx`**
  - [ ] (Optional) Add hours table skeleton
  - [ ] Note: Already has excellent retry logic ✅

### Enhanced Error Handling

- [ ] **`src/lib/apiClient.js`**
  - [ ] Add network error detection
  - [ ] Add timeout error messages
  - [ ] Add 429 rate limit handling
  - [ ] Add 503 maintenance mode handling
  - [ ] Test: Disconnect network, verify error message
  - [ ] Test: Slow 3G, verify timeout handling

### Testing Phase 1

- [ ] **Network Tab Verification**
  - [ ] Open DevTools → Network tab
  - [ ] Navigate through admin panel
  - [ ] Count API requests (should see fewer duplicates)
  - [ ] Verify AbortController cancels requests

- [ ] **Search Testing**
  - [ ] Type in search fields
  - [ ] Verify no API calls until typing stops
  - [ ] Verify smooth, lag-free experience

- [ ] **Memory Leak Testing**
  - [ ] Open Chrome DevTools → Memory tab
  - [ ] Take heap snapshot
  - [ ] Navigate through pages rapidly
  - [ ] Take another snapshot
  - [ ] Compare: Should not see growing listeners

- [ ] **Loading State Testing**
  - [ ] Throttle network to Slow 3G
  - [ ] Navigate to each page
  - [ ] Verify skeletons appear
  - [ ] Verify content layout doesn't jump

- [ ] **Error State Testing**
  - [ ] Disconnect network
  - [ ] Try to load pages
  - [ ] Verify error messages are helpful
  - [ ] Verify retry buttons work

### Deployment

- [ ] Commit changes to git
- [ ] Create PR with description of changes
- [ ] Deploy to staging environment
- [ ] Test on staging
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor error logs for issues

---

## 📋 Phase 2: React Query Migration

**Goal:** 70-80% reduction in API calls  
**Estimated Time:** 60-80 hours  
**Priority:** 🟡 MEDIUM

### Setup & Installation

- [ ] Install React Query
  ```bash
  npm install @tanstack/react-query @tanstack/react-query-devtools
  ```

- [ ] Create `src/lib/queryClient.js`
  - [ ] Copy setup from `API_OPTIMIZATION_GUIDE.md` Step 1
  - [ ] Configure default options
  - [ ] Test import works

- [ ] Update `src/main.jsx`
  - [ ] Import QueryClientProvider
  - [ ] Import ReactQueryDevtools
  - [ ] Wrap app in provider
  - [ ] Test app still runs
  - [ ] Open DevTools, verify React Query tab appears

### Custom Hooks Creation

- [ ] **`src/features/appointments/appointments.hooks.js`**
  - [ ] Define `appointmentKeys` object
  - [ ] Create `useAppointments` hook
  - [ ] Create `useAppointment` (single) hook
  - [ ] Create `useUpdateAppointmentStatus` mutation
  - [ ] Create `useCancelAppointment` mutation
  - [ ] Test hooks with simple component

- [ ] **`src/features/services/services.hooks.js`**
  - [ ] Define `servicesKeys` object
  - [ ] Create `useServices` hook
  - [ ] Create `useService` (single) hook
  - [ ] Create `useCreateService` mutation
  - [ ] Create `useUpdateService` mutation
  - [ ] Create `useDeleteService` mutation
  - [ ] Test hooks

- [ ] **`src/features/staff/staff.hooks.js`**
  - [ ] Define `beauticiansKeys` object
  - [ ] Create `useBeauticians` hook
  - [ ] Create `useBeautician` (single) hook
  - [ ] Create `useCreateBeautician` mutation
  - [ ] Create `useUpdateBeautician` mutation
  - [ ] Create `useDeleteBeautician` mutation
  - [ ] Test hooks

- [ ] **`src/features/auth/auth.hooks.js`**
  - [ ] Create `useCurrentAdmin` hook
  - [ ] Create `useLogin` mutation
  - [ ] Create `useLogout` mutation
  - [ ] Test hooks

- [ ] **`src/hooks/useSharedData.js`**
  - [ ] Create `useSharedData` hook
  - [ ] Use `useQueries` for parallel fetching
  - [ ] Test hook returns all data

### Page Migrations

#### High Priority Pages

- [ ] **`src/admin/pages/Appointments.jsx`**
  - [ ] Replace useEffect + useState with `useAppointments`
  - [ ] Replace mutations with `useUpdateAppointmentStatus`
  - [ ] Use `isLoading`, `isError`, `isFetching` states
  - [ ] Add `<ErrorDisplay />` for error state
  - [ ] Test: Verify cache works (navigate away and back)
  - [ ] Test: Verify optimistic updates work
  - [ ] Test: Open React Query DevTools, verify cache

- [ ] **`src/admin/pages/Dashboard.jsx`**
  - [ ] Replace useEffect with `useAppointments` + `useBeauticians`
  - [ ] Remove manual loading state
  - [ ] Use React Query loading states
  - [ ] Test: Verify parallel fetching
  - [ ] Test: Verify cache deduplication

- [ ] **`src/admin/pages/Services.jsx`**
  - [ ] Replace useEffect with `useServices` + `useBeauticians`
  - [ ] Replace mutations with `useCreateService`, `useDeleteService`
  - [ ] Test: Verify cache invalidation on create/delete
  - [ ] Test: Verify no duplicate requests

- [ ] **`src/admin/pages/Staff.jsx`**
  - [ ] Replace useEffect with `useBeauticians` + `useServices`
  - [ ] Replace mutations with create/update/delete hooks
  - [ ] Test: Verify cache works
  - [ ] Test: Verify mutations invalidate cache

- [ ] **`src/admin/pages/Products.jsx`**
  - [ ] Create `useProducts` hook
  - [ ] Replace useEffect with React Query
  - [ ] Test: Verify cache works

#### Medium Priority Pages

- [ ] **`src/admin/pages/Orders.jsx`**
  - [ ] Create `useOrders` hook
  - [ ] Add optimistic updates for status changes
  - [ ] Test: Verify instant UI feedback

- [ ] **`src/admin/AdminLayout.jsx`**
  - [ ] Replace fetchAdminName with `useCurrentAdmin`
  - [ ] Test: Verify cached across pages

- [ ] **`src/features/landing/LandingPage.jsx`**
  - [ ] Use `useServices`, `useSalon`, `useBeauticians` hooks
  - [ ] Test: Verify public cache works

- [ ] **`src/features/availability/TimeSlots.jsx`**
  - [ ] Replace useEffect with `useService` + `useBeautician`
  - [ ] Test: Automatic request cancellation

#### Low Priority Pages

- [ ] **`src/features/profile/ProfilePage.jsx`**
  - [ ] Create `useBookings` + `useOrders` hooks
  - [ ] Remove manual `dataFetched` flag
  - [ ] Test: Verify cache works

- [ ] **`src/features/products/ProductsPage.jsx`**
  - [ ] Use `useProducts` + `useSettings` hooks
  - [ ] Test: Verify cache works

- [ ] **`src/features/products/PopularCollections.jsx`**
  - [ ] Use `useProducts` with filters
  - [ ] Test: Verify cache works

### Testing Phase 2

- [ ] **Cache Testing**
  - [ ] Navigate between pages rapidly
  - [ ] Open React Query DevTools
  - [ ] Verify data is cached (green = fresh, yellow = stale)
  - [ ] Verify no duplicate requests in Network tab

- [ ] **Mutation Testing**
  - [ ] Create/update/delete items
  - [ ] Verify optimistic updates (instant UI feedback)
  - [ ] Verify cache invalidation (list updates after mutation)
  - [ ] Verify rollback on error

- [ ] **Background Refetch Testing**
  - [ ] Stay on page for 5+ minutes
  - [ ] Verify background refetch happens
  - [ ] Verify no loading spinner (stale-while-revalidate)

- [ ] **Offline Testing**
  - [ ] Load pages normally
  - [ ] Disconnect network
  - [ ] Navigate between pages
  - [ ] Verify cached data still displays
  - [ ] Reconnect network
  - [ ] Verify automatic refetch

- [ ] **Error Retry Testing**
  - [ ] Simulate API errors
  - [ ] Verify automatic retry (up to 2 times)
  - [ ] Verify exponential backoff delays

### Performance Verification

- [ ] **Network Requests Count**
  - [ ] Record session before migration
  - [ ] Record session after migration
  - [ ] Compare: Should see 60-80% reduction

- [ ] **Lighthouse Scores**
  - [ ] Run Lighthouse on key pages before
  - [ ] Run Lighthouse on key pages after
  - [ ] Compare: Should see 30-40% improvement

- [ ] **Real User Metrics**
  - [ ] Track page load times
  - [ ] Track time to interactive
  - [ ] Track bounce rate
  - [ ] Compare before/after

### Deployment

- [ ] Review all changes in git diff
- [ ] Create comprehensive PR
- [ ] Add screenshots of React Query DevTools
- [ ] Deploy to staging
- [ ] Thorough testing on staging
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor for 24-48 hours
- [ ] Check error logs
- [ ] Measure performance improvements

---

## 📊 Success Metrics Tracking

### Before Migration (Baseline)

Record these metrics before starting:

```
Date: _______________

Network Requests:
- Dashboard page load: _____ requests
- Full session (5 min): _____ requests
- Duplicate requests: _____ %

Page Load Times:
- Dashboard: _____ ms
- Appointments: _____ ms
- Services: _____ ms

User Experience:
- Bounce rate: _____ %
- Task completion time: _____ sec
- Support tickets (slow app): _____ /week

Server Costs:
- API requests/day: _____
- Bandwidth/month: _____ GB
- Server costs: $ _____ /month
```

### After Phase 1 (Quick Wins)

```
Date: _______________

Network Requests:
- Dashboard page load: _____ requests (_____ % change)
- Full session (5 min): _____ requests (_____ % change)
- Duplicate requests: _____ % (_____ % change)

Page Load Times:
- Dashboard: _____ ms (_____ % change)
- Appointments: _____ ms (_____ % change)
- Services: _____ ms (_____ % change)

User Experience:
- Perceived load time: _____ % improvement
- Search responsiveness: _____ % improvement
- Memory leaks: _____ (target: 0)

Notes:
_____________________________________________
_____________________________________________
```

### After Phase 2 (React Query)

```
Date: _______________

Network Requests:
- Dashboard page load: _____ requests (_____ % change from baseline)
- Full session (5 min): _____ requests (_____ % change from baseline)
- Duplicate requests: _____ % (target: < 10%)

Page Load Times:
- Dashboard: _____ ms (_____ % change from baseline)
- Appointments: _____ ms (_____ % change from baseline)
- Services: _____ ms (_____ % change from baseline)

User Experience:
- Bounce rate: _____ % (_____ % change)
- Task completion time: _____ sec (_____ % change)
- Support tickets: _____ /week (_____ % change)

Server Costs:
- API requests/day: _____ (_____ % change)
- Bandwidth/month: _____ GB (_____ % change)
- Server costs: $ _____ /month ($ _____ saved)

ROI:
- Development cost: $ _____
- Monthly savings: $ _____
- Payback period: _____ months

Notes:
_____________________________________________
_____________________________________________
```

---

## 🎯 Quick Reference

### When Stuck, Check:

1. **React Query DevTools**
   - Open DevTools → React Query tab
   - Check if query is cached (green = fresh)
   - Check if query is fetching (loading indicator)
   - Check query key structure

2. **Network Tab**
   - Are requests being duplicated?
   - Are requests being cancelled properly?
   - Are request sizes reasonable?

3. **Console**
   - Any React warnings about dependencies?
   - Any memory leak warnings?
   - Any uncaught errors?

4. **Documentation**
   - `QUICK_WINS.md` - Immediate fixes
   - `API_OPTIMIZATION_GUIDE.md` - React Query guide
   - `OPTIMIZATION_ROADMAP.md` - File-by-file details

### Common Issues

**Issue:** Query not caching  
**Solution:** Check `staleTime` and `cacheTime` in query options

**Issue:** Too many refetches  
**Solution:** Increase `staleTime` or disable `refetchOnWindowFocus`

**Issue:** Optimistic update not working  
**Solution:** Check `onMutate` returns context with previous data

**Issue:** Cache not invalidating  
**Solution:** Check query keys match in mutation's `onSuccess`

---

## ✅ Final Checklist

Before marking complete:

- [ ] All files migrated from checklist
- [ ] All tests passing
- [ ] No console warnings or errors
- [ ] Lighthouse scores improved by 30%+
- [ ] Network requests reduced by 60%+
- [ ] Deployed to production successfully
- [ ] Monitored for 48 hours with no issues
- [ ] Success metrics documented
- [ ] Team trained on React Query usage
- [ ] Documentation updated

---

**Congratulations! You've successfully optimized your API requests! 🎉**

**Next:** Monitor performance metrics and gather user feedback to validate improvements.
