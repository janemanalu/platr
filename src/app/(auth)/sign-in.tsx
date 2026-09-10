import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

type Mode = 'sign-in' | 'sign-up';

/**
 * Minimal email + password gate — there's no auth screen in the Figma. On the
 * root layout, a valid session swaps this out for the tab navigator.
 */
export default function SignIn() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const cleanUser = username.trim().replace(/[^a-zA-Z0-9_]/g, '');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: cleanUser, display_name: cleanUser || email.split('@')[0] } },
        });
        if (error) throw error;
        if (!data.session) setNotice('Check your email to confirm, then sign in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <View style={styles.body}>
          <View style={styles.header}>
            <Text variant="h1" color="text">
              Platr
            </Text>
            <Text variant="body" color="textMuted">
              {mode === 'sign-in' ? 'Sign in to your account.' : 'Create an account.'}
            </Text>
          </View>

          <View style={styles.fields}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {mode === 'sign-up' ? (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            ) : null}
          </View>

          {error ? (
            <Text variant="small" color="textBody">
              {error}
            </Text>
          ) : null}
          {notice ? (
            <Text variant="small" color="textFaint">
              {notice}
            </Text>
          ) : null}

          <Button
            label={mode === 'sign-in' ? 'Sign in' : 'Sign up'}
            fullWidth
            loading={busy}
            onPress={submit}
          />
          <Button
            label={mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            variant="link"
            onPress={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError(null);
              setNotice(null);
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', gap: space[3] },
  header: { gap: space[1], marginBottom: space[2] },
  fields: { gap: space[2] },
  input: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    color: colors.textBody,
    fontFamily,
    fontSize: typeScale.body.fontSize,
  },
});
