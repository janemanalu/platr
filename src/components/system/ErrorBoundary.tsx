import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { colors, space } from '@/theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Last-resort catch for render/lifecycle errors anywhere below it — a bad
 * placeholder lookup, a bug in a screen, whatever. Without this, one thrown
 * error blanks the whole app (a red screen in dev, a crash in production).
 * Route-level bugs (e.g. an unhandled GO_BACK) should be fixed at the source —
 * see src/lib/nav.ts — this is the net under everything else.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary] caught:', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text variant="caption" color="textLabel">
          something broke
        </Text>
        <Text variant="h2" color="text">
          Something went wrong
        </Text>
        <Text variant="body" color="textMuted" numberOfLines={4}>
          {error.message || 'An unexpected error occurred.'}
        </Text>
        <Button label="Try again" onPress={this.reset} style={styles.button} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: space[5],
    gap: space[2],
  },
  button: { marginTop: space[3], alignSelf: 'stretch' },
});

export default ErrorBoundary;
