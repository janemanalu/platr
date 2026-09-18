import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type DeviceLocation = { lat: number; lng: number };

/** The device's real current position, if permission is granted. Null while
 *  loading or if unavailable/denied — callers should degrade gracefully
 *  (e.g. hide a "distance" line) rather than fabricate a location. */
export function useDeviceLocation() {
  const [location, setLocation] = useState<DeviceLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // No location available (denied, simulator with no location set, etc.) — leave null.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
