# Funtasia 3D Map — Final Design Specification

> **Version:** v3-11-4 · **Last Updated:** 2026-04-27
> **Status:** Production · **Theme Engine:** Catppuccin × Tailwind CSS v4

---

## 1. Design Philosophy

The Funtasia design system follows the **"Digital Curator"** creative north star — treating every screen as a bespoke gallery space where information is *curated*, not merely displayed. It blends the Catppuccin palette with a high-end editorial lens: intentional asymmetry, tonal depth, and generous negative space.

### Core Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **Tonal Harmony** | All colors sourced from Catppuccin Latte / Mocha — no pure `#000` or `#FFF` |
| 2 | **No-Line Rule** | Boundaries defined by background-color shifts, never `1px solid` borders |
| 3 | **Glass & Gradient** | Floating elements use `backdrop-filter: blur()` + translucent surfaces |
| 4 | **Ambient Depth** | Tonal layering replaces traditional drop-shadows |
| 5 | **Softness** | All interactive elements use `xl` (1.5rem / 24px) or `lg` (1rem / 16px) radii |

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Build | Vite | 6.x |
| CSS | Tailwind CSS | 4.2.2 |
| Theme | `@catppuccin/tailwindcss` | 1.x |
| Plugins | `@tailwindcss/forms`, `@tailwindcss/container-queries` | — |
| JS Frameworks | Alpine.js (onboarding), Three.js (3D map) | 3.x, 0.172.x |
| PWA | `vite-plugin-pwa` | 0.21.x |
| Icons | Material Symbols Outlined (variable) | — |
| Fonts | Google Fonts (CDN) | — |

### CSS Architecture

```
src/css/
├── input.css         ← Tailwind entry (imports, @theme, @utility)
├── main.css          ← Map page: canvas, bottom-sheet, FABs, floor-selector, toast
├── modal.css         ← All modals: directory, settings, info, QR, events
├── events.css        ← Events timeline components
├── onboarding.css    ← Swipeable onboarding carousel
└── output.css        ← Compiled output (not edited directly)
```

### Page Structure

```
index.html   ← Onboarding carousel (Alpine.js driven)
map.html     ← 3D map page (Three.js canvas + all overlay UI)
```

---

## 3. Color System — Catppuccin Tokens

The app supports two flavors toggled via the `.latte` / `.mocha` class on `<html>`. Theme preference is persisted in `localStorage` under `funtasia-theme` and applied immediately on load (before paint) to prevent flash.

### 3.1 Surface Hierarchy

Depth is created by nesting surfaces from darkest to lightest (Mocha) or lightest to darkest (Latte):

| Level | Role | Token | Mocha | Latte |
|-------|------|-------|-------|-------|
| **L0** | Page background | `ctp-base` | `#1e1e2e` | `#eff1f5` |
| **L-1** | Recessed containers | `ctp-mantle` | `#181825` | `#e6e9ef` |
| **L-2** | Deepest insets | `ctp-crust` | `#11111b` | `#dce0e8` |
| **L+1** | Raised cards / sections | `ctp-surface0` | `#313244` | `#ccd0da` |
| **L+2** | Active / hover states | `ctp-surface1` | `#45475a` | `#bcc0cc` |
| **L+3** | Highest emphasis | `ctp-surface2` | `#585b70` | `#acb0be` |

### 3.2 Accent Palette

| Role | Token | Mocha | Latte | Usage |
|------|-------|-------|-------|-------|
| **Primary** | `ctp-mauve` | `#cba6f7` | `#8839ef` | FABs, modal titles, active states, CTA buttons |
| **Info / Location** | `ctp-blue` | `#89b4fa` | `#1e66f5` | Location tags, event badges |
| **Success** | `ctp-green` | `#a6e3a1` | `#40a02b` | Onboarding icons |
| **Warning** | `ctp-peach` | `#fab387` | `#fe640b` | Specialized highlights |
| **Error** | `ctp-red` | `#f38ba8` | `#d20f39` | Clear/reset actions |
| **Secondary** | `ctp-lavender` | `#b4befe` | `#7287fd` | Level selector, tertiary icons |

### 3.3 Text Hierarchy

| Role | Token | Mocha | Latte |
|------|-------|-------|-------|
| **Primary text** | `ctp-text` | `#cdd6f4` | `#4c4f69` |
| **Secondary text** | `ctp-subtext1` | `#bac2de` | `#5c5f77` |
| **Tertiary text** | `ctp-subtext0` | `#a6adc8` | `#6c6f85` |
| **Disabled / muted** | `ctp-overlay0` | `#6c7086` | `#9ca0b0` |

### 3.4 Semantic Aliases

```css
/* From input.css @theme overrides — override Catppuccin with project-specific fonts */
--font-headline: "JetBrains Mono", monospace;
--font-body:     "JetBrains Mono", monospace;
--font-label:    "JetBrains Mono", monospace;
```

> **Note:** The `input.css` @theme block maps all three font roles to **JetBrains Mono**. The original DESIGN.md spec'd Plus Jakarta Sans — both are loaded from Google Fonts. JetBrains Mono is the active production font.

---

## 4. Typography

### 4.1 Font Stack

| Role | Family | Weight Range | Loaded Via |
|------|--------|-------------|------------|
| **Headline** (`font-headline`) | JetBrains Mono | 400 – 700 | Google Fonts CDN |
| **Body** (`font-body`) | JetBrains Mono | 400 – 700 | Google Fonts CDN |
| **Label** (`font-label`) | JetBrains Mono | 400 – 700 | Google Fonts CDN |
| **Backup** | Plus Jakarta Sans | 400 – 800 | Google Fonts CDN (loaded but secondary) |
| **Icons** | Material Symbols Outlined | 100 – 700, FILL 0–1 | Google Fonts CDN |

### 4.2 Type Scale (as implemented)

| Role | Size | Weight | Letter Spacing | Line Height | Tailwind Class |
|------|------|--------|----------------|-------------|----------------|
| **Display** | 3.75rem (60px) | 800 | `-0.02em` | 1 | `text-6xl` |
| **Hero Title** | 1.875rem (30px) | 800 | `-0.02em` | 1.25 | `.slide-title` |
| **Modal Title** | 1.5rem (24px) | 800 | tight | — | `text-2xl font-extrabold tracking-tight` |
| **Section Header** | 1.25rem (20px) | 800 | tight | — | `text-xl font-extrabold tracking-tight` |
| **Body Large** | 1.125rem (18px) | 400 | normal | 1.625 | `text-lg leading-relaxed` |
| **Body** | 1rem (16px) | 400 | normal | 1.5 | default |
| **Body Small** | 0.875rem (14px) | 500 | normal | — | `text-sm font-medium` |
| **Caption** | 0.75rem (12px) | 600 | normal | — | `text-xs font-semibold` |
| **Label / Overline** | 11px | 700 | `0.1em` | 1 | `text-[11px] font-bold tracking-widest uppercase` |
| **Micro Label** | 10px | 700 | `0.1em` | 1 | `text-[10px]` |

### 4.3 Icon Configuration

Material Symbols Outlined uses variable font settings:

```css
font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
```

Filled variant override (used for specific icons like rocket_launch):
```css
font-variation-settings: 'FILL' 1;
```

Standard icon sizes: `18px`, `20px`, `22px`, `24px` (default), `48px` (hero).

---

## 5. Layout Structure

### 5.1 Map Page Layout

```
┌──────────────────────────────────────────────┐
│ [info_i]                    [floor-selector] │ ← Fixed, z-10
│ [event]                          L2          │
│                                  L1          │
│            ┌──────────┐         B1          │
│            │  3D Map   │         B2          │
│            │  Canvas   │         B3          │
│            │ (100vw×   │                     │
│            │  100vh)   │                     │
│            └──────────┘                     │
│                                              │
│ [✕ clear]              [qr] [settings] [dir]│ ← FABs, fixed z-9999
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │          Bottom Sheet (slide-up)          │ │ ← z-10001
│ │  ▬ handle                          [✕]   │ │
│ │  Title (mauve)                            │ │
│ │  Description (subtext1)                   │ │
│ │  [Enter Area] (conditional)               │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 5.2 Modal Layout (shared across all modals)

```
┌────────────────────────────────────────┐
│ ░░░░ backdrop (blur-xs) ░░░░░░░░░░░░░ │
│ ░ ┌──────────────────────────────┐ ░░ │
│ ░ │ HEADER  (crust bg, sticky)   │ ░░ │  85vw × 90vh
│ ░ │ Title (mauve) ·········· [✕] │ ░░ │  radius: 2rem
│ ░ │ Subtitle (subtext1)          │ ░░ │  ghost border: outline-variant 15%
│ ░ ├──────────────────────────────┤ ░░ │  ambient shadow: 32px 64px blur
│ ░ │ CONTENT (scrollable)         │ ░░ │
│ ░ │                              │ ░░ │
│ ░ │  [search bar]                │ ░░ │
│ ░ │  [filters / toggles]        │ ░░ │
│ ░ │  [list items / timeline]    │ ░░ │
│ ░ │                              │ ░░ │
│ ░ ├──────────────────────────────┤ ░░ │
│ ░ │ FOOTER FADE (gradient mask)  │ ░░ │
│ ░ └──────────────────────────────┘ ░░ │
└────────────────────────────────────────┘
```

### 5.3 Onboarding Layout

```
┌───────────────────────────────────────┐
│ HEADER: Logo + "Funtasia 3D Map" [Skip]│  h-16, px-6
├───────────────────────────────────────┤
│                                       │
│  ◄ [   Swipeable Card Carousel   ] ► │  flex-1, overflow-hidden
│     icon · title · description        │  touch swipe + nav buttons
│                                       │
├───────────────────────────────────────┤
│        ● ● ● ◉ ● ● ●                │  Dot indicators, py-8
└───────────────────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 Floating Action Buttons (FABs)

```css
.fab-btn {
  width: 40px;  height: 40px;
  border-radius: 50%;
  background: var(--color-ctp-mauve);
  color: var(--color-ctp-base);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-ctp-text) 12%, transparent);
}
```

| Button | Position | Icon |
|--------|----------|------|
| Directory | bottom: 20px, right: 16px | `menu_book` |
| Settings | bottom: 74px, right: 16px | `settings` |
| QR Scanner | bottom: 128px, right: 16px | `qr_code_scanner` |
| Info | top: 20px, right: 16px | `info_i` |
| Events | top: 74px, right: 16px | `event` |
| Clear Marker | top: 16px, left: 16px | `close` (conditional) |

### 6.2 Bottom Sheet

| Property | Value |
|----------|-------|
| Background | `ctp-surface0` with `backdrop-filter: blur(16px)` |
| Radius | `1.5rem` top corners |
| Shadow | `0 -8px 48px` with `ctp-text` at 6% opacity |
| Max height | 60vh (desktop), 70vh (mobile) |
| Animation | `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| Title color | `ctp-mauve`, 1.5em, weight 600, letter-spacing `-0.02em` |
| Description color | `ctp-subtext1`, 1em, line-height 1.5 |

### 6.3 Floor Selector

| Property | Value |
|----------|-------|
| Background | `ctp-surface0` with `backdrop-filter: blur(16px)` |
| Radius | `1.5rem` |
| Shadow | `0 8px 40px` with `ctp-text` at 6% |
| Button size | 40px × 40px (desktop), 36px × 36px (mobile) |
| Active thumb | `ctp-mauve-600`, circular, with glow shadow |
| Position | Fixed, right edge, vertically centered |
| Font | JetBrains Mono, 13px (12px mobile), weight 600 |

### 6.4 Toast Notification

| Property | Value |
|----------|-------|
| Background | `color-mix(ctp-mauve 30%, surface-container-high)` + `blur(12px)` |
| Radius | `1.5rem` |
| Font | JetBrains Mono, 14px, weight 500 |
| Shadow | `0 8px 40px` with `ctp-text` at 10% |
| Animation | Slide up + fade via `transform + opacity 0.3s` |

### 6.5 Modal Components

#### Search Input
- Background: `ctp-mantle` → `ctp-surface0` on focus
- Radius: `1rem`
- Focus effect: `2px` bottom shadow in `ctp-mauve`
- No border

#### List Items (`modal-list-item`)
- Background: `ctp-mantle`
- Hover: `ctp-surface1`
- Radius: `1rem` (rounded-2xl)
- No divider lines — use `space-y-6` (24px vertical gap)

#### Filter Chips (`filter-chip`)
- Background: `ctp-surface0`
- Active: `15%` of `--chip-color` background + colored text + colored border
- Radius: `full` (pill)
- Font: 11px bold uppercase, tracking widest

#### Toggle Selector
- Container: `ctp-surface0` background, `12px` radius, `6px` padding
- Active button: `ctp-mauve` background, `ctp-base` text
- Inactive: transparent background, `ctp-text` text
- Responsive: column layout below 480px

### 6.6 Onboarding Cards

| Property | Value |
|----------|-------|
| Slide transition | `transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)` |
| Card padding | `2.5rem 4rem 10rem` |
| Icon container | 6rem × 6rem, `1.5rem` radius |
| Title | font-headline, 1.875rem, weight 800, `-0.02em` tracking |
| Description | font-body, `large`, color `ctp-subtext1`, line-height 1.625 |
| Dot indicator | 8px circle → 24px pill (active), `ctp-surface1` → `ctp-mauve` |
| Nav buttons | Glassmorphic, `12px` radius, `ctp-mauve` at 12% with blur |
| Swipe hint | Glassmorphic pill with hand animation, ghost border |

### 6.7 Events Timeline

| Property | Value |
|----------|-------|
| Timeline line | `2px` width, `ctp-surface2`, absolute left |
| Dot | `12px` circle with `4px` ring in `ctp-base` |
| Item body | `padding: 1.25rem`, rounded-xl |
| Time label | font-label, 10px, uppercase, tracking widest |
| Title | font-headline, `text-lg` |
| Description | font-body, `text-sm`, `leading-relaxed` |
| Location badge | `ctp-blue/20` bg, `ctp-blue` text, pill shape |
| Tags | `ctp-surface2` border, pill shape |

---

## 7. Elevation & Depth

### Shadow Scale (all use `ctp-text` tinted, never pure black)

| Level | Usage | Spec |
|-------|-------|------|
| **Ambient** | Floating panels (bottom sheet, floor selector) | `0 8px 40–48px`, 6% opacity |
| **Elevated** | FABs | `0 8px 32px`, 12% opacity |
| **Modal** | Full modals | `0 32px 64px`, 8% opacity |
| **Glow** | Active floor thumb | `0 4px 24px` of `ctp-mauve` at 25% |

### Ghost Border (when borders are needed)

```css
border: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
```

Used on: modal cards, swipe hint containers, filter dropdowns (at 25%).

---

## 8. Animation & Motion

### Timing Functions

| Name | Curve | Usage |
|------|-------|-------|
| **Standard** | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| **Decelerate** | `cubic-bezier(0.2, 0, 0, 1)` | Floor thumb movement |
| **Spring** | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrance animations |

### Transition Durations

| Context | Duration |
|---------|----------|
| Color / background shifts | `0.3s` |
| Interactive hover/press | `0.15s – 0.2s` |
| Slide transitions | `0.4s` |
| Press feedback (scale) | `0.2s` |

### Key Animations

| Animation | Description |
|-----------|-------------|
| `hint-enter` | Swipe hint slides in from right (60px → 0, 0.5s) |
| `hint-swipe` | Swipe hint oscillates left (0 → -18px, 1.4s infinite) |
| `hand-nudge` | Hand icon nudges left (0 → -12px, 1.4s infinite) |
| `ping` | Pulse ring on rocket icon (1s infinite) |
| Bottom sheet | `translateY(100%) → translateY(0)` on `.show` |
| Toast | `translateY(100px) + opacity 0 → translateY(0) + opacity 1` |
| FAB press | `scale(0.92)` on `:active` |

---

## 9. Responsive Breakpoints

| Breakpoint | Target | Key Adjustments |
|------------|--------|-----------------|
| `≤ 480px` | Small phones | Toggle selector → column layout |
| `≤ 768px` | Tablets / large phones | Bottom sheet: smaller padding, 70vh max; Floor selector: 36px buttons; Nav buttons: tighter margins |

### Mobile-First Considerations

- `touch-action: none` on body (3D canvas takes over)
- `touch-action: pan-y` on bottom sheet (allows vertical scrolling)
- `-webkit-tap-highlight-color: transparent` globally
- `user-select: none` on interactive elements
- `safe-area-inset-bottom` padding on bottom sheet
- `100dvh` height on onboarding body

---

## 10. Z-Index Scale

| Z-Index | Element |
|---------|---------|
| `10` | Floor selector |
| `100` | Onboarding nav buttons |
| `200` | Exit child button |
| `1000` | Toast notifications |
| `9999` | FAB buttons |
| `10001` | Bottom sheet |
| `10002` | Bottom sheet close button |
| `200` (via `z-200`) | Modal wrappers |

---

## 11. Theme Switching

```javascript
// Immediate sync on page load (in <head>, before DOM render)
const savedTheme = localStorage.getItem('funtasia-theme') || 'latte';
document.documentElement.classList.remove('mocha', 'latte');
document.documentElement.classList.add(savedTheme);
```

### Transition Guards

All theme-sensitive properties include `transition: background 0.3s ease, color 0.3s ease` for smooth switching. The bottom sheet disables `backdrop-filter` during drag (`.shifting` class) for performance.

---

## 12. Do's and Don'ts — Quick Reference

### ✅ Do

- Use `color-mix()` for opacity blends (e.g., `color-mix(in srgb, var(--color-ctp-mauve) 15%, transparent)`)
- Stack tonal surfaces for depth instead of drop shadows
- Use Catppuccin token variables — never hardcode hex
- Apply generous whitespace: 24–32px between list items
- Use `backdrop-filter: blur(12–20px)` for floating elements
- Prefix all interactive elements with unique IDs

### ❌ Don't

- Use pure `#000000` or `#FFFFFF` anywhere
- Add `1px solid` dividers or borders (use ghost borders only when required)
- Use traditional `box-shadow` with black — always tint with `ctp-text`
- Skip the `transition` on `background` / `color` (causes flash on theme switch)
- Hardcode pixel colors in CSS — always reference CSS custom properties
