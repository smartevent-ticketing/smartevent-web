---
name: Kinetic Pulse
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d9e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464555'
  inverse-surface: '#273143'
  inverse-on-surface: '#ecf0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4c42e9'
  primary: '#493ee5'
  on-primary: '#ffffff'
  primary-container: '#635bff'
  on-primary-container: '#fefaff'
  inverse-primary: '#c3c0ff'
  secondary: '#5a5d73'
  on-secondary: '#ffffff'
  secondary-container: '#dee1fb'
  on-secondary-container: '#606379'
  tertiary: '#ae2424'
  on-tertiary: '#ffffff'
  tertiary-container: '#d13e3a'
  on-tertiary-container: '#fffaf9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#321ed2'
  secondary-fixed: '#dee1fb'
  secondary-fixed-dim: '#c2c5de'
  on-secondary-fixed: '#171b2d'
  on-secondary-fixed-variant: '#42465a'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#910913'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d9e3fb'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  numeric-tabular:
    fontFamily: Be Vietnam Pro
    fontSize: inherit
    fontWeight: inherit
    lineHeight: inherit
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-performance event ticketing environment, balancing the raw energy of live experiences with the precision of a secure financial platform. The brand personality is **dynamic, reliable, and frictionless**. It speaks to both the excited fan seeking a ticket and the professional organizer managing a venue.

The aesthetic follows a **Modern / Corporate Hybrid** style:
- **High Energy:** Driven by the "Electric Indigo" primary color to evoke a sense of digital-first innovation.
- **Structural Integrity:** Grounded in a rigid 8pt grid and crisp layouts to ensure users feel their transactions are secure.
- **Vietnamese Optimization:** Layouts are specifically tuned for Vietnamese diacritics, ensuring tall line-heights to prevent character clipping and maintain legibility.

## Colors
The palette is centered on **Electric Indigo**, a high-vibrancy hue that commands attention for primary actions. The background uses a subtle cool-grey (#F7F8FC) to reduce eye strain and allow the white surface cards to pop. 

**Color Application Rules:**
- **Action Hierarchy:** Use Electric Indigo for primary "Mua vé ngay" (Buy tickets now) buttons. Use Coral exclusively for accents like "Hot" tags or urgent alerts.
- **Accessibility:** Ensure all text-on-color combinations meet WCAG 2.1 AA standards. For Indigo, use white text only.
- **Semantic Clarity:** Use Midnight Navy for deep navigation bars and footers to provide a grounded, professional frame for the content.

## Typography
This design system utilizes **Be Vietnam Pro** for its excellent support of Vietnamese accent marks and its contemporary, geometric look. 

**Implementation Notes:**
- **Tabular Numbers:** Critically, use `font-variant-numeric: tabular-nums` for all price displays, countdown timers, and ticket quantities to prevent horizontal "jitter" when numbers change.
- **Vietnamese Legibility:** Maintain a minimum line-height of 1.5x for body text to accommodate stacking diacritics (e.g., "ỗ", "ặ").
- **Visual Scale:** Display sizes are reserved for event titles. Labels use medium weights (500) to ensure they remain legible even at small sizes (12px).

## Layout & Spacing
The system operates on a strict **8pt grid**. All margins, paddings, and component heights must be multiples of 8 (with 4px used only for micro-spacing between icons and labels).

**Grid Model:**
- **Desktop:** 12-column fluid grid. 24px gutters. 1280px max-width container.
- **Mobile:** 4-column grid. 16px margins. 16px gutters.
- **Reflow:** Cards should stack vertically on mobile. Navigation shifts from a horizontal header to a bottom navigation bar or a full-screen hamburger menu.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Soft Shadows**, avoiding the heavy opacity of glassmorphism to maintain maximum performance and clarity on mobile devices.

- **Level 0 (Base):** #F7F8FC.
- **Level 1 (Surface):** White cards (#FFFFFF) with a 1px border (#E4E7EC).
- **Level 2 (Shadow):** Used for interactive elements like hover states. `box-shadow: 0px 4px 20px rgba(16, 20, 38, 0.08)`.
- **Level 3 (Overlay):** Used for modals and ticket selectors. `box-shadow: 0px 12px 32px rgba(16, 20, 38, 0.12)`.

Focus rings must be high-contrast, using a 2px Electric Indigo offset to ensure keyboard navigation is visible for accessibility.

## Shapes
The shape language is **Rounded**, conveying a friendly and approachable feel while remaining professional.

- **Standard Elements:** Buttons, inputs, and small cards use a **10px** (0.625rem) radius.
- **Large Containers:** Large event cards and modals use a **16px** (1rem) radius.
- **Pill Elements:** Tags and badges (e.g., "Sắp diễn ra") use a fully rounded/pill radius.

## Components
Consistent component behavior is vital for trust in a ticketing platform.

- **Primary Button:** 48px height, Electric Indigo background, white text, 10px radius. Bold weight. One per screen for the critical path (e.g., "Thanh toán").
- **Input Fields:** 1px border (#E4E7EC), 12px horizontal padding. On focus, the border changes to Electric Indigo with a soft glow.
- **Event Cards:** White surface, 16px padding. Image at the top with a 16px top-only radius. Price must be displayed in **Bold Tabular Numbers** at the bottom right.
- **Ticket Counter:** Large "+" and "-" buttons (40x40px) to ensure touch-friendly interaction on mobile.
- **Status Chips:** Small, pill-shaped badges with low-opacity background colors (e.g., Success green at 10% opacity) and high-opacity text.
- **Focus Rings:** Mandatory 2px indigo outline with 2px offset for all interactive elements when using keyboard navigation.