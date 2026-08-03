# Refactoring History, Thoughts, and Resolution Tracking

This document tracks the steps, thoughts, and technical details of the refactoring and troubleshooting process.

## Steps & Implementation

### 1. Code Quality & Type Safety (TypeScript compilation)
* **Goal**: Ensure the Next.js storefront compiles completely clean with `tsc --noEmit`.
* **Fixes implemented**:
  * Added size prop support to the checkout `SubmitButton` to match Medusa UI `<Button>` types.
  * Corrected React 19 `useActionState` signature mismatch in `edit-address-modal.tsx` (moved `addressId` from action state to a hidden form input) and `profile-billing-address/index.tsx` (changed `error: false` to `error: null`).
  * Updated parent templates (`CartTemplate`, `OrderDetails`, `OrderCompleted`, etc.) to pass down the active `currencyCode` to line items, ensuring unit price and total price components are typed and formatted properly.
  * cast the promotion value to a `Number` in `discount-code/index.tsx` to align with the parameter expectations of `convertToLocale`.
  * Declared `LencoPay` on the global `Window` interface in `LencoButton.tsx`.
  * Added `HttpTypes` namespace imports and typecasts to line item enrichment.
  * Handled Next.js 15 asynchronous `cookies()` resolution in `order-completed-template.tsx` and `product-onboarding-cta/index.tsx`.
  * Cast refinement list sorting value to satisfy compile-time type requirements.
  * Removed unused imports (`getProductsList`, `getCollectionsList`) to reduce runtime and compilation noise.
* **Result**: `npx tsc --noEmit` completes successfully with **zero errors**.

### 2. Google Maps Location Picker
* **Goal**: Enable precise delivery coordinate lookup, draggable marker adjustments, and dashboard tracking.
* **Implementation**:
  * Implemented fallback between `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_KEY` to prevent loading failures when either name is configured.
  * Enabled automatic browser geolocation lookup on mount if no location coordinates are pre-selected in the checkout form.
  * Fixed `setAddresses` server action to correctly read coordinate data from `location.lat` / `location.lng` fields and write them into the cart's metadata object.
  * Rendered the coordinates and a Google Maps tracking link in the order details and order completed screens.

### 3. Aspect Ratio and Styling
* **Goal**: Enforce square images globally for products and site thumbnails.
* **Implementation**: Modified `Thumbnail` component default size/classes to use Tailwind's `aspect-square` utility globally.

### 4. Region & Currency
* **Goal**: Ensure pricing follows region defaults and displays in Zambian Kwacha (ZMW/ZMK) for Zambia (`zm`).
* **Implementation**:
  * Updated `convertToLocale` in `money.ts` to uppercase all currency codes before formatting via `Intl.NumberFormat`, preventing RangeErrors (e.g. for lowercase `zmw` / `zmk`).
  * Configured default region to `zm` in `.env.local`.

### 5. Google Sign‑In
* **Goal**: Seamless login auto-sync that coexists with email/password authentication.
* **Implementation**:
  * Mounted `<GoogleAutoSignIn>` directly on the Welcome back login panel.
  * Modified the Google session synchronization effect in `useMedusaAuth` to redirect to `/account` only when signing in from `/login` or `/register` paths; otherwise, it reloads the page to preserve checkout context.

### 6. Branding & Brand Colors
* **Goal**: Apply brand colors globally and place logo in header/footer.
* **Implementation**:
  * Customized Tailwind colors (`tailwind.config.js`) to map `amber` to brand primary `#fd9706` and `blue` to brand secondary `#066cfd`.
  * Created reusable `<Logo>` component with premium styled SVG and text, and integrated it into the navigation header and footer.

### 7. Checkout Flow & Lenco Payment
* **Goal**: Simplify checkout fields and set Lenco as the sole payment method.
* **Implementation**:
  * Simplified input fields in `ShippingAddress` to first name, last name, phone, email, and Google Maps location.
  * Configured Lenco as the sole payment method.
  * Updated `PaymentButton` to render the interactive `LencoButton` component (which manages script load, inline popup, and verification) conditionally after name, phone, optional email, and maps location coordinates are fully populated.

---

## Troubleshooting the "Error setting up the request" Cart Error

### Diagnosis
1. Triggering the `addToCart` request threw a 500 Internal Server Error from the Medusa backend.
2. In `medusa-error.ts`, the catch handler expects Axios-like error objects (`error.response`/`error.request`). Since the new Medusa JS SDK uses `fetch`, these properties were undefined, causing the error message to fall back to the generic string:
   `Error setting up the request: An unknown error occurred.`
3. Started the Medusa backend in dev mode using `pnpm dev` to capture console logs.
4. The backend output showed the exact server crash:
   `TypeError: Cannot read properties of undefined (reading 'calculated_amount') at get-variants-and-items-with-prices.ts`
5. Verified the database schema and contents: the active region is configured for `zmk` (Zambian Kwacha) currency, but product variants only had prices defined for `usd` and `eur`.
6. When calculating the line-item prices for the cart in ZMK, Medusa's core pricing engine found no matching currency records in the database, resulting in an undefined price reference and crashing the workflow.

### Resolution
1. Created `backend/insert-prices.js` to query all variant prices in `usd` and copy them to both `zmk` and `zmw` currencies, converting the currency amounts using a conversion multiplier of 25 (e.g. 15 USD = 375 ZMK).
2. Ran the database script against the host's native PostgreSQL server:
   ```bash
   node insert-prices.js
   ```
   *Successfully processed prices. Inserted 44 new ZMK/ZMW price rows.*
3. Re-ran the diagnostic cart test script: the backend responded with `200 OK` and successfully created/returned the cart and line items.
4. Cleaned up all diagnostic files (`test-add-to-cart.ts` / `test-db.js` / `check-prices.js` / `show-columns.js`).
