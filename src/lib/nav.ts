import type { Href, ImperativeRouter } from 'expo-router';

/**
 * `router.back()` throws/warns "The action 'GO_BACK' was not handled" when
 * there's no history to pop — e.g. the screen was opened directly via a deep
 * link rather than pushed from within the app. Use this everywhere a screen
 * offers a "Back" affordance instead of calling `router.back()` directly.
 */
export function goBack(router: ImperativeRouter, fallback: Href = '/') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
