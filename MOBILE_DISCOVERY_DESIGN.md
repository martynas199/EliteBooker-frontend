# Mobile-First Map-Based Business Discovery Design

## Inspired by Fresha, Treatwell & Airbnb

---

## 🎯 Design Goals

- **Conversion-Focused**: Every interaction optimized for booking
- **Mobile-First**: Touch-optimized, thumb-friendly UI
- **Performance**: Smooth 60fps animations, fast load times
- **Intuitive**: Map-list synchronization feels natural

---

## 📐 Layout Specifications

### Screen Breakdown

```
┌─────────────────────────────┐
│ [←] [Search] [Filters]      │ ← 60px sticky header
├─────────────────────────────┤
│                             │
│         MAP AREA            │ ← 35-40% viewport (dynamic)
│    (Google Maps/Mapbox)     │   - Expands when scrolling up
│                             │   - Collapses when scrolling down
│      [Your Location]        │
│        • • •                │ ← Brand-colored pins
│                             │
├─────────────────────────────┤
│ [Distance▾] [Price▾] [★]   │ ← 48px sticky filter bar
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ● Serenity Spa         │ │
│ │ ★★★★★ 4.8 • 0.3 mi    │ │ ← Business card
│ │ From £45               │ │   (120-140px height)
│ │ Next: Today 2:30 PM    │ │
│ │         [Book Now →]    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ ← Scrollable list
│ │ ● Glow Beauty Bar      │ │   (cards snap to top)
│ │ ★★★★☆ 4.6 • 0.5 mi    │ │
│ │ From £35               │ │
│ │ Next: Tomorrow 10 AM   │ │
│ │         [Book Now →]    │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

---

## 🗺️ Map Component Specifications

### Visual Design

**Map Style**: Clean, minimal Google Maps with custom styling

```javascript
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e7f7" }],
  },
];
```

### Pin Design

**Default Pin** (Inactive business)

```
  ┌────┐
  │ £  │  ← Brand color (#6366f1 or theme.primary)
  └─┬──┘     32x32px circle
    │        White icon/price
    ▼        Drop shadow
```

**Active Pin** (Selected business)

```
  ┌──────┐
  │  £   │  ← Larger (48x48px)
  └──┬───┘     Elevated shadow
     │         Pulse animation
     ▼         Darker brand color
```

**Pin Clustering** (Multiple businesses)

```
   ┌────┐
   │ 12 │  ← Number of businesses
   └────┘     Larger circle (40-60px based on count)
              Tap to zoom in
```

### Map Interactions

| Interaction           | Behavior                                        | Animation                         |
| --------------------- | ----------------------------------------------- | --------------------------------- |
| **Tap pin**           | Scroll corresponding card into view + highlight | Smooth scroll (300ms), pin bounce |
| **Drag map**          | Update visible business list                    | Debounce 500ms, fade transition   |
| **Zoom in**           | Un-cluster pins                                 | Scale transition (200ms)          |
| **Zoom out**          | Cluster nearby pins                             | Scale + opacity (200ms)           |
| **User scrolls up**   | Expand map to 50% viewport                      | Height spring animation (400ms)   |
| **User scrolls down** | Collapse map to 25% viewport                    | Height spring animation (400ms)   |

---

## 💳 Business Card Component

### Card Layout (Mobile)

```jsx
<div className="business-card">
  <div className="card-header">
    <div className="business-info">
      <h3>Serenity Spa</h3>
      <div className="meta">
        <span className="rating">★★★★★ 4.8</span>
        <span className="divider">•</span>
        <span className="distance">0.3 mi</span>
      </div>
    </div>
    <img src="thumbnail.jpg" className="thumbnail" />
  </div>

  <div className="card-body">
    <div className="price">From £45</div>
    <div className="availability">
      <ClockIcon /> Next: Today 2:30 PM
    </div>
  </div>

  <button className="cta-button">Book Now →</button>
</div>
```

### Card States

**1. Default State**

```css
background: white
border-radius: 16px
padding: 16px
box-shadow: 0 2px 8px rgba(0,0,0,0.08)
border: 1px solid #e5e7eb
```

**2. Active State** (Synced with map pin)

```css
background: white
border-radius: 16px
padding: 16px
box-shadow: 0 4px 16px rgba(99,102,241,0.2)
border: 2px solid #6366f1
transform: scale(1.02)
```

**3. Pressed State**

```css
transform: scale(0.98)
transition: all 100ms
```

### Card Measurements

- **Height**: 140px (collapsed), auto (expanded)
- **Margin**: 12px horizontal, 8px vertical
- **Border Radius**: 16px
- **Thumbnail**: 64x64px, 8px border-radius
- **CTA Button**: Full width, 48px height, 16px border-radius

---

## 🎛️ Sticky Filter Bar

### Filter Layout

```
┌───────────────────────────────────┐
│ [Distance ▾] [Price ▾] [★ 4.5+] │  48px height
│   [Today]  [This week]  [🎯]     │  Horizontal scroll
└───────────────────────────────────┘
```

### Filter Options

**Distance Filter**

- Any distance
- Within 1 mile
- Within 3 miles
- Within 5 miles
- Within 10 miles

**Price Filter**

- Any price
- £ (Under £30)
- ££ (£30-£60)
- £££ (£60-£100)
- ££££ (£100+)

**Rating Filter**

- Any rating
- 4.0+ ★★★★
- 4.5+ ★★★★½
- 4.8+ (Top rated)

**Availability Filter** (Pills)

- Today
- Tomorrow
- This week
- This weekend

**Category Filter** (Horizontal scroll chips)

- All
- Hair
- Nails
- Massage
- Facial
- Waxing
- Makeup

### Filter Interaction

```javascript
// Filter state management
const [activeFilters, setActiveFilters] = useState({
  distance: null, // miles
  priceRange: null, // 1-4
  minRating: null, // 0-5
  availability: null, // 'today', 'tomorrow', 'week'
  categories: [], // array of category IDs
});

// Apply filters with animation
const applyFilters = (newFilters) => {
  setActiveFilters(newFilters);

  // Fade out current cards
  setCardsVisible(false);

  // Filter venues
  setTimeout(() => {
    const filtered = filterVenues(venues, newFilters);
    setFilteredVenues(filtered);

    // Fade in new cards
    setCardsVisible(true);

    // Update map bounds
    fitMapToVenues(filtered);
  }, 150);
};
```

---

## 🔄 Map-List Synchronization

### Core Logic

```javascript
// State management
const [activeVenueId, setActiveVenueId] = useState(null);
const [mapBounds, setMapBounds] = useState(null);
const cardRefs = useRef({});
const pinRefs = useRef({});

// Sync: Pin tap → Card scroll
const handlePinClick = (venueId) => {
  setActiveVenueId(venueId);

  // Scroll card into view
  cardRefs.current[venueId]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Animate pin
  pinRefs.current[venueId]?.classList.add("active");
};

// Sync: Card scroll → Map re-center
const handleCardVisible = (venueId) => {
  setActiveVenueId(venueId);

  const venue = venues.find((v) => v._id === venueId);
  if (venue?.location?.coordinates) {
    const [lng, lat] = venue.location.coordinates;

    // Pan map smoothly
    map.panTo(
      { lat, lng },
      {
        duration: 300,
        easing: "ease-out",
      }
    );

    // Highlight pin
    updateActivePinmarker(venueId);
  }
};

// Sync: Map drag → Update list
const handleMapDragEnd = () => {
  const bounds = map.getBounds();
  setMapBounds(bounds);

  // Filter venues in viewport
  const visibleVenues = venues.filter((venue) => {
    const [lng, lat] = venue.location.coordinates;
    return bounds.contains({ lat, lng });
  });

  setFilteredVenues(visibleVenues);
};
```

### Intersection Observer for Card Visibility

```javascript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const venueId = entry.target.dataset.venueId;
          handleCardVisible(venueId);
        }
      });
    },
    {
      threshold: [0.6],
      rootMargin: "-20% 0px -20% 0px",
    }
  );

  Object.values(cardRefs.current).forEach((card) => {
    if (card) observer.observe(card);
  });

  return () => observer.disconnect();
}, [venues]);
```

---

## ⚡ Performance Optimizations

### 1. Pin Clustering (Supercluster)

```javascript
import Supercluster from "supercluster";

const cluster = new Supercluster({
  radius: 60, // Cluster radius in pixels
  maxZoom: 16, // Max zoom to cluster points
});

// Load points
cluster.load(
  venues.map((venue) => ({
    type: "Feature",
    properties: { venueId: venue._id, ...venue },
    geometry: {
      type: "Point",
      coordinates: venue.location.coordinates,
    },
  }))
);

// Get clusters for current map bounds and zoom
const bounds = map.getBounds();
const zoom = map.getZoom();
const clusters = cluster.getClusters(
  [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
  Math.floor(zoom)
);
```

### 2. Virtual Scrolling for Large Lists

```javascript
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={window.innerHeight * 0.6}
  itemCount={filteredVenues.length}
  itemSize={140}
  width="100%"
>
  {({ index, style }) => (
    <BusinessCard
      venue={filteredVenues[index]}
      style={style}
      isActive={activeVenueId === filteredVenues[index]._id}
    />
  )}
</FixedSizeList>;
```

### 3. Debounced Map Updates

```javascript
import { useDebouncedCallback } from "use-debounce";

const debouncedMapUpdate = useDebouncedCallback(
  (bounds) => {
    updateVisibleVenues(bounds);
  },
  500 // Wait 500ms after user stops dragging
);
```

### 4. Image Lazy Loading

```javascript
<img
  src={venue.thumbnail}
  loading="lazy"
  alt={venue.name}
  onError={(e) => (e.target.src = "/placeholder-business.jpg")}
/>
```

---

## 🎨 Visual Design System

### Colors

```javascript
const theme = {
  // Primary brand color for pins, buttons, highlights
  primary: "#6366f1", // Indigo-500
  primaryHover: "#4f46e5", // Indigo-600
  primaryLight: "#818cf8", // Indigo-400

  // UI colors
  background: "#f9fafb", // Gray-50
  surface: "#ffffff", // White
  border: "#e5e7eb", // Gray-200
  borderActive: "#6366f1", // Primary

  // Text
  textPrimary: "#111827", // Gray-900
  textSecondary: "#6b7280", // Gray-500
  textTertiary: "#9ca3af", // Gray-400

  // Status
  success: "#10b981", // Green-500
  warning: "#f59e0b", // Amber-500
  error: "#ef4444", // Red-500

  // Shadows
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.08)",
  shadowLg: "0 4px 16px rgba(0,0,0,0.12)",
  shadowActive: "0 4px 16px rgba(99,102,241,0.2)",
};
```

### Typography

```javascript
const typography = {
  // Business name
  heading: {
    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "24px",
    letterSpacing: "-0.01em",
  },

  // Price, distance
  body: {
    fontSize: "15px",
    fontWeight: "500",
    lineHeight: "20px",
  },

  // Rating, availability
  caption: {
    fontSize: "13px",
    fontWeight: "400",
    lineHeight: "18px",
  },

  // CTA button
  button: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "24px",
    letterSpacing: "-0.01em",
  },
};
```

### Spacing

```javascript
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
};
```

---

## 🎭 Animation Specifications

### Map Collapse/Expand

```javascript
// Using Framer Motion
import { motion } from "framer-motion";

const [mapHeight, setMapHeight] = useState("40vh");

<motion.div
  className="map-container"
  animate={{ height: mapHeight }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  }}
>
  {/* Map component */}
</motion.div>;

// Scroll handler
const handleScroll = (e) => {
  const scrollY = e.target.scrollTop;

  if (scrollY > lastScrollY && scrollY > 100) {
    // Scrolling down - collapse map
    setMapHeight("25vh");
  } else if (scrollY < lastScrollY) {
    // Scrolling up - expand map
    setMapHeight("40vh");
  }

  setLastScrollY(scrollY);
};
```

### Card Transitions

```javascript
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // Stagger effect
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  active: {
    scale: 1.02,
    boxShadow: "0 4px 16px rgba(99,102,241,0.2)",
    borderColor: "#6366f1",
    transition: { duration: 0.2 },
  },
};

<motion.div
  custom={index}
  variants={cardVariants}
  initial="hidden"
  animate={isActive ? "active" : "visible"}
  whileTap={{ scale: 0.98 }}
>
  {/* Card content */}
</motion.div>;
```

### Pin Bounce Animation

```javascript
const pinVariants = {
  inactive: {
    scale: 1,
    y: 0,
  },
  active: {
    scale: 1.3,
    y: [0, -10, 0],
    transition: {
      y: {
        duration: 0.4,
        ease: "easeOut",
      },
      scale: {
        duration: 0.2,
      },
    },
  },
};
```

### Filter Transition

```javascript
const filterVariants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
};
```

---

## 📱 Component Hierarchy

```
SearchPage
├── MobileHeader
│   ├── BackButton
│   ├── SearchBar
│   └── FilterButton
│
├── MapContainer
│   ├── GoogleMap
│   ├── CustomMarkers
│   │   ├── VenuePin (default)
│   │   ├── ActiveVenuePin
│   │   ├── ClusterPin
│   │   └── UserLocationPin
│   └── MapControls
│       ├── RecenterButton
│       └── ZoomControls
│
├── StickyFilterBar
│   ├── FilterChip (distance)
│   ├── FilterChip (price)
│   ├── FilterChip (rating)
│   └── FilterModal
│       ├── DistanceSlider
│       ├── PriceRange
│       ├── RatingPicker
│       └── ApplyButton
│
└── BusinessCardList
    ├── VirtualScrollContainer
    └── BusinessCard
        ├── CardHeader
        │   ├── BusinessInfo
        │   │   ├── BusinessName
        │   │   └── MetaInfo (rating, distance)
        │   └── Thumbnail
        ├── CardBody
        │   ├── PriceDisplay
        │   └── AvailabilityInfo
        └── CTAButton
```

---

## 🔧 React Component Pseudocode

### Main Search Page Component

```jsx
// SearchPage.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Supercluster from "supercluster";

export default function SearchPage() {
  // State
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [activeVenueId, setActiveVenueId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapHeight, setMapHeight] = useState("40vh");
  const [filters, setFilters] = useState({
    distance: null,
    priceRange: null,
    minRating: null,
    availability: null,
  });

  // Refs
  const mapRef = useRef(null);
  const listRef = useRef(null);
  const cardRefs = useRef({});
  const markerRefs = useRef({});
  const clusterRef = useRef(null);

  // Initialize clustering
  useEffect(() => {
    clusterRef.current = new Supercluster({
      radius: 60,
      maxZoom: 16,
    });

    if (venues.length > 0) {
      const points = venues.map((venue) => ({
        type: "Feature",
        properties: { id: venue._id, ...venue },
        geometry: {
          type: "Point",
          coordinates: venue.location.coordinates,
        },
      }));

      clusterRef.current.load(points);
    }
  }, [venues]);

  // Fetch venues
  useEffect(() => {
    fetchVenues();
    getUserLocation();
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = applyFilters(venues, filters, userLocation);
    setFilteredVenues(filtered);
  }, [venues, filters, userLocation]);

  // Map-List sync handlers
  const handlePinClick = (venueId) => {
    setActiveVenueId(venueId);
    cardRefs.current[venueId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleCardVisible = (venueId) => {
    if (venueId !== activeVenueId) {
      setActiveVenueId(venueId);
      centerMapOnVenue(venueId);
    }
  };

  const handleMapDrag = useDebouncedCallback((bounds) => {
    updateVisibleVenues(bounds);
  }, 500);

  // Scroll handler for map collapse
  const handleScroll = (e) => {
    const scrollY = e.target.scrollTop;
    if (scrollY > 100 && scrollY > lastScrollY.current) {
      setMapHeight("25vh");
    } else if (scrollY < lastScrollY.current) {
      setMapHeight("40vh");
    }
    lastScrollY.current = scrollY;
  };

  return (
    <div className="search-page">
      <MobileHeader
        onSearch={handleSearch}
        onFilter={() => setShowFilters(true)}
      />

      <motion.div
        className="map-container"
        animate={{ height: mapHeight }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <GoogleMapComponent
          center={userLocation}
          venues={filteredVenues}
          activeVenueId={activeVenueId}
          onPinClick={handlePinClick}
          onMapDrag={handleMapDrag}
          clusterEngine={clusterRef.current}
        />
      </motion.div>

      <StickyFilterBar
        filters={filters}
        onChange={setFilters}
        resultsCount={filteredVenues.length}
      />

      <div className="business-list" onScroll={handleScroll} ref={listRef}>
        <AnimatePresence mode="popLayout">
          {filteredVenues.map((venue, index) => (
            <BusinessCard
              key={venue._id}
              venue={venue}
              index={index}
              isActive={venue._id === activeVenueId}
              onVisible={handleCardVisible}
              ref={(el) => (cardRefs.current[venue._id] = el)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### Business Card Component

```jsx
// BusinessCard.jsx
import { motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const BusinessCard = forwardRef(
  ({ venue, index, isActive, onVisible }, ref) => {
    const intersectionRef = useRef(null);

    // Intersection observer for visibility detection
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            onVisible(venue._id);
          }
        },
        { threshold: [0.6], rootMargin: "-20% 0px -20% 0px" }
      );

      if (intersectionRef.current) {
        observer.observe(intersectionRef.current);
      }

      return () => observer.disconnect();
    }, [venue._id, onVisible]);

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          delay: index * 0.05,
          duration: 0.3,
        },
      },
      active: {
        scale: 1.02,
        boxShadow: "0 4px 16px rgba(99,102,241,0.2)",
        borderColor: "#6366f1",
      },
    };

    return (
      <motion.div
        ref={(el) => {
          intersectionRef.current = el;
          if (ref) ref.current = el;
        }}
        variants={cardVariants}
        initial="hidden"
        animate={isActive ? "active" : "visible"}
        exit="hidden"
        whileTap={{ scale: 0.98 }}
        className="business-card"
        data-venue-id={venue._id}
      >
        <div className="card-header">
          <div className="business-info">
            <h3 className="business-name">{venue.name}</h3>
            <div className="meta-info">
              <span className="rating">
                {"★".repeat(Math.round(venue.rating))}
                {" " + venue.rating}
              </span>
              <span className="divider">•</span>
              <span className="distance">{venue.distance?.toFixed(1)} mi</span>
            </div>
          </div>
          <img
            src={venue.thumbnail || "/placeholder.jpg"}
            alt={venue.name}
            className="thumbnail"
            loading="lazy"
          />
        </div>

        <div className="card-body">
          <div className="price">From £{venue.minPrice}</div>
          <div className="availability">
            <ClockIcon />
            Next: {formatNextAvailability(venue.nextSlot)}
          </div>
        </div>

        <Link to={`/salon/${venue.slug}`} className="cta-button">
          Book Now →
        </Link>
      </motion.div>
    );
  }
);
```

### Custom Map Marker Component

```jsx
// CustomMarker.jsx
import { motion } from "framer-motion";

export const VenuePin = ({ venue, isActive, onClick }) => {
  const pinVariants = {
    inactive: { scale: 1, y: 0 },
    active: {
      scale: 1.3,
      y: [0, -10, 0],
      transition: {
        y: { duration: 0.4, ease: "easeOut" },
        scale: { duration: 0.2 },
      },
    },
  };

  return (
    <motion.div
      className={`venue-pin ${isActive ? "active" : ""}`}
      variants={pinVariants}
      animate={isActive ? "active" : "inactive"}
      onClick={() => onClick(venue._id)}
      style={{
        position: "absolute",
        cursor: "pointer",
        zIndex: isActive ? 100 : 10,
      }}
    >
      <div className="pin-circle">£{venue.minPrice}</div>
      <div className="pin-pointer" />
    </motion.div>
  );
};

export const ClusterPin = ({ count, onClick }) => {
  return (
    <div
      className="cluster-pin"
      onClick={onClick}
      style={{
        width: Math.min(40 + count * 2, 80),
        height: Math.min(40 + count * 2, 80),
      }}
    >
      {count}
    </div>
  );
};
```

### Sticky Filter Bar Component

```jsx
// StickyFilterBar.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function StickyFilterBar({ filters, onChange, resultsCount }) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const handleFilterChange = (filterType, value) => {
    onChange({
      ...filters,
      [filterType]: value,
    });
  };

  return (
    <>
      <div className="sticky-filter-bar">
        <div className="filter-chips">
          <FilterChip
            label="Distance"
            value={filters.distance ? `${filters.distance} mi` : null}
            onClick={() => {
              setActiveFilter("distance");
              setShowFilterModal(true);
            }}
          />

          <FilterChip
            label="Price"
            value={filters.priceRange ? "£".repeat(filters.priceRange) : null}
            onClick={() => {
              setActiveFilter("price");
              setShowFilterModal(true);
            }}
          />

          <FilterChip
            label="Rating"
            value={filters.minRating ? `${filters.minRating}+ ★` : null}
            onClick={() => {
              setActiveFilter("rating");
              setShowFilterModal(true);
            }}
          />
        </div>

        <div className="availability-pills">
          <PillButton
            active={filters.availability === "today"}
            onClick={() => handleFilterChange("availability", "today")}
          >
            Today
          </PillButton>
          <PillButton
            active={filters.availability === "week"}
            onClick={() => handleFilterChange("availability", "week")}
          >
            This week
          </PillButton>
        </div>

        <div className="results-count">{resultsCount} businesses found</div>
      </div>

      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            filterType={activeFilter}
            currentValue={filters[activeFilter]}
            onClose={() => setShowFilterModal(false)}
            onApply={(value) => {
              handleFilterChange(activeFilter, value);
              setShowFilterModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 📊 State Management Architecture

```javascript
// searchStore.js (using Zustand or Redux)
import create from "zustand";

export const useSearchStore = create((set, get) => ({
  // Data
  venues: [],
  filteredVenues: [],
  userLocation: null,

  // UI State
  activeVenueId: null,
  mapHeight: "40vh",
  mapBounds: null,
  isLoading: false,

  // Filter State
  filters: {
    distance: null,
    priceRange: null,
    minRating: null,
    availability: null,
    categories: [],
  },

  // Actions
  setVenues: (venues) => set({ venues }),

  setActiveVenue: (venueId) => set({ activeVenueId: venueId }),

  setMapHeight: (height) => set({ mapHeight: height }),

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { venues, filters, userLocation } = get();
    const filtered = filterVenues(venues, filters, userLocation);
    set({ filteredVenues: filtered });
  },

  updateVisibleVenues: (bounds) => {
    const { venues } = get();
    const visible = venues.filter((venue) => {
      const [lng, lat] = venue.location.coordinates;
      return bounds.contains({ lat, lng });
    });
    set({ filteredVenues: visible, mapBounds: bounds });
  },
}));
```

---

## 🎯 Conversion Optimization Features

### 1. Social Proof

- Real-time "X people viewing this" badges
- Recent bookings feed
- Verified reviews count

### 2. Urgency Indicators

- "Only 2 slots left today" warnings
- "Booking fills fast" tags for popular venues
- Flash deal timers

### 3. Frictionless Booking

- One-tap guest checkout
- Save payment methods
- Pre-filled user location
- Quick rebooking from favorites

### 4. Smart Defaults

- Auto-select "Today" availability
- Sort by distance + rating combo
- Pre-fill popular service categories

### 5. Trust Signals

- Verified business badges
- Cancellation policy upfront
- COVID safety measures
- Professional certifications

---

## 📈 Analytics Tracking

```javascript
// Track key conversion events
const trackEvent = (eventName, properties) => {
  // Google Analytics
  gtag("event", eventName, properties);

  // Mixpanel
  mixpanel.track(eventName, properties);
};

// Key events to track
trackEvent("map_pin_clicked", {
  venue_id: venueId,
  venue_name: venueName,
  user_location: userLocation,
});

trackEvent("business_card_viewed", {
  venue_id: venueId,
  position: index,
  distance: distance,
});

trackEvent("filter_applied", {
  filter_type: filterType,
  filter_value: filterValue,
});

trackEvent("book_now_clicked", {
  venue_id: venueId,
  from_map: fromMap,
  session_time: sessionTime,
});
```

---

## ✅ Implementation Checklist

### Phase 1: Core Structure (Week 1)

- [ ] Set up mobile-first responsive layout
- [ ] Implement collapsible map (40vh → 25vh)
- [ ] Create basic business card component
- [ ] Add sticky filter bar

### Phase 2: Map Integration (Week 2)

- [ ] Integrate Google Maps with custom styling
- [ ] Create custom pin components (default, active, cluster)
- [ ] Implement pin clustering with Supercluster
- [ ] Add user location marker

### Phase 3: Synchronization (Week 3)

- [ ] Map pin click → Card scroll
- [ ] Card scroll → Map re-center
- [ ] Map drag → Update business list
- [ ] Intersection Observer for card visibility

### Phase 4: Filters & Search (Week 4)

- [ ] Distance filter with slider
- [ ] Price range filter
- [ ] Rating filter
- [ ] Availability filter (Today/This week)
- [ ] Category chips

### Phase 5: Performance (Week 5)

- [ ] Implement virtual scrolling (react-window)
- [ ] Add debounced map updates
- [ ] Lazy load images
- [ ] Optimize re-renders with React.memo

### Phase 6: Animations (Week 6)

- [ ] Map collapse/expand spring animation
- [ ] Card stagger entrance
- [ ] Pin bounce on selection
- [ ] Filter modal slide-up
- [ ] Active card highlight

### Phase 7: Polish & Testing (Week 7)

- [ ] Add loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Skeleton screens
- [ ] Cross-browser testing
- [ ] Touch gesture testing

---

## 🚀 Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Map Load Time**: < 2s
- **Card Scroll FPS**: 60fps
- **Map Pan FPS**: 60fps
- **Filter Application**: < 300ms
- **Bundle Size**: < 250KB (gzipped)

---

## 📱 Responsive Breakpoints

```javascript
const breakpoints = {
  mobile: "0-767px", // iPhone SE to iPhone 14 Pro Max
  tablet: "768-1023px", // iPad Mini to iPad Pro
  desktop: "1024px+", // Desktop (map + list side-by-side)
};

// Mobile: Vertical stack (map top, list bottom)
// Tablet: 50/50 split or same as mobile
// Desktop: Map left, list right (60/40 split)
```

---

This is a complete, production-ready specification. Would you like me to start implementing specific components?
