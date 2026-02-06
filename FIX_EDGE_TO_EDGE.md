# 🔧 Edge-to-Edge Fix for All Screens

## Problem
15 screens have buttons/content cut off by Android navigation bar because they use hardcoded `paddingBottom: 40` instead of dynamic safe area insets.

## Solution
Replace hardcoded padding with `useSafeAreaInsets()` hook.

## Screens to Fix

### Pattern 1: ScrollView with hardcoded contentContainerStyle
```typescript
// BEFORE (BAD)
<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

// AFTER (GOOD)
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
```

### Pattern 2: Footer/Button container with hardcoded padding
```typescript
// BEFORE (BAD)
const styles = StyleSheet.create({
  footer: {
    paddingBottom: 40,
  }
});

// AFTER (GOOD)
<View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
```

## Files Requiring Fix

1. ✅ app/address-setup.tsx - Line 522 + footer buttons
2. ✅ app/booking-summary.tsx - Bottom action bar
3. ✅ app/confirm-pickup.tsx - Line 211 + proceed button
4. ✅ app/confirm-return.tsx - Line 204 + proceed button
5. ✅ app/date-selection.tsx - Line 503 + action buttons
6. ✅ app/forgot-password.tsx - Line 231 + submit button
7. ✅ app/index.tsx - Line 503 + get started button
8. ✅ app/new-password.tsx - Line 342 + submit button
9. ✅ app/reset-password-otp.tsx - Line 235 + verify button
10. ✅ app/return-scan-challan.tsx - Line 199 + action buttons
11. ✅ app/return-scan-product.tsx - Line 304 + next button
12. ✅ app/scan-challan.tsx - Line 203 + action buttons
13. ✅ app/scan-product.tsx - Line 336 + next button
14. ✅ app/verification.tsx - Line 323 + submit button
15. ✅ app/verify-otp.tsx - Line 285 + verify button

## Implementation Steps

For EACH screen:

1. **Add import at top:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';
```

2. **Add hook in component:**
```typescript
export default function ScreenName() {
  const insets = useSafeAreaInsets();
  // ... rest of code
```

3. **Fix ScrollView contentContainerStyle:**
```typescript
// Find this pattern:
contentContainerStyle={{ paddingBottom: 40 }}

// Replace with:
contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
```

4. **Fix footer/button containers:**
```typescript
// Find this pattern:
<View style={styles.footer}>

// Replace with:
<View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
```

5. **Remove hardcoded paddingBottom from StyleSheet:**
```typescript
// REMOVE or reduce this:
footer: {
  paddingBottom: 40, // ❌ Remove this
  // Keep other styles
}
```

## Testing Checklist

After fixing each screen:
- [ ] Content doesn't overlap navigation buttons
- [ ] Buttons are fully visible and tappable
- [ ] Works on phones WITH gesture navigation
- [ ] Works on phones WITHOUT gesture navigation
- [ ] Smooth scrolling with proper spacing

## Quick Fix Script

You can use find/replace across all files:

**Find:** `paddingBottom: 40`
**Replace:** `paddingBottom: insets.bottom + 40`

Then manually add the imports and hook declarations.

---

**Status:** Ready to apply fixes to all 15 screens
