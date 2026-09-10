import { View, StyleSheet } from 'react-native';

import { Button, Card, Chip, Screen, Text } from '@/components/ui';
import { space } from '@/theme';

/**
 * Placeholder landing screen. Exists so the base primitives can be eyeballed in
 * the simulator during setup — replaced by the real Home screen in the screens step.
 */
export default function Index() {
  return (
    <Screen scroll>
      <View style={styles.block}>
        <Text variant="caption" color="textLabel">
          setup check
        </Text>
        <Text variant="h1" color="text">
          Platr
        </Text>
        <Text variant="body" color="textMuted">
          social media, but for F&amp;B. Base components below.
        </Text>
      </View>

      <View style={styles.block}>
        <Text variant="sectionLabel" color="textLabel">
          Buttons
        </Text>
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Button label="See all (6)" variant="link" onPress={() => {}} />
        <Button label="Disabled" disabled onPress={() => {}} />
      </View>

      <View style={styles.block}>
        <Text variant="sectionLabel" color="textLabel">
          Chips
        </Text>
        <View style={styles.row}>
          <Chip label="Italian" />
          <Chip label="Wishlist" active />
          <Chip label="Open now" />
          <Chip label="$$" static />
        </View>
      </View>

      <View style={styles.block}>
        <Text variant="sectionLabel" color="textLabel">
          Card
        </Text>
        <Card>
          <Text variant="cardTitle" color="textStrong">
            Osteria Fiorella
          </Text>
          <Text variant="caption" color="textLabel">
            Italian · 0.8 km
          </Text>
        </Card>
        <Card padding={3} onPress={() => {}}>
          <Text variant="body" color="textBody">
            Pressable card
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: space[2],
    paddingVertical: space[3],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
});
