---
name: OneClick Design System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5b4039'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#907067'
  outline-variant: '#e4beb4'
  surface-tint: '#b02f00'
  primary: '#b02f00'
  on-primary: '#ffffff'
  primary-container: '#ff5722'
  on-primary-container: '#541200'
  inverse-primary: '#ffb5a0'
  secondary: '#495f84'
  on-secondary: '#ffffff'
  secondary-container: '#bcd2fe'
  on-secondary-container: '#445a7f'
  tertiary: '#00628c'
  on-tertiary: '#ffffff'
  tertiary-container: '#007caf'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b1c7f2'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#31476b'
  tertiary-fixed: '#c8e6ff'
  tertiary-fixed-dim: '#86cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6d'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  oneclick-orange: '#FF5722'
  oneclick-navy: '#001B3D'
  success-green: '#10B981'
  warning-amber: '#FF9500'
  bg-muted: '#F5F5F7'
  border-subtle: '#E5E7EB'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  shift-price:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '900'
    lineHeight: '1.1'
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  body-muted:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
  nav-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter-mobile: 16px
  gutter-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  card-padding: 20px
  container-max-width: 1280px
  mobile-max-width: 450px
---

## Brand & Style

The design system is built on the pillars of **speed, reliability, and modern professionalism**. It bridges the gap between a high-energy B2C gig-economy platform and a structured, data-driven B2B management tool. The identity is designed to feel "instant"—reducing the friction between finding work and getting paid.

The aesthetic follows a **Corporate-Modern** direction with a **Tactile** edge. It utilizes high-contrast interfaces, substantial card-based layouts, and deliberate use of whitespace to ensure clarity in fast-paced environments. For B2C users, the experience is mobile-first and high-urgency; for B2B users, it shifts toward a precise, desktop-optimized dashboard that emphasizes efficiency and oversight.

**Key Visual Principles:**
- **High Signal-to-Noise:** Critical information like shift rates, locations, and times are elevated through weight and color.
- **Urgency through Contrast:** "Hot" shifts and immediate actions use the brand orange to demand attention.
- **Structured Depth:** Layers and shadows are used to distinguish between the persistent UI (navigation/action bars) and the scrollable content.

## Colors

The palette is split into two strategic modes to cater to different user segments while maintaining brand cohesion.

**Primary & Secondary Application:**
- **OneClick Orange:** Used for all primary calls to action, high-priority shift indicators, and critical B2C interactions. It signifies energy and the "click."
- **OneClick Navy:** Acts as the anchor for the B2B dashboard. It provides a sense of stability, professionalism, and depth, used primarily for sidebars, headers, and structural elements in the business portal.

**Functional Colors:**
- **Neutral:** A deep near-black is used for primary headings to ensure maximum legibility against the white/muted backgrounds.
- **Success & Warning:** Derived from Ukrainian digital standards (Dія-inspired), providing a familiar safety net for verification and ratings.
- **Backgrounds:** A soft grey (`#F5F5F7`) is used for the main canvas to allow white cards to "pop" with subtle elevation.

## Typography

This design system utilizes **Inter** exclusively to provide a clean, highly legible, and neutral foundation that works across both high-density data tables and mobile cards.

**Hierarchical Logic:**
- **Emphasis on Weight:** Rather than relying solely on size, the system uses font weights (from 500 up to 900) to create a visual "shout" for important data points like shift pay and titles.
- **Tight Leading for Display:** Headers and price points use a reduced line-height to keep information compact and impactful.
- **Localized Clarity:** Cyrillic characters are carefully balanced; heavy weights (800+) are preferred for Ukrainian titles to maintain the energetic brand voice.
- **Mobile Adjustments:** Display sizes scale down on mobile but maintain their heavy weight to ensure they remain the focal point of the screen.

## Layout & Spacing

The system operates on a strict **4px/8px grid** to ensure mathematical harmony across all components.

**B2C Layout (Mobile-First):**
- Uses a **Fluid Grid** with fixed horizontal margins of 16px.
- Components are stacked vertically with 16px gaps.
- A "Sticky Action Tier" is employed at the bottom of the screen, housing primary CTAs just above the navigation bar.

**B2B Layout (Desktop-First):**
- Uses a **Fixed Grid** within a 1280px container.
- Implements a 12-column system for dashboard layouts.
- Left-hand persistent navigation (Navy) with a width of 260px.
- Content areas utilize 32px padding to accommodate data-heavy tables and complex filter sets.

**Breakpoints:**
- **Mobile:** < 450px (Single column, maximum reachability).
- **Tablet:** 451px - 1024px (Transition to 2-column card grids).
- **Desktop:** > 1024px (Full dashboard view with sidebar).

## Elevation & Depth

Hierarchy is established through **Tonal Layers** supplemented by **Ambient Shadows**.

- **Level 0 (Canvas):** The base background (`#F5F5F7`). All main content sits here.
- **Level 1 (Cards):** White surfaces (`#FFFFFF`) with a `shadow-md` (8px blur, 8% opacity). These are the primary interactive containers for shifts and data blocks.
- **Level 2 (Floating):** Navigation bars and sticky action buttons. These use a more pronounced shadow to indicate they exist on a plane above the scrollable content.
- **The Orange Glow:** Primary brand buttons in the B2C view utilize a tinted shadow (`rgba(255, 87, 34, 0.3)`) to create a "tactile push" effect, making the button feel physically pressable.
- **B2B Precision:** In the business portal, elevation is minimized in favor of 1px borders (`#E5E7EB`) to maximize data density without visual clutter.

## Shapes

The shape language is **distinctly rounded**, moving away from "sharp" corporate aesthetics to a more approachable, modern "app" feel.

- **Standard Radius (16px):** Used for primary buttons and smaller info-boxes.
- **Large Radius (20px):** The default for all shift cards and main container blocks. This creates a soft, friendly silhouette.
- **Full Radius (Pill):** Reserved for status tags (e.g., "Verified," "Hot Shift") and filter chips.
- **Interactive States:** On press, cards should subtly scale (0.98x) rather than changing shape, maintaining the tactile metaphor.

## Components

**Buttons:**
- **Primary (OneClick Orange):** High-contrast white text, 16px radius, bold weight. Includes a subtle orange ambient shadow.
- **Secondary (OneClick Navy):** Used primarily in B2B for secondary actions or "Save" functions.
- **Ghost/Outline:** 1px border for neutral actions like "Cancel" or "Filters."

**Cards (B2C Shift Cards):**
- Must feature the "Price per Shift" in the top right using the `shift-price` typography.
- Information (Location, Date, Duration) should be stacked with 8px spacing.
- Includes a 12px padding internal "Tag" for category labeling.

**Input Fields:**
- Large tap targets (minimum 48px height for mobile).
- 16px corner radius with a 1px `#E5E7EB` border that turns OneClick Orange on focus.
- Labels use `label-bold` positioned above the input.

**B2B Data Tables:**
- High-density rows (40px height).
- Alternating row highlights or 1px dividers.
- Sticky headers for long shift lists.

**Bottom Navigation (Mobile):**
- 90px height including safe area.
- Active icons use OneClick Orange; inactive use `text-muted`.
- Labels use `nav-label` (11px) to ensure no overflow in localized Ukrainian text.