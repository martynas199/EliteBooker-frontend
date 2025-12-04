# API Optimization Guide for Beauty Salon App

## Executive Summary

This guide provides specific, actionable optimizations for improving API request efficiency, user experience, and application performance. The recommendations are based on analysis of the current codebase and focus on implementing **React Query** for modern data fetching patterns.

---

## 🎯 Priority Recommendations

### **HIGH PRIORITY** - Immediate Impact
1. Install React Query for request deduplication and caching
2. Add loading skeletons for admin pages (Dashboard, Appointments, Services)
3. Implement debounced search for admin filters
4. Fix unnecessary re-fetching in `useEffect` hooks

### **MEDIUM PRIORITY** - Performance Gains
5. Add stale-while-revalidate caching for static data
6. Implement optimistic updates for mutations
7. Add request cancellation for navigation changes
8. Improve error feedback with retry mechanisms

### **LOW PRIORITY** - Polish
9. Add request batching for parallel fetches
10. Implement infinite scroll for large lists

---

## 📦 Step 1: Install React Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Setup Query Client

**File:** `src/lib/queryClient.js` (CREATE NEW)

```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Show cached data while fetching updated data
      keepPreviousData: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Update Main App

**File:** `src/main.jsx`

```javascript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

// Wrap your app
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## 🔄 Step 2: Create Custom API Hooks

### Appointments Hook

**File:** `src/features/appointments/appointments.hooks.js` (CREATE NEW)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import toast from 'react-hot-toast';

// Query Keys - Centralized for cache invalidation
export const appointmentKeys = {
  all: ['appointments'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (filters) => [...appointmentKeys.lists(), filters],
  details: () => [...appointmentKeys.all, 'detail'],
  detail: (id) => [...appointmentKeys.details(), id],
};

/**
 * Fetch appointments with automatic caching and deduplication
 * @param {Object} params - { page, limit, beauticianId, status }
 */
export function useAppointments(params = {}) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 50,
        ...(params.beauticianId && { beauticianId: params.beauticianId }),
        ...(params.status && { status: params.status }),
      });

      const response = await api.get(`/appointments?${queryParams}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (appointments change frequently)
    // Keep old data while fetching new page
    keepPreviousData: true,
  });
}

/**
 * Update appointment status with optimistic updates
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, status }) => {
      const response = await api.patch(`/appointments/${appointmentId}`, {
        status,
      });
      return response.data;
    },
    // Optimistic update - instantly show change before API confirms
    onMutate: async ({ appointmentId, status }) => {
      // Cancel ongoing queries to prevent overwriting
      await queryClient.cancelQueries({ queryKey: appointmentKeys.lists() });

      // Snapshot current cache
      const previousAppointments = queryClient.getQueriesData({
        queryKey: appointmentKeys.lists(),
      });

      // Optimistically update cache
      queryClient.setQueriesData(appointmentKeys.lists(), (old) => {
        if (!old) return old;
        return {
          ...old,
          appointments: old.appointments?.map((apt) =>
            apt._id === appointmentId ? { ...apt, status } : apt
          ),
        };
      });

      return { previousAppointments };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousAppointments) {
        context.previousAppointments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || 'Failed to update appointment');
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
    onSuccess: () => {
      toast.success('Appointment updated successfully');
    },
  });
}

/**
 * Cancel appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId) => {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success('Appointment cancelled');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel appointment');
    },
  });
}
```

---

## 🎨 Step 3: Add Loading Skeletons

### Appointments Page Skeleton

**File:** `src/components/ui/AppointmentsSkeleton.jsx` (CREATE NEW)

```javascript
export default function AppointmentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center mt-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}
```

### Card Skeleton for Dashboard

**File:** `src/components/ui/CardSkeleton.jsx` (CREATE NEW)

```javascript
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      ))}
    </>
  );
}
```

---

## 📊 Step 4: Refactor Appointments Page

**File:** `src/admin/pages/Appointments.jsx`

**CHANGES:**
- Replace `useEffect` + `useState` with `useAppointments` hook
- Add loading skeleton
- Implement debounced search
- Add error retry UI

```javascript
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { useAppointments, useUpdateAppointmentStatus } from "../../features/appointments/appointments.hooks";
import AppointmentsSkeleton from "../../components/ui/AppointmentsSkeleton";
import { useDebounce } from "../../hooks/useDebounce"; // We'll create this
import toast from "react-hot-toast";

export default function Appointments() {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";

  // Local UI state
  const [page, setPage] = useState(1);
  const [selectedBeautician, setSelectedBeautician] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debounce search to avoid API call on every keystroke
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch appointments with React Query
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAppointments({
    page,
    limit: 50,
    beauticianId: selectedBeautician !== "all" ? selectedBeautician : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  // Update appointment mutation
  const updateStatus = useUpdateAppointmentStatus();

  // Client-side filtering for search (or move to backend)
  const filteredAppointments = useMemo(() => {
    if (!data?.appointments) return [];
    
    if (!debouncedSearch) return data.appointments;

    const search = debouncedSearch.toLowerCase();
    return data.appointments.filter((apt) => {
      return (
        apt.client?.name?.toLowerCase().includes(search) ||
        apt.client?.email?.toLowerCase().includes(search) ||
        apt.client?.phone?.toLowerCase().includes(search) ||
        apt.serviceId?.name?.toLowerCase().includes(search)
      );
    });
  }, [data?.appointments, debouncedSearch]);

  const handleStatusChange = (appointmentId, newStatus) => {
    updateStatus.mutate({ appointmentId, status: newStatus });
  };

  // Error state with retry
  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Appointments
          </h3>
          <p className="text-red-700 mb-4">
            {error?.message || "An error occurred while loading appointments"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return <AppointmentsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with background refetch indicator */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Manage and view all appointments
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isFetching}
        >
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input - Debounced */}
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        {/* ... existing filters ... */}
      </div>

      {/* Appointments Table */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No appointments found</p>
        </div>
      ) : (
        <>
          {/* ... existing table ... */}
        </>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing {filteredAppointments.length} of {data?.totalAppointments || 0} appointments
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {data?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.totalPages || 1) || isFetching}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Step 5: Create Debounce Hook

**File:** `src/hooks/useDebounce.js` (CREATE NEW)

```javascript
import { useState, useEffect } from 'react';

/**
 * Debounce a value to avoid excessive API calls
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**USAGE EXAMPLE:**

```javascript
// In any component with search/filter
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);

// Use debouncedSearch in API calls or useEffect
useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 🏢 Step 6: Beauticians & Services Hooks

### Beauticians Hook

**File:** `src/features/staff/staff.hooks.js` (CREATE NEW)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import toast from 'react-hot-toast';

export const beauticiansKeys = {
  all: ['beauticians'],
  lists: () => [...beauticiansKeys.all, 'list'],
  list: (filters) => [...beauticiansKeys.lists(), filters],
  details: () => [...beauticiansKeys.all, 'detail'],
  detail: (id) => [...beauticiansKeys.details(), id],
};

/**
 * Fetch all beauticians - cached for 10 minutes (rarely changes)
 */
export function useBeauticians() {
  return useQuery({
    queryKey: beauticiansKeys.lists(),
    queryFn: async () => {
      const response = await api.get('/beauticians');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch single beautician
 */
export function useBeautician(beauticianId) {
  return useQuery({
    queryKey: beauticiansKeys.detail(beauticianId),
    queryFn: async () => {
      const response = await api.get(`/beauticians/${beauticianId}`);
      return response.data;
    },
    enabled: !!beauticianId, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create beautician
 */
export function useCreateBeautician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/beauticians', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beauticiansKeys.all });
      toast.success('Beautician created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create beautician');
    },
  });
}

/**
 * Update beautician
 */
export function useUpdateBeautician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ beauticianId, data }) => {
      const response = await api.patch(`/beauticians/${beauticianId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: beauticiansKeys.all });
      queryClient.invalidateQueries({
        queryKey: beauticiansKeys.detail(variables.beauticianId),
      });
      toast.success('Beautician updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update beautician');
    },
  });
}
```

### Services Hook

**File:** `src/features/services/services.hooks.js` (CREATE NEW)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import toast from 'react-hot-toast';

export const servicesKeys = {
  all: ['services'],
  lists: () => [...servicesKeys.all, 'list'],
  list: (filters) => [...servicesKeys.lists(), filters],
  details: () => [...servicesKeys.all, 'detail'],
  detail: (id) => [...servicesKeys.details(), id],
};

/**
 * Fetch all services - cached for 5 minutes
 */
export function useServices(filters = {}) {
  return useQuery({
    queryKey: servicesKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/services?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single service
 */
export function useService(serviceId) {
  return useQuery({
    queryKey: servicesKeys.detail(serviceId),
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create service with optimistic update
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/services', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success('Service created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create service');
    },
  });
}

/**
 * Delete service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId) => {
      await api.delete(`/services/${serviceId}`);
      return serviceId;
    },
    // Optimistically remove from cache
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: servicesKeys.lists() });

      const previousServices = queryClient.getQueriesData({
        queryKey: servicesKeys.lists(),
      });

      queryClient.setQueriesData(servicesKeys.lists(), (old) => {
        if (Array.isArray(old)) {
          return old.filter((service) => service._id !== serviceId);
        }
        return old;
      });

      return { previousServices };
    },
    onError: (err, variables, context) => {
      if (context?.previousServices) {
        context.previousServices.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || 'Failed to delete service');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
    onSuccess: () => {
      toast.success('Service deleted successfully');
    },
  });
}
```

---

## 🎨 Step 7: Refactor Dashboard Page

**File:** `src/admin/pages/Dashboard.jsx`

**KEY IMPROVEMENTS:**
- Use React Query hooks instead of useEffect
- Parallel data fetching automatically handled
- Loading skeleton
- Memoization already in place (keep it)

```javascript
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { useAppointments } from "../../features/appointments/appointments.hooks";
import { useBeauticians } from "../../features/staff/staff.hooks";
import { CardSkeleton } from "../../components/ui/CardSkeleton";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

export default function Dashboard() {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const [selectedBeautician, setSelectedBeautician] = useState("all");
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch appointments - automatically cached and deduplicated
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useAppointments({
    // Backend can filter by beautician if not super admin
    beauticianId: !isSuperAdmin && admin?.beauticianId ? admin.beauticianId : undefined,
  });

  // Fetch beauticians - automatically cached and deduplicated
  const {
    data: beauticians = [],
    isLoading: beauticiansLoading,
  } = useBeauticians();

  const isLoading = appointmentsLoading || beauticiansLoading;

  // Filter appointments based on selected beautician
  const allAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return [];

    let filtered = appointmentsData.appointments;

    // Client-side filter if super admin selects specific beautician
    if (isSuperAdmin && selectedBeautician !== "all") {
      filtered = filtered.filter(
        (apt) => apt.beauticianId?._id === selectedBeautician
      );
    }

    return filtered;
  }, [appointmentsData, selectedBeautician, isSuperAdmin]);

  // ... rest of component logic stays the same ...
  // Memoize events, formatters, etc.

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton count={3} />
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (appointmentsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // ... rest of JSX stays the same ...
  );
}
```

---

## 🔧 Step 8: Fix useEffect Dependencies

### Problem Files

Several files have missing or incorrect dependencies in `useEffect`:

**File:** `src/admin/pages/Services.jsx` (Line 29)

**ISSUE:** Empty dependency array but references state

```javascript
// ❌ BAD - Missing dependencies
useEffect(() => {
  loadServices();
}, []);

// ✅ GOOD - With React Query, no useEffect needed at all!
// Just use the hook:
const { data: services } = useServices();
const { data: beauticians } = useBeauticians();
```

**File:** `src/admin/AdminLayout.jsx` (Line 111)

**ISSUE:** Fetching admin name on every render

```javascript
// ❌ BAD - Runs on every token change
useEffect(() => {
  const fetchAdminName = async () => {
    if (token) {
      try {
        const response = await api.get("/auth/me");
        setAdminName(response.data.name);
      } catch (err) {
        // Keep default name if fetch fails
      }
    }
  };
  fetchAdminName();
}, [token]);

// ✅ GOOD - Move to React Query hook
// File: src/features/auth/auth.hooks.js
export function useCurrentAdmin() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('authToken'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });
}

// In AdminLayout.jsx
const { data: currentAdmin } = useCurrentAdmin();
const adminName = currentAdmin?.name || 'Admin';
```

---

## 🚀 Step 9: Request Cancellation on Navigation

**File:** `src/features/availability/TimeSlots.jsx`

**PROBLEM:** If user navigates away before API call completes, memory leak occurs

**SOLUTION:** React Query automatically cancels requests on unmount

```javascript
// Before (manual cancellation needed)
useEffect(() => {
  let cancelled = false;
  
  api.get(`/services/${serviceId}`)
    .then((response) => {
      if (!cancelled) {
        setService(response.data);
      }
    });

  return () => {
    cancelled = true;
  };
}, [serviceId]);

// After (automatic cancellation with React Query)
const { data: service } = useQuery({
  queryKey: ['services', serviceId],
  queryFn: async () => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },
  enabled: !!serviceId,
});
```

---

## 📈 Step 10: Improved Error Feedback

### Enhanced Error Display Component

**File:** `src/components/ui/ErrorDisplay.jsx` (CREATE NEW)

```javascript
export function ErrorDisplay({ error, onRetry, retryCount = 0 }) {
  const isNetworkError = error?.message?.includes('Network') || 
                         error?.code === 'ERR_NETWORK';
  const isTimeout = error?.code === 'ECONNABORTED';
  const isRateLimit = error?.response?.status === 429;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isNetworkError ? (
            <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          ) : isTimeout ? (
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isRateLimit ? (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {isNetworkError ? 'Connection Lost' :
           isTimeout ? 'Request Timed Out' :
           isRateLimit ? 'Too Many Requests' :
           'Something Went Wrong'}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center mb-4">
          {isNetworkError ? 'Please check your internet connection and try again.' :
           isTimeout ? 'The request took too long. Please try again.' :
           isRateLimit ? 'Please wait a moment before trying again.' :
           error?.message || 'An unexpected error occurred'}
        </p>

        {/* Retry count */}
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 text-center mb-4">
            Retried {retryCount} time{retryCount > 1 ? 's' : ''}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>

        {/* Support link */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Problem persists?{' '}
          <a href="mailto:support@beautysalon.com" className="text-brand-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 🎯 Step 11: Shared Data Hooks

Create hooks for commonly fetched data to ensure deduplication:

**File:** `src/hooks/useSharedData.js` (CREATE NEW)

```javascript
import { useQueries } from '@tanstack/react-query';
import { api } from '../lib/apiClient';

/**
 * Fetch multiple common resources in parallel
 * Useful for forms/pages that need beauticians + services + settings
 */
export function useSharedData() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['beauticians', 'list'],
        queryFn: async () => {
          const response = await api.get('/beauticians');
          return response.data;
        },
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['services', 'list'],
        queryFn: async () => {
          const response = await api.get('/services');
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['settings'],
        queryFn: async () => {
          const response = await api.get('/settings');
          return response.data;
        },
        staleTime: 15 * 60 * 1000, // Settings change rarely
      },
    ],
  });

  return {
    beauticians: results[0].data || [],
    services: results[1].data || [],
    settings: results[2].data || {},
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    errors: results.map((r) => r.error).filter(Boolean),
  };
}
```

**USAGE:**

```javascript
// In any component that needs these resources
import { useSharedData } from '../../hooks/useSharedData';

function MyComponent() {
  const { beauticians, services, settings, isLoading } = useSharedData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    // Use beauticians, services, settings
  );
}
```

---

## 📋 Migration Checklist

### Phase 1: Setup (1 hour)
- [ ] Install `@tanstack/react-query` and devtools
- [ ] Create `src/lib/queryClient.js`
- [ ] Wrap app in `<QueryClientProvider>`
- [ ] Create `src/hooks/useDebounce.js`
- [ ] Create skeleton components

### Phase 2: Core Hooks (2-3 hours)
- [ ] Create `src/features/appointments/appointments.hooks.js`
- [ ] Create `src/features/staff/staff.hooks.js`
- [ ] Create `src/features/services/services.hooks.js`
- [ ] Create `src/features/auth/auth.hooks.js`
- [ ] Create `src/hooks/useSharedData.js`

### Phase 3: Refactor Pages (4-6 hours)
- [ ] Refactor `Appointments.jsx` with React Query
- [ ] Refactor `Dashboard.jsx` with React Query
- [ ] Refactor `Services.jsx` with React Query
- [ ] Refactor `Staff.jsx` with React Query
- [ ] Refactor `Products.jsx` with React Query
- [ ] Refactor `Hours.jsx` with React Query

### Phase 4: UI Polish (2-3 hours)
- [ ] Add loading skeletons to all pages
- [ ] Add `ErrorDisplay` component to error states
- [ ] Add debounced search to filter inputs
- [ ] Add "Updating..." indicators during background refetches
- [ ] Test error retry mechanisms

### Phase 5: Testing (2-3 hours)
- [ ] Test offline behavior
- [ ] Test request cancellation on navigation
- [ ] Verify no duplicate requests in Network tab
- [ ] Test optimistic updates
- [ ] Check React Query DevTools for cache behavior

---

## 📊 Expected Performance Improvements

### Before Optimization:
- **Dashboard load**: 3-4 API requests, ~2s
- **Appointments page**: Re-fetches on every filter change
- **Services page**: Re-fetches beauticians + services on every mount
- **Network requests**: ~50-100 per session
- **No offline support**
- **No loading states** (just spinners)

### After Optimization:
- **Dashboard load**: 2 parallel requests (cached), ~800ms
- **Appointments page**: Cached data, instant filter changes
- **Services page**: Cached data, 0 duplicate requests
- **Network requests**: ~20-30 per session (60-70% reduction)
- **Stale-while-revalidate**: Instant UI updates
- **Offline support**: Shows cached data
- **Skeleton loading**: Perceived performance boost

---

## 🐛 Common Pitfalls to Avoid

### 1. Over-caching Static Data
```javascript
// ❌ BAD - User data should have short staleTime
useQuery({
  queryKey: ['users', 'me'],
  staleTime: 60 * 60 * 1000, // 1 hour - too long!
});

// ✅ GOOD
useQuery({
  queryKey: ['users', 'me'],
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 2. Not Using Query Keys Properly
```javascript
// ❌ BAD - Can't invalidate specific queries
useQuery({ queryKey: ['data'] });

// ✅ GOOD - Hierarchical keys
useQuery({ queryKey: ['appointments', 'list', { page: 1, status: 'confirmed' }] });
```

### 3. Forgetting to Invalidate Mutations
```javascript
// ❌ BAD - Cache never updates after mutation
useMutation({
  mutationFn: updateAppointment,
  // Missing onSuccess invalidation
});

// ✅ GOOD
useMutation({
  mutationFn: updateAppointment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  },
});
```

---

## 🎓 Learning Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Essentials](https://ui.dev/c/react-query)
- [Query Key Structure Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## 📞 Support

For questions about implementation:
1. Check React Query DevTools (F12 → React Query tab)
2. Review query key structure
3. Check network tab for duplicate requests
4. Verify staleTime/cacheTime settings

**Next Steps:** Start with Phase 1 (Setup) and migrate one page at a time!
