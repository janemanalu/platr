import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/dev/ScreenStub';

export default function LogAVisit() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();
  return (
    <ScreenStub
      name="Log a Visit"
      figmaNode="13:2948 / 13:3829"
      note={`${restaurantId ? `restaurant: ${restaurantId} (pre-filled)` : 'restaurant: search or select'} — Food/Vibe sliders (0–10, 0.5), notes, photo, status, tag friends, tags, anon suggestion, Save Entry.`}
    />
  );
}
