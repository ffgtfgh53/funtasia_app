# The Design System: Editorial Sophistication in Tonal Harmony

## 1. Overview & Creative North Star: "The Digital Curator"

This design system moves away from the clinical, "boxed-in" nature of traditional SaaS interfaces. Our Creative North Star is **The Digital Curator**. We treat every screen as a bespoke gallery space where information isn't just "displayed"—it is curated. 

By leveraging the iconic Catppuccin palette through a high-end editorial lens, we replace rigid grids with **intentional asymmetry** and **tonal depth**. We bypass the "standard" look by prioritizing negative space and breathing room, allowing the typography and soft surfaces to do the heavy lifting. The result is a signature experience that feels as much like a premium physical magazine as it does a functional digital tool.

---

## 2. Colors: Tonal Architecture

Our color philosophy is rooted in the interplay between **Latte (Light)** and **Mocha (Dark)**. We treat color not as decoration, but as architecture.

### Color Tokens (Latte & Mocha)
*   **Primary (The Accent):** `#b5cfff` (Latte Blue) / `#89b4fa` (Mocha Blue). Used for intent and momentum.
*   **Secondary:** `#d9b9ff` (Mauve). Used for secondary interactions and brand flourishes.
*   **Tertiary:** `#ffc19b` (Peach). Reserved for specialized highlights or warnings.
*   **Surfaces:** Ranging from `surface_container_lowest` (`#0d0d1c`) to `surface_bright` (`#383849`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional borders create visual noise that traps the eye. Instead, define boundaries through **background color shifts**. Use `surface_container_low` for sections sitting on top of the base `background`. The transition should be felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers—like stacked sheets of fine, heavy-weight paper.
*   **Level 0:** Base `background` (`#121221`).
*   **Level 1:** `surface_container_low` for major page sections.
*   **Level 2:** `surface_container` for primary cards/modules.
*   **Level 3:** `surface_container_high` for floating menus or active states.

### The "Glass & Gradient" Rule
To elevate the system beyond a "flat" look, employ **Glassmorphism** for floating elements (modals, dropdowns). 
*   **Backdrop-blur:** 12px to 20px.
*   **Opacity:** 70-80% of the surface color.
*   **Gradients:** Use subtle linear gradients on CTAs, transitioning from `primary` to `primary_container`. This adds a "soul" and depth that static hex codes lack.

---

## 3. Typography: Editorial Authority

We use **Plus Jakarta Sans** as our primary voice. It is clean, modern, and carries an inherent premium feel.

*   **Display (lg/md/sm):** Used for "Hero" moments. Use high contrast in size (3.5rem) to create an editorial focal point. Letter-spacing should be set to `-0.02em`.
*   **Headline & Title:** These are the structural anchors of the page. Use `headline-lg` (`2rem`) for section headers to command attention without being aggressive.
*   **Body (lg/md/sm):** The workhorse. `body-lg` (`1rem`) ensures maximum readability for long-form content. 
*   **Label:** Used for meta-data and overlines. Always set in uppercase with slightly increased tracking (+0.05em) to differentiate from body text.

**Interaction:** When a Headline appears next to a Display font, ensure the Headline is significantly smaller to create a clear "Primary vs. Secondary" visual narrative.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are forbidden. We create "lift" through **Tonal Layering** and **Ambient Diffusion**.

### The Layering Principle
Depth is achieved by stacking. Place a `surface_container_lowest` card on a `surface_container_low` section. This creates a natural, soft "recessed" effect that is much more sophisticated than a heavy shadow.

### Ambient Shadows
If an element must "float" (e.g., a primary Action Button or a Modal):
*   **Blur:** 30px to 60px.
*   **Opacity:** 4% - 8%.
*   **Tint:** Instead of black, use the `on_surface` color as the shadow tint. This simulates how real light behaves in a colored environment.

### The "Ghost Border" Fallback
If accessibility requirements demand a border, use the **Ghost Border**: `outline_variant` token at **15% opacity**. It should be barely perceptible, serving as a hint rather than a hard boundary.

---

## 5. Components: Softness & Intent

All components follow the **xl (1.5rem / 24px)** or **lg (1rem / 16px)** roundedness scale to ensure a "soft" tactile feel.

### Buttons
*   **Primary:** Gradient from `primary` to `primary_container`. Text in `on_primary`. Shape: `xl` (Round 24).
*   **Secondary:** Ghost-style with a `surface_variant` background and `primary` text. No border.
*   **Tertiary:** Pure text with an underline that only appears on hover.

### Cards & Lists
*   **Prohibition:** Never use divider lines.
*   **Alternative:** Use 24px to 32px of vertical white space (the "Breathing Room" rule) or subtle background shifts between items.
*   **Cards:** Use `surface_container` with a `1rem` (lg) corner radius. Elements within the card should have an asymmetric layout—for example, right-aligned meta-labels and left-aligned titles.

### Input Fields
*   **Base:** `surface_container_highest` with `0.5rem` (sm) rounding.
*   **Focus State:** No thick border. Instead, use a subtle 2px bottom-accent in `primary` and a 5% increase in background brightness.

### Custom Component: The "Content Curtain"
A unique component for this system—a full-width `surface_container_low` section that slides up over the background as the user scrolls, creating a theatrical transition between page sections.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but place imagery or CTA buttons slightly off-center to create visual interest.
*   **Use Whitespace as a Tool:** If a section feels crowded, double the padding. This is a premium system; it needs room to breathe.
*   **Stack Surfaces:** Always check if you can use a background color change before reaching for a shadow.

### Don't:
*   **Use Pure Black/White:** Use the specific Catppuccin tokens. Pure #000 or #FFF breaks the tonal harmony.
*   **Use 1px Lines:** Dividers, borders, and outlines are the enemies of this system's "curated" aesthetic.
*   **Default to Grids:** While the underlying math should be solid, the visual representation should feel fluid and organic.