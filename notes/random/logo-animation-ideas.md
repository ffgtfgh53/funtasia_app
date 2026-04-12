# Funtasia Logo Animation Guide

This document catalogs the structure of the SVG logo and provides new ideas and technical strategies for animating it in the browser. 

The logo SVG elements can be referenced by the following Inkscape IDs grouping individual parts:

| Element | Target ID | Description |
|---|---|---|
| Letter F | `g168` | "F" character containing the mushroom cap |
| Letter U | `g169` | Default "U" character |
| Letter N | `g170` | Default "N" character |
| Letter T | `g171` | Default "T" character |
| Letter A (1) | `g175` | First "A" character |
| Letter S | `g174` | Default "S" character |
| Letter I | `g177` | "I" character and the purple dot container |
| Letter A (2) | `g176` | Second "A" character configured as a Circus Tent |
| "i" Dot | `path31` | The dot positioned above the "i" |
| Glints | `path53`, `path56` | Light reflection glints on the "i" dot |

---

## 🎨 New Animation Ideas

If you'd like to bring back animations in a new, distinct style, consider the following interaction concepts:

### 1. The Interactive "Parallax" Depth Effect
Since the logo is loaded directly into the DOM, you can bind an event listener to the `mousemove` event in the viewport. 
* **Idea**: Slightly translate each letter linearly in opposite directions depending on the cursor's location on the screen. 
* **Technical Details**: Use `e.clientX` and `e.clientY` to compute the offset ratio. Apply a different multiplier to each letter group (e.g. `g168` moves 10px, while `g174` moves 4px) to simulate 3D depth and parallax floating.

### 2. "Draw In" SVG Stroke Effect
A very modern way to introduce an SVG before filling it with color is tracing its outline.
* **Idea**: Instead of dropping the letters in, have the lines drawing themselves out of thin air, followed by the gradient filling in.
* **Technical Details**: Target `path` tags inside the SVG, remove the fill (set `fill: transparent;`) and add a continuous `stroke`. Using CSS transitions, manipulate the `stroke-dasharray` and `stroke-dashoffset` to match the path's total length (measured by JS `path.getTotalLength()`). Bring the `fill` back when the stroke tracing is finished.

### 3. Clickable Elastic Squeeze (Squash and Stretch)
Using physics principles to make interactions playful.
* **Idea**: Let the user click or tap on individual letters. On click, the letter compresses downwards (squash) and expands horizontally, then rubber-bands back into place over a few bouncy frames.
* **Technical Details**: Use a keyframe animation triggering `transform: scale(1.2, 0.8) translateY(...)` at `50%` and returning to `scale(1, 1)` by adjusting the transform origin to `bottom center`. Hook this to an `onclick` listener instead of hover, allowing the user to literally "play" the logo.

### 4. Continuous Flowing Liquid Wave
Rather than a staggered drop in, the logo simulates floating on a gentle sea current.
* **Idea**: Every letter bobs up and down subtly, but entirely out-of-phase with each other, creating a ripple that translates left to right indefinitely across "FUNTASIA".
* **Technical Details**: Loop an animation moving the Y-position from `-4px` to `4px`. Give each letter incrementing `animation-delay` offsets (e.g. 0s, 0.2s, 0.4s, 0.6s) so they naturally wave.

### 5. The "Attracting/Repelling" Magnet
Give the user's mouse pointer a "physical" presence inside the logo.
* **Idea**: As the pointer gets close to a letter, the letter leans away slightly or shrinks back as if repelled by a magnetic force, or stretches *towards* it.
* **Technical Details**: You can calculate the distance between the mouse X,Y and each letter's bounding box using `getBoundingClientRect()`. Transform the rotation and scale in Javascript proportionally based dynamically on the hypotenuse distance.

---

**Note:** Always remember when transforming SVG `<g>` elements that their coordinates are relative to the viewport. Ensure `transform-origin` is explicitly set (like `center center` or `center bottom`) so rotations and scales don't unexpectedly swing the letters wide out of their bounding box.
