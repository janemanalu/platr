import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { SearchField, Text } from '@/components/ui';
import { autocompleteRestaurants, getPlaceDetails, type PlaceDetails, type PlaceSuggestion } from '@/lib/googlePlaces';
import { borderWidth, colors, space } from '@/theme';

export type PlaceSearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called once a suggestion is tapped and its full details are fetched. */
  onSelect: (details: PlaceDetails) => void;
  placeholder?: string;
  /** Bias results toward a location, e.g. the user's current area. */
  bias?: { lat: number; lng: number };
};

/**
 * Restaurant search backed by Google Places Autocomplete + Details. Debounces
 * input, shows a dropdown of suggestions, resolves full details on selection.
 */
export function PlaceSearchField({ value, onChangeText, onSelect, placeholder, bias }: PlaceSearchFieldProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    if (!open || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    debounceRef.current = setTimeout(async () => {
      const results = await autocompleteRestaurants(query, bias);
      if (requestId.current === id) {
        setSuggestions(results);
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, open]);

  async function handleSelect(s: PlaceSuggestion) {
    setOpen(false);
    setSuggestions([]);
    onChangeText(s.mainText);
    setResolving(true);
    const details = await getPlaceDetails(s.placeId);
    setResolving(false);
    if (details) onSelect(details);
  }

  return (
    <View>
      <SearchField
        placeholder={placeholder ?? 'Search or select…'}
        value={value}
        onChangeText={(t) => {
          onChangeText(t);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {resolving ? (
        <View style={styles.resolving}>
          <ActivityIndicator size="small" color={colors.textFaint} />
          <Text variant="caption" color="textFaint">
            Loading place details…
          </Text>
        </View>
      ) : null}
      {open && (loading || suggestions.length > 0) ? (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator size="small" color={colors.textFaint} />
            </View>
          ) : (
            suggestions.map((s, i) => (
              <Pressable
                key={s.placeId}
                onPress={() => handleSelect(s)}
                style={[styles.row, i < suggestions.length - 1 && styles.rowDivider]}
              >
                <Text variant="small" color="textBody" numberOfLines={1}>
                  {s.mainText}
                </Text>
                {s.secondaryText ? (
                  <Text variant="caption" color="textDisabled" numberOfLines={1}>
                    {s.secondaryText}
                  </Text>
                ) : null}
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth,
    borderColor: colors.border,
    borderTopWidth: 0,
    backgroundColor: colors.bg,
  },
  row: { paddingHorizontal: space[3], paddingVertical: space[2], gap: 2 },
  rowDivider: { borderBottomWidth: borderWidth, borderBottomColor: colors.dividerFaint },
  resolving: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingTop: space[1] },
});

export default PlaceSearchField;
