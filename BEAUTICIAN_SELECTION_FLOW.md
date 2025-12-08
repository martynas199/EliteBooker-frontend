# Beautician Selection Booking Flow

## Overview

New booking flow where customers first select a specialist, then see only the services that specialist offers.

## Implementation

### New Page: BeauticianSelectionPage

**Location**: `src/features/specialists/BeauticianSelectionPage.jsx`

**Features**:

- Two-step booking process
- Responsive grid layout
- Smooth animations with StaggerContainer
- Back navigation between steps

### Step 1: Select a Beautician

**Display**:

- Title: "Select a Beautician"
- Subtitle: "Choose your preferred beauty professional"
- Grid of specialist cards (3 columns on desktop, 2 on tablet, 1 on mobile)

**Beautician Card Shows**:

- Profile image (with fallback placeholder)
- Name
- Bio (if available)
- Specialties (up to 3 tags)

**Interaction**:

- Click any specialist card to see their services

### Step 2: Select a Service

**Display**:

- Back button to return to specialist selection
- Selected specialist's profile picture and name
- Title: "Services by [Beautician Name]"
- Grid of service cards

**Service Card Shows**:

- Service image
- Service name
- Description (limited to 2 lines)
- Price
- Duration

**Interaction**:

- Click any service to proceed to time slot selection
- Automatically sets both service and specialist in booking state
- Navigates to `/times`

## Routes Added

### Main Route

```javascript
<Route path="/specialists" element={<BeauticianSelectionPage />} />
```

### Navigation Links

**Desktop Header**:

- "Book Now" → `/specialists`

**Mobile Menu**:

- "Book Now" → `/specialists`

## Technical Details

### Data Fetching

1. **Beauticians**: Fetches from `/api/specialists`, filters active only
2. **Services**: Filters services where:
   - `service.beauticianId === specialist._id` OR
   - `service.beauticianIds.includes(specialist._id)`

### Redux State Management

Uses existing booking slice:

```javascript
dispatch(
  setService({
    serviceId: service._id,
    variantName: service.variants?.[0]?.name,
    price: service.variants?.[0]?.price || service.price,
  })
);

dispatch(
  setBeautician({
    beauticianId: specialist._id,
    any: false,
  })
);
```

### Styling

- Uses existing UI components: `Card`, `PageTransition`, `StaggerContainer`
- Consistent with app design system
- Responsive breakpoints: sm, md, lg
- Hover effects on cards

## User Flow

```
1. User clicks "Book Now" in navigation
   ↓
2. BeauticianSelectionPage loads
   ↓
3. User sees all active specialists
   ↓
4. User clicks a specialist
   ↓
5. Page shows only that specialist's services
   ↓
6. User clicks a service
   ↓
7. Redirects to /times (time slot selection)
   ↓
8. (Existing flow continues...)
```

## Benefits

1. **Better UX**: Customers choose their preferred professional first
2. **Clearer Options**: Only shows relevant services per specialist
3. **Flexible**: Works with multiple or single specialists
4. **Scalable**: Easy to add more specialists
5. **Consistent**: Matches existing app patterns

## API Requirements

### Beauticians Endpoint

**GET** `/api/specialists`

- Returns array of specialist objects
- Must include: `_id`, `name`, `active`, `image`, `bio`, `specialties`

### Services Endpoint

**GET** `/api/services`

- Returns array of service objects
- Must include: `_id`, `name`, `beauticianId`, `beauticianIds`, `price`, `duration`, `image`, `description`, `variants`

## Future Enhancements

Possible additions:

- [ ] Filter specialists by specialty
- [ ] Show specialist rating/reviews
- [ ] Display specialist availability on cards
- [ ] Add specialist schedule preview
- [ ] Allow "Any Beautician" option
- [ ] Show number of services per specialist
