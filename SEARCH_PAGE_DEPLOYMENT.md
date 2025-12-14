# Search Page Production Deployment Guide

## Issue

The search page may not display venues in production if the default location coordinates are not properly configured.

## Solution

### Environment Variables

Add these environment variables to your production deployment (e.g., Render, Netlify, Vercel):

```env
# Default location for search page (required)
# Set these to your target market's coordinates
VITE_DEFAULT_LAT=51.5074  # Latitude (e.g., London: 51.5074)
VITE_DEFAULT_LNG=-0.1278  # Longitude (e.g., London: -0.1278)

# Google Maps API Key (required for map display)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Coordinate Examples

**London, UK** (Default)

```
VITE_DEFAULT_LAT=51.5074
VITE_DEFAULT_LNG=-0.1278
```

**New York, USA**

```
VITE_DEFAULT_LAT=40.7128
VITE_DEFAULT_LNG=-74.0060
```

**Los Angeles, USA**

```
VITE_DEFAULT_LAT=34.0522
VITE_DEFAULT_LNG=-118.2437
```

**Toronto, Canada**

```
VITE_DEFAULT_LAT=43.6532
VITE_DEFAULT_LNG=-79.3832
```

**Sydney, Australia**

```
VITE_DEFAULT_LAT=-33.8688
VITE_DEFAULT_LNG=151.2093
```

### How It Works

1. **Browser Geolocation (First Choice)**

   - The search page tries to get the user's actual location first
   - Requires user permission

2. **Environment Variables (Fallback)**

   - If geolocation is denied/unavailable, uses `VITE_DEFAULT_LAT` and `VITE_DEFAULT_LNG`
   - These should be set to your primary market's coordinates

3. **Hardcoded Fallback (Last Resort)**
   - If env vars not set, defaults to London (51.5074, -0.1278)

### Deployment Steps

#### Render

1. Go to your frontend service in Render dashboard
2. Navigate to "Environment" tab
3. Add the variables above
4. Click "Save Changes"
5. Service will redeploy automatically

#### Netlify

1. Go to Site Settings → Environment Variables
2. Add the variables
3. Trigger a new deployment

#### Vercel

1. Go to Project Settings → Environment Variables
2. Add the variables for Production environment
3. Redeploy

### Testing

After deployment, verify:

1. Search page loads and displays venues
2. Map centers on correct location
3. Distance calculations are accurate
4. Geolocation prompt works (if browser supports it)

### Notes

- The search page will still work without these variables, but will default to London
- Google Maps API key is separate and required for map functionality
- Coordinates should match your target market for best user experience
