import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { goBack } from '@/lib/nav';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, fontFamily, space, type as typeScale } from '@/theme';

/** Figma 54:8332 — email in, reset link out, then a confirmation state. */
export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack(router, '/sign-in')} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        </Pressable>
        <Text variant="title" color="textStrong">
          Forgot Password
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {sent ? (
          <View style={styles.confirm}>
            <Ionicons name="mail-outline" size={40} color={colors.textDisabled} />
            <Text variant="h2" color="textStrong">
              Check your email
            </Text>
            <Text variant="body" color="textMuted" style={styles.center}>
              If an account exists for {email.trim()}, a reset link is on its way.
            </Text>
            <Button label="Back to Sign In" variant="link" onPress={() => goBack(router, '/sign-in')} />
          </View>
        ) : (
          <View style={styles.body}>
            <Text variant="body" color="textMuted">
              Enter the email address linked to your account and we'll send you a reset link.
            </Text>

            <View style={styles.field}>
              <Text variant="sectionLabel" color="textLabel">
                Email address
              </Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {error ? (
              <Text variant="small" color="textBody">
                {error}
              </Text>
            ) : null}

            <Button label="Send Reset Link" fullWidth loading={busy} onPress={submit} style={styles.submit} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.divider,
  },
  headerBtn: { width: 24, alignItems: 'flex-start' },

  body: { paddingHorizontal: space[5], paddingTop: space[6], gap: space[3] },
  field: { gap: space[2], paddingTop: space[3] },
  input: {
    borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    color: colors.textBody,
    fontFamily,
    fontSize: typeScale.body.fontSize,
  },
  submit: { marginTop: space[2] },

  confirm: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[6] },
  center: { textAlign: 'center' },
});
