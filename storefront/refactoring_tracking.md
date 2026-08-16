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

### 8. Customer Care, About Page, Account Integration, Footer & UI Accessibility
* **Goal**: Implement Amazon-inspired Customer Care hub, Amazon-inspired "Who We Are" About page, unified Account & Checkout name integration with Google sign-in auto-prompting, redesigned compact footer, and accessible theme controls.
* **Implementation**:
  * **Customer Care Hub (`/customer-care`)**:
    * Created Amazon-inspired issue category cards (*Orders & Tracking*, *Returns & Refunds*, *Payments & Lenco*, *Delivery & Makeni Pickup*, *Auto Garage & Vehicles*, *Solar Power Systems*).
    * Implemented interactive live search filtering across categorized FAQs and accordion expansion.
    * Added direct contact channels for Phone (+260-978-883-420 / +260-966-666-608), Email (info@syastore.com), and Makeni Road physical showroom.
    * Built interactive contact form with topic dropdown, optional order ID, validation, and feedback state.
    * Updated legacy `/customer-service` route to render `CustomerCareView` for seamless backwards compatibility.
  * **About Page (`/about`)**:
    * Implemented Amazon "Who We Are"-inspired company profile with a bold hero banner and mission statement.
    * Detailed SYA Store's 5 core service pillars: Vehicle Showroom, Auto Garage & Diagnostics, Renewable Solar Energy, Household & Hardware, and Express Logistics.
    * Outlined guiding values (Customer Obsession, Uncompromising Ethics, Practical Innovation, Quality Guarantee) and trust metrics.
    * Added comprehensive Lusaka showroom & service center visit card with full address and direct hotlines.
  * **Account & Checkout Integration**:
    * Display full customer / Google account name prominently across Account Overview, Mobile Account Nav, and Checkout Page.
    * Built `CheckoutAccountBadge` component displaying signed-in status (`Signed in as [Name] ([email])`), active Google account detection, and 1-click login prompt for guests.
    * Enhanced `ShippingAddress` to automatically pre-populate `first_name`, `last_name`, `phone`, and `email` from active customer/Google profile.
    * Enhanced `GoogleAutoSignIn` to detect browser Google sessions and auto-prompt linking with one-click connection.
  * **Footer Redesign**:
    * Redesigned footer to be sleek, uncluttered, and compact (reducing excessive padding).
    * Organized 4 clear columns: Brand & Address, Quick Links (`/about`, `/customer-care`, `/store`, `/account`), Featured Categories, and Customer Support.
    * Fixed broken SVG href link, replacing it with proper Next.js localized link to `/about`.
  * **UI & Accessibility Fixes**:
    * Enhanced `ThemeToggle` with `aria-label`, `aria-pressed`, `role="button"`, and high-contrast visible focus rings.
    * Cleaned up unused imports in `Nav` and added proper accessible labels.
    * Verified 100% type-safe compilation with `tsc --noEmit`.

