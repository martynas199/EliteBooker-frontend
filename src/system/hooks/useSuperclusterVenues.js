import { useMemo } from "react";
import Supercluster from "supercluster";

/**
 * Build a Supercluster index for venues.
 * Expects venues with venue.location.coordinates = [lng, lat]
 */
export function useSuperclusterVenues(venues) {
  const points = useMemo(() => {
    if (venues?.length > 0) {
      console.log('First venue in hook:', venues[0]);
      console.log('First venue location:', venues[0]?.location);
      console.log('First venue location.coordinates:', venues[0]?.location?.coordinates);
      console.log('All location keys:', Object.keys(venues[0]?.location || {}));
      console.log('Full location object:', JSON.stringify(venues[0]?.location, null, 2));
    }
    
    const filtered = (venues || []).filter((v) => {
      // Support multiple location formats:
      // 1. GeoJSON: { coordinates: [lng, lat] }
      // 2. Standard: { lat, lng } or { latitude, longitude }
      if (Array.isArray(v?.location?.coordinates)) return true;
      if (v?.location?.lat != null && v?.location?.lng != null) return true;
      if (v?.location?.latitude != null && v?.location?.longitude != null) return true;
      if (v?.lat != null && v?.lng != null) return true;
      return false;
    });
    console.log('useSuperclusterVenues - venues:', venues?.length, 'with coords:', filtered.length);
    
    return filtered.map((v) => {
      let coordinates;
      
      // Extract coordinates in [lng, lat] format (GeoJSON standard)
      if (Array.isArray(v?.location?.coordinates)) {
        coordinates = v.location.coordinates;
      } else if (v?.location?.lat != null && v?.location?.lng != null) {
        coordinates = [v.location.lng, v.location.lat];
      } else if (v?.location?.latitude != null && v?.location?.longitude != null) {
        coordinates = [v.location.longitude, v.location.latitude];
      } else if (v?.lat != null && v?.lng != null) {
        coordinates = [v.lng, v.lat];
      }
      
      return {
        type: "Feature",
        properties: {
          venueId: v._id,
          name: v.name,
        },
        geometry: {
          type: "Point",
          coordinates: coordinates,
        },
      };
    });
  }, [venues]);

  const index = useMemo(() => {
    const sc = new Supercluster({
      radius: 60,
      maxZoom: 18,
      minZoom: 0,
    });
    sc.load(points);
    console.log('Supercluster index created with', points.length, 'points');
    return sc;
  }, [points]);

  return { index, points };
}
