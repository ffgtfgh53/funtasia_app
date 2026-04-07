# Animating the Funtasia Logo with `fetch()` and CSS Keyframes

## Overview

Rather than pasting the entire SVG inline in your HTML, you can load `funtasia.svg` at runtime using the browser's `fetch()` API, inject it into the DOM, and then animate individual paths and groups using CSS `@keyframes`. This keeps your HTML clean while giving you full access to every element inside the SVG.

---

## Part 1 — Loading the SVG with `fetch()`

### How `fetch()` works

`fetch()` is a browser API that retrieves a resource over the network and returns a **Promise**. For SVG files, you read the response as plain text, then inject it directly into a container element. Once injected, the SVG is part of the live DOM and every element inside it — paths, groups, circles — is queryable and animatable.

```js
fetch('/assets/funtasia.svg')
  .then(response => response.text())
  .then(svgText => {
    document.getElementById('logo-container').innerHTML = svgText;
  });
```

### Using `async/await` (recommended)

The `async/await` syntax is cleaner for chaining multiple steps after the load:

```js
async function loadLogo() {
  const response = await fetch('/assets/funtasia.svg');
  const svgText  = await response.text();

  const container = document.getElementById('logo-container');
  container.innerHTML = svgText;

  // Make the SVG responsive
  const svg = container.querySelector('svg');
  svg.setAttribute('width',  '100%');
  svg.setAttribute('height', 'auto');

  // Run animations only after SVG is in the DOM
  initAnimations(svg);
}

loadLogo();
```

> **Important:** Always call your animation setup function *inside* the `.then()` callback or after the `await`. If you try to query SVG elements before the fetch completes, they won't exist yet.

### HTML setup

```html
<div id="logo-container"></div>

<script src="logo.js"></script>
```

That's all you need in the HTML. The SVG is loaded and injected entirely from JavaScript.

---

### Using Vite or a bundler (`?raw` import)

If you are using Vite, you can skip `fetch()` entirely and import the SVG as a raw string at build time — no network request required:

```js
import logoSVG from './funtasia.svg?raw';

document.getElementById('logo-container').innerHTML = logoSVG;
initAnimations(document.getElementById('logo-container').querySelector('svg'));
```

For **React**, use the `react-inlinesvg` library:

```jsx
import SVG from 'react-inlinesvg';

<SVG src="/assets/funtasia.svg" onLoad={() => initAnimations()} />
```

---

## Part 2 — Targeting Elements Inside the SVG

The Funtasia SVG was created in Inkscape with labelled groups. After injection, you can query them exactly as you would any DOM element.

| Element | Inkscape label | SVG `id` |
|---------|---------------|-----------|
| Letter F (with mushroom) | `F` | `g168` |
| Letter U | `U` | `g169` |
| Letter N | `N` | `g170` |
| Letter T | `T` | `g171` |
| Letter A (first) | `A1` | `g175` |
| Letter S | `S` | `g174` |
| Letter I (with dot) | `I` | `g177` |
| Letter A (circus tent) | `A2` | `g176` |
| The dot on the "i" | — | `path31` |
| Dot highlight glints | — | `path53`, `path56` |

```js
function initAnimations(svg) {
  const iGroup  = svg.getElementById('g177');   // entire "i" letter group
  const dot     = svg.getElementById('path31'); // the dot circle
  const tentA   = svg.getElementById('g176');   // circus tent "a"
  const mushroomF = svg.getElementById('g168'); // "F" with mushroom cap
}
```

---

## Part 3 — Animating with CSS `@keyframes`

### What are `@keyframes`?

`@keyframes` let you define an animation as a sequence of states. You describe what the element looks like at `0%` (start) and `100%` (end), and the browser smoothly interpolates between them. You can add intermediate steps at any percentage.

```css
@keyframes myAnimation {
  0%   { /* start state */ }
  50%  { /* midpoint     */ }
  100% { /* end state    */ }
}
```

Apply an animation to an element using the `animation` shorthand:

```css
.element {
  animation: myAnimation 1s ease-in-out infinite;
  /*         name        dur  easing          iteration */
}
```

---

### Animation 1 — Staggered letter entrance (on load)

Each letter drops down from above with a slight bounce, one after another, giving the logo a playful reveal.

```css
@keyframes dropIn {
  from {
    opacity:   0;
    transform: translateY(-20px);
  }
  to {
    opacity:   1;
    transform: translateY(0);
  }
}
```

```js
const letterIds = ['g168','g169','g170','g171','g175','g174','g177','g176'];

letterIds.forEach((id, index) => {
  const group = svg.getElementById(id);
  group.style.animation      = `dropIn 0.5s ease-out both`;
  group.style.animationDelay = `${index * 0.08}s`;
});
```

The `both` fill-mode means each letter stays hidden before its delay fires, and stays visible after the animation ends.

---

### Animation 2 — "i" dot light flash (loop)

The dot on the "i" pulses between purple and yellow — like a carnival bulb flickering on — while short rays radiate outward.

#### Step 1 — Flash the dot colour and size

```css
@keyframes dotFlash {
  0%, 100% {
    fill: #ba42e5;   /* purple */
  }
  50% {
    fill: #ffea00;   /* yellow */
  }
}
```

```js
const dot = svg.getElementById('path31');
dot.style.animation = 'dotFlash 0.7s ease-in-out infinite';
```

#### Step 2 — Pulse the existing highlight glints

`path53` and `path56` are small yellow highlight shapes already in the SVG. Fading them in and out reinforces the light effect without adding new elements.

```css
@keyframes glintPulse {
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1;   }
}
```

```js
['path53', 'path56'].forEach((id, i) => {
  const glint = svg.getElementById(id);
  glint.style.animation      = 'glintPulse 0.7s ease-in-out infinite';
  glint.style.animationDelay = `${i * 0.05}s`;
});
```

#### Step 3 — Add radiating rays

Rays are new `<line>` elements added programmatically around the dot centre (`cx=190, cy=10` in SVG coordinates). They are appended directly into the `g177` group.

```js
const DOT_CX = 190;
const DOT_CY = 10;
const RAY_LENGTH = 14;

// Angles in degrees for 6 evenly spaced rays
const angles = [0, 60, 120, 180, 240, 300];

const iGroup = svg.getElementById('g177');

angles.forEach((angle, i) => {
  const rad = (angle * Math.PI) / 180;
  const x2  = DOT_CX + Math.cos(rad) * RAY_LENGTH;
  const y2  = DOT_CY + Math.sin(rad) * RAY_LENGTH;

  const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  ray.setAttribute('x1', DOT_CX);
  ray.setAttribute('y1', DOT_CY);
  ray.setAttribute('x2', x2);
  ray.setAttribute('y2', y2);
  ray.setAttribute('stroke', '#ffea00');
  ray.setAttribute('stroke-width', '2.5');
  ray.setAttribute('stroke-linecap', 'round');
  ray.style.animation      = 'rayPulse 0.7s ease-in-out infinite';
  ray.style.animationDelay = `${i * 0.06}s`;

  iGroup.appendChild(ray);
});
```

```css
@keyframes rayPulse {
  0%, 100% { opacity: 0; }
  50%       { opacity: 1; }
}
```

> **Note on coordinates:** The `g177` group has a `transform="translate(...)"` applied in Inkscape. When you append new elements inside the group, they automatically inherit that transform — your ray coordinates are relative to the group's local space, not the full SVG canvas.

---

### Animation 3 — Circus tent "a" bounce (loop)

The second "a" (which contains the circus tent illustration) bobs gently up and down.

```css
@keyframes tentBob {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-6px); }
}
```

```js
const tentA = svg.getElementById('g176');
tentA.style.animation       = 'tentBob 1.4s ease-in-out infinite';
tentA.style.transformOrigin = 'center bottom';
```

---

### Animation 4 — Mushroom "F" wiggle (on hover)

The "F" wobbles when hovered, using a CSS class toggled by JavaScript.

```css
@keyframes mushroomWiggle {
  0%, 100% { transform: rotate(0deg);  }
  25%       { transform: rotate(-6deg); }
  75%       { transform: rotate(6deg);  }
}

.wiggle {
  animation: mushroomWiggle 0.5s ease-in-out;
  transform-origin: center bottom;
}
```

```js
const mushroomF = svg.getElementById('g168');

mushroomF.addEventListener('mouseenter', () => {
  mushroomF.classList.add('wiggle');
});

// Remove class when animation ends so it can re-trigger
mushroomF.addEventListener('animationend', () => {
  mushroomF.classList.remove('wiggle');
});
```

---

### Animation 5 — Colour cycle across all letters (loop)

All letters shift through the brand colours together, with a small delay offset per letter so the effect ripples across the wordmark.

```css
@keyframes colorCycle {
  0%   { fill: #fd4901; }  /* orange */
  33%  { fill: #ba42e5; }  /* purple */
  66%  { fill: #feda00; }  /* yellow */
  100% { fill: #fd4901; }  /* back to orange */
}
```

```js
const letterIds = ['g168','g169','g170','g171','g175','g174','g177','g176'];

letterIds.forEach((id, index) => {
  // Animate every path inside the group (fill lives on <path>, not <g>)
  const group = svg.getElementById(id);
  group.querySelectorAll('path').forEach(path => {
    path.style.animation      = 'colorCycle 3s linear infinite';
    path.style.animationDelay = `${index * 0.15}s`;
  });
});
```

> **Why target `path` inside the `<g>`?** In SVG, `fill` is a presentational attribute on individual `<path>` elements. Setting `animation` on the `<g>` wrapper only works if the paths inherit fill from it — but since Inkscape writes explicit `fill` attributes on each path, you need to animate the paths directly.

---

## Putting it all together

```js
async function loadLogo() {
  const response = await fetch('/assets/funtasia.svg');
  const svgText  = await response.text();

  const container = document.getElementById('logo-container');
  container.innerHTML = svgText;

  const svg = container.querySelector('svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', 'auto');

  initAnimations(svg);
}

function initAnimations(svg) {
  // 1. Staggered entrance
  const letterIds = ['g168','g169','g170','g171','g175','g174','g177','g176'];
  letterIds.forEach((id, i) => {
    const g = svg.getElementById(id);
    g.style.animation      = 'dropIn 0.5s ease-out both';
    g.style.animationDelay = `${i * 0.08}s`;
  });

  // 2. "i" dot flash
  svg.getElementById('path31').style.animation = 'dotFlash 0.7s ease-in-out infinite';

  // 3. Tent bob
  const tentA = svg.getElementById('g176');
  tentA.style.animation       = 'tentBob 1.4s ease-in-out infinite';
  tentA.style.transformOrigin = 'center bottom';

  // 4. Mushroom wiggle on hover
  const mushroomF = svg.getElementById('g168');
  mushroomF.style.cursor = 'pointer';
  mushroomF.addEventListener('mouseenter', () => mushroomF.classList.add('wiggle'));
  mushroomF.addEventListener('animationend', () => mushroomF.classList.remove('wiggle'));
}

loadLogo();
```

---

## Quick Reference

| Animation | Target ID | CSS property animated | Trigger |
|-----------|-----------|----------------------|---------|
| Staggered entrance | `g168`–`g176` | `opacity`, `transform` | On load |
| Dot light flash | `path31`, `path53`, `path56` | `fill`, `opacity` | Loop |
| Radiating rays | New `<line>` elements in `g177` | `opacity` | Loop |
| Tent bob | `g176` | `transform: translateY` | Loop |
| Mushroom wiggle | `g168` | `transform: rotate` | Hover |
| Colour cycle | All `path` inside letter groups | `fill` | Loop |
