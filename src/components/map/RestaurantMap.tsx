import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapViewType from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { Text } from '@/components/ui';
import { JAKARTA_CENTER } from '@/lib/geo';
import { colors, gray, radius, space } from '@/theme';

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  /** Short label inside the pin — restaurant initials. */
  label: string;
};

export type RestaurantMapProps = {
  pins: MapPin[];
  onPressPin: (id: string) => void;
  style?: object;
};

// react-native-maps has real native code, so it isn't part of the fixed set
// of modules the plain Expo Go client ships with. Just *importing* it there
// crashes the app instantly (it registers a native view manager at module-
// evaluation time), so the import itself must be conditional — not just the
// render — via `require()` reached only outside Expo Go. A custom dev build
// gets the real interactive map for free since this check just flips.
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Maps = IS_EXPO_GO ? null : (require('react-native-maps') as typeof import('react-native-maps'));
const MapView = Maps?.default;
const Marker = Maps?.Marker;

// Used as the default view when there are no pins yet.
const JAKARTA_REGION: Region = {
  latitude: JAKARTA_CENTER.lat,
  longitude: JAKARTA_CENTER.lng,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

function regionForPins(pins: MapPin[]): Region {
  if (pins.length === 0) return JAKARTA_REGION;
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  // Pad the bounding box so edge pins aren't flush against the map's border.
  const latitudeDelta = Math.max((maxLat - minLat) * 1.8, 0.02);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.8, 0.02);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

/**
 * A real interactive map (Apple Maps on iOS, Google Maps on Android — the
 * default react-native-maps provider, no API key needed for either) with
 * grayscale pins consistent with the rest of the app. Auto-fits to the given
 * pins, or centers on Jakarta when there are none yet.
 *
 * Renders a static placeholder instead under Expo Go — see IS_EXPO_GO above.
 */
export function RestaurantMap({ pins, onPressPin, style }: RestaurantMapProps) {
  if (IS_EXPO_GO || !MapView || !Marker) return <StaticMapFallback pins={pins} onPressPin={onPressPin} style={style} />;
  return <LiveMap pins={pins} onPressPin={onPressPin} style={style} />;
}

// Only ever rendered when Maps loaded successfully (see RestaurantMap above).
const Map = MapView!;
const Pin = Marker!;

function LiveMap({ pins, onPressPin, style }: RestaurantMapProps) {
  const mapRef = useRef<MapViewType>(null);
  const region = regionForPins(pins);
  // Re-center (without fighting the user's own pan/zoom) whenever the pins
  // actually change — e.g. Discovery's filters, or Home's logs finishing load.
  const pinsKey = pins.map((p) => p.id).join(',');

  useEffect(() => {
    if (pins.length > 0) mapRef.current?.animateToRegion(regionForPins(pins), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey]);

  return (
    <Map ref={mapRef} style={[styles.map, style]} initialRegion={region}>
      {pins.map((pin) => (
        <Pin
          key={pin.id}
          coordinate={{ latitude: pin.lat, longitude: pin.lng }}
          onPress={() => onPressPin(pin.id)}
          tracksViewChanges={false}
        >
          <View style={styles.pin}>
            <Text variant="micro" color="onActive">
              {pin.label}
            </Text>
          </View>
        </Pin>
      ))}
    </Map>
  );
}

/** Same tappable pins, laid out by normalized lat/lng position instead of a real map tile. */
function StaticMapFallback({ pins, onPressPin, style }: RestaurantMapProps) {
  const laidOut = layOutPins(pins);
  return (
    <View style={[styles.fallback, style]}>
      {laidOut.map((pin) => (
        <Pressable key={pin.id} onPress={() => onPressPin(pin.id)} style={[styles.pin, styles.fallbackPin, { left: pin.x, top: pin.y }]}>
          <Text variant="micro" color="onActive">
            {pin.label}
          </Text>
        </Pressable>
      ))}
      <Text variant="micro" color="textFaint" style={styles.fallbackNote}>
        Real map needs a dev build — Expo Go preview
      </Text>
    </View>
  );
}

function layOutPins(pins: MapPin[]) {
  if (pins.length === 0) return [];
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const norm = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));
  return pins.map((p) => ({
    ...p,
    x: `${10 + norm(p.lng, minLng, maxLng) * 76}%` as const,
    y: `${10 + (1 - norm(p.lat, minLat, maxLat)) * 76}%` as const,
  }));
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  fallback: { flex: 1, backgroundColor: gray[200] },
  pin: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 3,
    borderRadius: radius.none,
    backgroundColor: colors.textBody,
    borderWidth: 1.5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackPin: { position: 'absolute' },
  fallbackNote: { position: 'absolute', right: space[2], bottom: space[1] },
});

export default RestaurantMap;
