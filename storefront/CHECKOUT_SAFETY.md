# Checkout Safety & Payment Implementation Guide

## Overview
This document outlines the safety improvements made to the MercurJS checkout flow, including error handling, payment gateway resilience, and order notifications.

## Implementation Details

### 1. Error Boundary Protection

**Location**: `src/modules/checkout/components/checkout-error-boundary/index.tsx`

Wraps critical checkout sections to prevent full-page crashes. If a component fails:
- User sees a friendly error message instead of "Something went wrong!"
- Can retry the operation without page refresh
- Error is logged for debugging

**Usage**:
```tsx
<CheckoutErrorBoundary fallback={<ErrorUI />}>
  <YourComponent />
</CheckoutErrorBoundary>
```

### 2. Safe Data Fetching

**Location**: `src/lib/data/checkout-safety.ts`

Provides graceful fallbacks for critical checkout data:
- `safeRetrieveCart()` - Returns null if cart unavailable
- `safeListShippingMethods()` - Returns empty array if methods unavailable
- `safeGetCustomer()` - Continues as guest if customer data fails
- `safeCheckRegion()` - Returns default region if check fails
- `withTimeout()` - Prevents indefinite hangs

**Benefits**:
- Backend errors don't crash the checkout page
- Missing data is handled gracefully
- Timeouts prevent indefinite loading states

### 3. Enhanced Payment Gateway (Lenco)

**Location**: `src/modules/checkout/components/LencoButton.tsx`

**Key Improvements**:
- Singleton reset before each payment attempt ensures fresh state
- Back navigation no longer crashes the payment widget
- onError callback handles Lenco SDK errors gracefully
- Better state recovery if widget initialization fails
- User can retry payment multiple times without issues

**Flow**:
1. User clicks "Pay" button
2. resetLencoPay() clears old singleton instance
3. Fresh script injected to get new Lenco widget
4. Payment processed with proper error handling
5. On close/error, state is reset for next attempt

**Back Navigation Safety**:
```
User navigates back → onClose fires → resetLencoPay() → state cleared
User clicks Pay again → Fresh widget loads → No "silent ignore" issue
```

### 4. Order Notifications

**Location**: `backend/src/subscribers/order-placed.ts`

**Supports**:
- **Email**: Order confirmation with items and shipping details
- **SMS/Phone**: Short confirmation message to customer phone
- **Graceful Degradation**: Email failure doesn't block SMS; SMS failure doesn't block order creation

**SMS Message Format**:
```
"Hi [Name], your order #[ID] has been confirmed! Total: [Amount] ZMW. Track it at [store-url]."
```

**Configuration**:
- Phone extracted from `shipping_address.phone`
- Whitespace/special characters removed for SMS
- Both channels attempted; failures logged but don't cascade

### 5. Deferred Shipping Price Display

**Location**: `src/modules/checkout/components/shipping/index.tsx`

**Behavior**:
- **Shipping selection step (open)**: Prices visible for each option
- **Summary view (collapsed)**: Price shown only after delivery confirmed
- **Pickup**: No price change needed (pickup is free/fixed)

**Benefits**:
- Reduces sticker shock before delivery confirmed
- Encourages users to complete delivery selection before seeing cost
- Clear indication of price changes as options change

### 6. Checkout Layout Error Boundary

**Location**: `src/app/[countryCode]/(checkout)/layout.tsx`

- Wraps entire checkout content in error boundary
- Provides fallback UI if checkout logic crashes
- Includes link back to cart for recovery

### 7. Checkout Page Safety

**Location**: `src/app/[countryCode]/(checkout)/checkout/page.tsx`

- Uses safe data fetching for cart and customer
- Handles line item enrichment failures gracefully
- Wraps checkout form and summary in error boundaries

## Environment Variables Required

```env
# Lenco Payment
NEXT_PUBLIC_LENCO_KEY=pub-xxxx
LENCO_BASE_URL=https://sandbox.lenco.co/access/v2/
LENCO_SECRET_KEY=xxxx

# SMS Notifications (if using external SMS provider)
SMS_PROVIDER_API_KEY=xxxx
SMS_PROVIDER_BASE_URL=xxxx

# Storefront URL (for order tracking in SMS)
STOREFRONT_URL=https://store.example.com
```

## Testing Checklist

- [ ] Cart loads successfully
- [ ] Payment widget initializes on payment button click
- [ ] Payment widget closes cleanly when user cancels
- [ ] User can click pay again after closing
- [ ] Back navigation doesn't crash widget
- [ ] Network error shows user-friendly message
- [ ] Missing Lenco keys shows clear error
- [ ] Email sent on successful order
- [ ] SMS sent on successful order (if phone available)
- [ ] Error boundary shows fallback UI on component crash
- [ ] Shipping prices hidden until step is active
- [ ] Summary shows shipping price after confirmed

## Monitoring & Debugging

**Console Logs**:
- `[Checkout Error]` - Error boundary catches
- `[Checkout Safety]` - Safe data fetching fallbacks
- `[Lenco]` - Payment gateway events
- `[Order Notifications]` - Email/SMS send attempts

**Common Issues**:

| Issue | Cause | Fix |
|-------|-------|-----|
| "Initializing payment..." loops | Widget script failed to load | Check CDN access to lenco.co |
| Payment widget not opening | Singleton not reset | Ensure resetLencoPay() is called |
| SMS not sending | Phone field empty | Require phone in shipping address |
| Back button crashes | Old singleton still active | resetLencoPay() called on onClose |
| Shipping price always shows | isOpen check wrong | Verify searchParams handling |

## Future Improvements

1. Add retry logic for SMS notifications
2. Support multiple SMS providers
3. Add order status tracking link in SMS
4. Implement payment timeout recovery
5. Add analytics for checkout flow completion
6. Support voice call notifications as fallback

## References

- Lenco API: https://lenco-api.readme.io/v2.0/reference/introduction
- Medusa Workflows: https://docs.medusajs.com/learn/fundamentals/workflows
- Medusa Subscribers: https://docs.medusajs.com/learn/fundamentals/events/subscribers
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
