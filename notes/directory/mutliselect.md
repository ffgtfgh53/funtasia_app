# Pill Multiselect — Implementation Guide

A clean, tag-driven multiselect component built on [Choices.js](https://github.com/Choices-js/Choices) with pill-style selected items, outline badges, and Material Symbols icons.

---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [File Structure](#file-structure)
4. [HTML Skeleton](#html-skeleton)
5. [Generating Options from a Tag List](#generating-options-from-a-tag-list)
6. [Initialising Choices.js](#initialising-choicesjs)
7. [CSS — Full Override](#css--full-override)
8. [Material Symbols Cross Icon](#material-symbols-cross-icon)
9. [Reading Selected Values](#reading-selected-values)
10. [Clear All Button](#clear-all-button)
11. [Complete Working Example](#complete-working-example)
12. [Customisation Reference](#customisation-reference)

---

## Overview

The component renders a `<select multiple>` element enhanced by Choices.js. Options are generated programmatically from a JavaScript array of tags — no hard-coded `<option>` elements needed. Selected items appear as outlined pills inline with the input. Each pill carries a Material Symbols `close` icon as its remove button.

Key decisions made in this implementation:

| Feature | Choice |
|---|---|
| Option source | JavaScript tag array |
| Search | Disabled |
| Remove icon | Material Symbols `close` |
| Pill style | Outlined (border + tinted background) |
| Animations | None |
| Library | Choices.js v10 |

---

## Dependencies

Load these in the `<head>` of your HTML file. All are served from CDN — no build step required.

```html
<!-- Choices.js base stylesheet (overridden below) -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"
/>

<!-- Material Symbols (icon font) -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0"
/>

<!-- Choices.js script (before closing </body>) -->
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
```

> **Why Material Symbols Rounded?** The rounded variant of `close` is softer and matches the pill's curved border better than the sharp default variant.

---

## File Structure

For a standalone implementation everything lives in a single HTML file:

```
project/
└── index.html      ← markup + styles + script all in one file
```

If you are integrating into an existing project, split it out:

```
project/
├── index.html
├── multiselect.css   ← all .choices overrides
└── multiselect.js    ← tag array + Choices init + event handlers
```

---

## HTML Skeleton

The `<select>` element is the only markup Choices.js needs. It wraps and replaces it at runtime.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tag Multiselect</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0" />

  <!-- Your CSS overrides go here (see CSS section) -->
  <style> ... </style>
</head>
<body>

  <label class="field-label" for="tag-select">Topics</label>
  <select id="tag-select" multiple></select>

  <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
  <!-- Your JS goes here (see JS section) -->
  <script> ... </script>

</body>
</html>
```

Note that the `<select>` starts **empty** — options are injected by JavaScript from the tag array.

---

## Generating Options from a Tag List

Define your options as a flat array of strings (or objects if you need separate labels and values). Pass them to Choices.js via the `choices` config key — this is the recommended approach over building `<option>` elements in HTML.

### Flat string array

```js
const TAGS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'CSS',
  'HTML',
  'SQL',
  'GraphQL',
  'Docker',
];
```

Convert to the shape Choices.js expects — an array of `{ value, label }` objects:

```js
const choiceItems = TAGS.map(tag => ({
  value: tag.toLowerCase().replace(/\s+/g, '-'),  // e.g. "javascript"
  label: tag,                                      // e.g. "JavaScript"
}));
```

Pass `choiceItems` when initialising (see next section).

### Object array (label differs from value)

If your tags come from an API or database they may already be objects:

```js
const TAGS = [
  { id: 'js',  name: 'JavaScript' },
  { id: 'ts',  name: 'TypeScript' },
  { id: 'py',  name: 'Python' },
];

const choiceItems = TAGS.map(tag => ({
  value: tag.id,
  label: tag.name,
}));
```

The `value` is what gets submitted with the form or read programmatically. The `label` is what the user sees.

### Pre-selecting values on load

To have certain tags already selected when the page loads, add `selected: true` to the relevant items:

```js
const SELECTED_BY_DEFAULT = ['js', 'css'];

const choiceItems = TAGS.map(tag => ({
  value: tag.id,
  label: tag.name,
  selected: SELECTED_BY_DEFAULT.includes(tag.id),
}));
```

---

## Initialising Choices.js

```js
const el = document.getElementById('tag-select');

const choices = new Choices(el, {
  // Inject options from the tag array
  choices: choiceItems,

  // Disable the search box
  searchEnabled: false,

  // Show a remove button on each pill
  removeItemButton: true,

  // Text shown when no items are selected
  placeholderValue: 'Select tags…',

  // Remove the "Press to select" hint text in the dropdown
  itemSelectText: '',

  // Keep the order you defined in TAGS, do not sort alphabetically
  shouldSort: false,

  // Allow selecting all options (no upper cap)
  maxItemCount: -1,
});
```

### Config reference for this implementation

| Option | Value | Reason |
|---|---|---|
| `searchEnabled` | `false` | Tag lists are short; searching adds unnecessary UI noise |
| `removeItemButton` | `true` | Required to render the × on each pill |
| `shouldSort` | `false` | Preserve the intentional order of your tag array |
| `itemSelectText` | `''` | Hides the default "Press to select" hint |
| `maxItemCount` | `-1` | Unlimited selections; set to a number to cap it |

---

## CSS — Full Override

Paste this **after** the Choices.js stylesheet link so it takes precedence. Every rule targets `.choices` class names that Choices.js generates at runtime.

```css
/* ─── Reset & container ─────────────────────────────── */
.choices {
  position: relative;
  font-family: inherit;
}

/* ─── Input area (the visible "box") ────────────────── */
.choices__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  background: #fafaf9;
  border: 0.5px solid #d8d6d0;
  border-radius: 10px;
  padding: 8px 10px;
  min-height: 48px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.choices__inner:focus-within {
  border-color: #7F77DD;
  box-shadow: 0 0 0 3px rgba(120, 90, 255, 0.09);
  background: #fff;
}

/* Flatten the bottom corners when the dropdown is open */
.choices.is-open .choices__inner {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: #ece9e3;
}

/* ─── Pills (selected items) ─────────────────────────── */
.choices__list--multiple {
  display: contents; /* lets pills flow inline with the input */
}

.choices__list--multiple .choices__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* Outlined pill: coloured border + very light fill */
  background: #EEEDFE;
  color: #3C3489;
  border: 1px solid #AFA9EC;         /* the outline */
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 6px 3px 12px;
  line-height: 1;
  margin: 0;
}

/* ─── Remove button (×) ──────────────────────────────── */
/*
 * Choices.js renders a <button> with text content "Remove item".
 * We hide that text with text-indent, then draw the icon using
 * the Material Symbols font via a ::before pseudo-element.
 */
.choices__button {
  /* Reset Choices defaults */
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  opacity: 1;
  /* Hide the default text */
  text-indent: -9999px;
  overflow: hidden;
  /* Size and shape */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.12s;
}

.choices__button::before {
  /* Draw the Material Symbols "close" icon */
  font-family: 'Material Symbols Rounded';
  content: 'close';              /* icon ligature name */
  font-size: 14px;
  text-indent: 0;                /* undo the hide-text trick for the pseudo */
  color: #7F77DD;
  line-height: 1;
  display: block;
}

.choices__button:hover {
  background: #7F77DD;
}

.choices__button:hover::before {
  color: #fff;
}

/* ─── Placeholder text ───────────────────────────────── */
.choices__placeholder {
  color: #bbb;
  font-size: 14px;
}

/* ─── Dropdown panel ─────────────────────────────────── */
.choices__list--dropdown {
  position: absolute;
  z-index: 99;
  width: 100%;
  background: #fff;
  border: 0.5px solid #d8d6d0;
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}

.choices__list--dropdown .choices__list {
  max-height: 220px;
  overflow-y: auto;
  padding: 6px;
  scrollbar-width: thin;
  scrollbar-color: #e0ddd7 transparent;
}

/* ─── Dropdown items ─────────────────────────────────── */
.choices__list--dropdown .choices__item {
  font-size: 14px;
  padding: 9px 12px;
  border-radius: 7px;
  cursor: pointer;
  color: #111;
  transition: background 0.1s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.choices__list--dropdown .choices__item::after {
  content: '';
}

.choices__list--dropdown .choices__item:hover,
.choices__list--dropdown .choices__item.is-highlighted {
  background: #f4f3ff;
  color: #111;
}

/* Selected items show a checkmark on the right */
.choices__list--dropdown .choices__item.is-selected {
  color: #534AB7;
  font-weight: 500;
}

.choices__list--dropdown .choices__item.is-selected::after {
  font-family: 'Material Symbols Rounded';
  content: 'check';
  font-size: 16px;
  color: #7F77DD;
}

/* Hide the blank placeholder option in the dropdown */
.choices__list--dropdown .choices__item[data-value=""] {
  display: none;
}
```

### How the outlined pill works

The pill style comes from two properties working together:

```css
background: #EEEDFE;   /* very light purple tint — not plain white */
border: 1px solid #AFA9EC;  /* medium-weight purple outline */
```

This gives the pill visible presence without looking like a solid filled badge. Increasing the border to `1.5px` makes it more prominent; decreasing the background opacity (`rgba(174, 169, 236, 0.15)`) makes it more subtle.

---

## Material Symbols Cross Icon

Choices.js renders its remove button as:

```html
<button type="button" class="choices__button">Remove item</button>
```

The text "Remove item" is visually hidden using `text-indent: -9999px`. The icon is then drawn with a CSS `::before` pseudo-element using the Material Symbols icon font ligature system:

```css
.choices__button {
  text-indent: -9999px;   /* hides "Remove item" text */
  overflow: hidden;
}

.choices__button::before {
  font-family: 'Material Symbols Rounded';
  content: 'close';       /* the ligature name for the × icon */
  text-indent: 0;         /* re-shows text in the pseudo only */
  font-size: 14px;
  color: #7F77DD;
}
```

### Why not use `content: '\e5cd'` (unicode)?

You can, but the named ligature (`content: 'close'`) is more readable and easier to change. Both work identically in browsers that have loaded the font.

### Changing the icon

Swap `content: 'close'` for any Material Symbols ligature name. Browse all icons at [fonts.google.com/icons](https://fonts.google.com/icons). Some alternatives:

| `content` value | Appearance |
|---|---|
| `'close'` | Standard × |
| `'cancel'` | Circled × |
| `'remove'` | Dash — |
| `'backspace'` | Backspace arrow |

---

## Reading Selected Values

### On change

```js
el.addEventListener('change', () => {
  const selected = choices.getValue(true); // returns string[]
  console.log(selected); // e.g. ["javascript", "css"]
});
```

`getValue(true)` returns an array of value strings. `getValue(false)` returns the full Choices item objects.

### On form submit

If your `<select>` is inside a `<form>`, the selected values are automatically included in `FormData` under the select's `name` attribute. Add a `name` to your element:

```html
<select id="tag-select" name="tags" multiple></select>
```

Then read them server-side or via JS:

```js
document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const tags = data.getAll('tags'); // string[]
  console.log(tags);
});
```

### As JSON for an API request

```js
const payload = {
  tags: choices.getValue(true),
};

fetch('/api/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

---

## Clear All Button

Add a button that removes all selected items at once:

```html
<button id="clear-btn" style="display: none;">Clear all</button>
```

```js
const clearBtn = document.getElementById('clear-btn');

el.addEventListener('change', () => {
  const n = choices.getValue(true).length;
  clearBtn.style.display = n > 0 ? 'block' : 'none';
});

clearBtn.addEventListener('click', () => {
  choices.removeActiveItems();
  clearBtn.style.display = 'none';
});
```

`removeActiveItems()` deselects everything and removes all pills. The button is hidden when nothing is selected.

---

## Complete Working Example

The following is a fully self-contained HTML file incorporating every section above.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tag Multiselect</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f4f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .card {
      background: #fff;
      border-radius: 16px;
      border: 0.5px solid #e2e0da;
      padding: 2rem 2.25rem 2.5rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 2px 12px rgba(0,0,0,.04);
    }

    .field-label {
      display: block;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 8px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      min-height: 20px;
    }

    .count-badge {
      font-size: 12px;
      color: #534AB7;
      font-weight: 500;
      background: #EEEDFE;
      border: 0.5px solid #C4C0F0;
      border-radius: 20px;
      padding: 2px 10px;
      visibility: hidden;
    }
    .count-badge.visible { visibility: visible; }

    .clear-btn {
      font-size: 12px;
      color: #aaa;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: none;
    }
    .clear-btn.visible { display: block; }
    .clear-btn:hover { color: #E24B4A; }

    /* ── Choices.js overrides ── */
    .choices { position: relative; font-family: inherit; }

    .choices__inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      background: #fafaf9;
      border: 0.5px solid #d8d6d0;
      border-radius: 10px;
      padding: 8px 10px;
      min-height: 48px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .choices__inner:focus-within {
      border-color: #7F77DD;
      box-shadow: 0 0 0 3px rgba(120, 90, 255, 0.09);
      background: #fff;
    }
    .choices.is-open .choices__inner {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom-color: #ece9e3;
    }

    .choices__list--multiple { display: contents; }
    .choices__list--multiple .choices__item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #EEEDFE;
      color: #3C3489;
      border: 1px solid #AFA9EC;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      padding: 3px 6px 3px 12px;
      line-height: 1;
      margin: 0;
    }

    .choices__button {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      opacity: 1;
      text-indent: -9999px;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
      cursor: pointer;
      transition: background 0.12s;
    }
    .choices__button::before {
      font-family: 'Material Symbols Rounded';
      content: 'close';
      font-size: 14px;
      text-indent: 0;
      color: #7F77DD;
      line-height: 1;
      display: block;
    }
    .choices__button:hover { background: #7F77DD; }
    .choices__button:hover::before { color: #fff; }

    .choices__placeholder { color: #bbb; font-size: 14px; }

    .choices__list--dropdown {
      position: absolute;
      z-index: 99;
      width: 100%;
      background: #fff;
      border: 0.5px solid #d8d6d0;
      border-top: none;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 28px rgba(0,0,0,.08);
    }
    .choices__list--dropdown .choices__list {
      max-height: 220px;
      overflow-y: auto;
      padding: 6px;
      scrollbar-width: thin;
      scrollbar-color: #e0ddd7 transparent;
    }
    .choices__list--dropdown .choices__item {
      font-size: 14px;
      padding: 9px 12px;
      border-radius: 7px;
      cursor: pointer;
      color: #111;
      transition: background 0.1s;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .choices__list--dropdown .choices__item::after { content: ''; }
    .choices__list--dropdown .choices__item:hover,
    .choices__list--dropdown .choices__item.is-highlighted {
      background: #f4f3ff;
      color: #111;
    }
    .choices__list--dropdown .choices__item.is-selected {
      color: #534AB7;
      font-weight: 500;
    }
    .choices__list--dropdown .choices__item.is-selected::after {
      font-family: 'Material Symbols Rounded';
      content: 'check';
      font-size: 16px;
      color: #7F77DD;
    }
    .choices__list--dropdown .choices__item[data-value=""] { display: none; }
  </style>
</head>
<body>

<div class="card">
  <label class="field-label" for="tag-select">Technologies</label>
  <select id="tag-select" name="tags" multiple></select>
  <div class="meta-row">
    <span class="count-badge" id="count-badge"></span>
    <button class="clear-btn" id="clear-btn">Clear all</button>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
<script>
  /* 1. Define your tags */
  const TAGS = [
    'JavaScript', 'TypeScript', 'Python', 'Rust',
    'Go', 'CSS', 'HTML', 'SQL', 'GraphQL', 'Docker',
  ];

  /* 2. Convert to Choices.js format */
  const choiceItems = TAGS.map(tag => ({
    value: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
  }));

  /* 3. Initialise */
  const el = document.getElementById('tag-select');
  const choices = new Choices(el, {
    choices: choiceItems,
    searchEnabled: false,
    removeItemButton: true,
    placeholderValue: 'Select technologies…',
    itemSelectText: '',
    shouldSort: false,
    maxItemCount: -1,
  });

  /* 4. UI updates */
  const badge    = document.getElementById('count-badge');
  const clearBtn = document.getElementById('clear-btn');

  function update() {
    const n = choices.getValue(true).length;
    badge.textContent = n === 1 ? '1 selected' : `${n} selected`;
    badge.classList.toggle('visible', n > 0);
    clearBtn.classList.toggle('visible', n > 0);
  }

  el.addEventListener('change', update);

  clearBtn.addEventListener('click', () => {
    choices.removeActiveItems();
    update();
  });
</script>

</body>
</html>
```

---

## Customisation Reference

### Changing the colour scheme

All colours are set in three places. Update them consistently:

| Location | Property | Controls |
|---|---|---|
| `.choices__list--multiple .choices__item` | `background`, `color`, `border-color` | Pill fill, text, outline |
| `.choices__button::before` | `color` | Icon colour at rest |
| `.choices__button:hover` | `background` | Icon button hover fill |
| `.choices__list--dropdown .choices__item.is-selected` | `color` | Checked item text |
| `.choices__list--dropdown .choices__item.is-selected::after` | `color` | Checkmark colour |

### Making the pill outline more prominent

```css
.choices__list--multiple .choices__item {
  border: 1.5px solid #7F77DD;   /* thicker, darker */
  background: transparent;        /* fully transparent fill */
}
```

### Capping the number of selections

```js
new Choices(el, {
  maxItemCount: 5,   // user cannot pick more than 5
  maxItemText: (maxItemCount) => `Only ${maxItemCount} tags allowed`,
});
```

### Disabling a tag

Set `disabled: true` on individual items so they appear greyed out and unselectable:

```js
const choiceItems = TAGS.map(tag => ({
  value: tag.toLowerCase(),
  label: tag,
  disabled: tag === 'GraphQL',  // greyed out in dropdown
}));
```

### Dynamically updating the tag list

You can replace the full option set at runtime without re-initialising:

```js
function setTags(newTags) {
  const newItems = newTags.map(tag => ({
    value: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
  }));
  choices.clearChoices();
  choices.setChoices(newItems, 'value', 'label', false);
}

// Example: swap to a different category
setTags(['Figma', 'Sketch', 'Framer', 'Illustrator']);
```