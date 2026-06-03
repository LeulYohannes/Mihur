---
name: Ethereal Academy
colors:
  surface: '#111223'
  surface-dim: '#111223'
  surface-bright: '#37374b'
  surface-container-lowest: '#0c0c1e'
  surface-container-low: '#1a1a2c'
  surface-container: '#1e1e30'
  surface-container-high: '#28283b'
  surface-container-highest: '#333346'
  on-surface: '#e2e0f9'
  on-surface-variant: '#e1bfb1'
  inverse-surface: '#e2e0f9'
  inverse-on-surface: '#2f2f42'
  outline: '#a88a7d'
  outline-variant: '#594137'
  surface-tint: '#ffb693'
  primary: '#ffb693'
  on-primary: '#561f00'
  primary-container: '#fb6d10'
  on-primary-container: '#562000'
  inverse-primary: '#a04100'
  secondary: '#ffb4a4'
  on-secondary: '#640d00'
  secondary-container: '#ca2501'
  on-secondary-container: '#ffe2dc'
  tertiary: '#7bd1fa'
  on-tertiary: '#003547'
  tertiary-container: '#48a2c9'
  on-tertiary-container: '#003547'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#ffb4a4'
  on-secondary-fixed: '#3e0500'
  on-secondary-fixed-variant: '#8d1700'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#7bd1fa'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#111223'
  on-background: '#e2e0f9'
  surface-variant: '#333346'
  background-deep: '#2E2E41'
  accent-orange: '#FB6D10'
  accent-red: '#EB3E1B'
  surface-light: rgba(255, 255, 255, 0.08)
  sunset-gradient: 'linear-gradient(135deg, #FB6D10 0%, #EB3E1B 50%, #2E2E41 100%)'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  section-gap: 40px
  overlap-offset: -24px
---

## Brand & Style

This design system targets an elite educational demographic, blending the intellectual rigor of traditional academia with a contemporary, high-production artistic flair. The brand personality is **visionary, warm, and sophisticated**, moving away from "ed-tech" utility toward a "masterclass" aesthetic.

The visual style is a fusion of **Glassmorphism** and **Modern-Tactile** design. It utilizes rich, spectral gradients that mimic a digital sunset—transitioning from deep charcoal into vibrant oranges and reds. This creates a sense of "enlightenment" or "the dawn of knowledge." Layouts should feel layered and dimensional, using semi-circular decorative elements and artistic overlaps to break the standard grid and evoke a more organic, artisanal feel.

## Colors

The palette is anchored by **Deep Navy (#2E2E41)**, providing a scholarly and premium foundation. Vibrancy is introduced through a dual-accent system of **Vibrant Orange** and **Deep Warm Red**, symbolizing energy and passion for learning.

- **Primary & Secondary:** Used for high-impact actions and atmospheric gradients.
- **Tertiary:** A soft sky blue derived from the reference material, used sparingly for "info" states or subtle highlights to cool down the warm palette.
- **Glass Surfaces:** Dark backgrounds are overlaid with semi-transparent white or neutral layers to create depth without losing the rich color temperature.

## Typography

The typography system relies on a **high-contrast pairing** that balances classic elegance with modern readability. 

**Playfair Display** serves as the primary voice for all headers. It should be used in large scales to showcase its sophisticated serifs. For mobile layouts, use the `headline-lg-mobile` variant to ensure long course titles remain legible.

**Inter** handles all functional text. It provides a clean, neutral counterpoint to the serif headers. Use the `label-md` style with increased letter-spacing for category tags and navigation elements to maintain a premium feel.

## Layout & Spacing

Designed primarily for a **mobile-first context**, the layout utilizes a dynamic fluid grid. To achieve the "artistic" requirement, elements should not always align to the vertical edges.

- **Artistic Overlaps:** Cards and images should occasionally use negative margins (`overlap-offset`) to stack over background "sunset" circles.
- **Sunset Elements:** Large, semi-circular decorative divs should be positioned absolutely behind content, using the `sunset-gradient` with high-radius blurs.
- **Safe Areas:** Maintain a strict 20px side margin for primary text content to ensure readability on edge-to-edge mobile displays.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Backdrop Blurs** rather than traditional heavy shadows.

- **Base Layer:** The Deep Navy (#2E2E41) background.
- **Mid Layer:** Semi-circular "Sunset" gradients with `blur(60px)` to create soft, atmospheric light.
- **Top Layer:** Floating cards using `backdrop-filter: blur(12px)` and a subtle 1px border of white at 10% opacity. This creates a "frosted glass" effect that picks up the warm glow from the layers beneath.
- **Shadows:** Use very soft, long-spread shadows with an orange-tinted glow (`rgba(251, 109, 16, 0.15)`) for active primary buttons.

## Shapes

The shape language is **Rounded**, leaning toward softness to contrast with the sharp serifs of the typography.

- **Cards & Containers:** Use `rounded-lg` (1rem) as the standard.
- **Buttons:** Use `rounded-xl` (1.5rem) to create a friendly, tactile "squishy" appearance.
- **Decorative Elements:** Background "Sunsets" should always be perfect circles or semi-circles.

## Components

### Buttons
Primary buttons use a horizontal gradient from `accent-orange` to `accent-red`. Text is white with a slight drop shadow for legibility. Secondary buttons are "ghost" style with a glass background and a 1px orange border.

### Cards
Educational course cards should feature a large image header. The content area uses the glassmorphism style (blurred background). Title text uses `headline-md` in Playfair Display.

### Chips & Tags
Used for course categories. These should be small, pill-shaped, and use a low-opacity version of the `accent-orange` background with high-contrast white `label-md` text.

### Input Fields
Darker than the background, with a subtle inner shadow. On focus, the border glows with the `accent-orange` color.

### Progress Indicators
For education tracking, use a thick, rounded bar. The "filled" portion uses the `sunset-gradient` to indicate progress toward "enlightenment."