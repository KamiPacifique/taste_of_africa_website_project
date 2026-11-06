# Tastes of Africa

A responsive food and culture magazine website celebrating recipes, regions and stories from across the African continent. Built from the Tastes of Africa Figma design with plain HTML, CSS and JavaScript — no frameworks or build step.

## Pages

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | Hero, recipe edit, region links, food stories, newsletter sign-up |
| Recipes | `recipes.html` | Live search, region chips, dietary and cooking-time filters, sorting, saved-only view |
| Regions | `regions.html` | West, East, North and Southern Africa with pantry staples and signature dishes |
| About us | `about.html` | Mission and guiding principles |
| Contact | `contact.html` | Accessible form validation and a confirmation state |
| Recipes (×5) | `pondu.html`, `nyama-choma.html`, `brochettes.html`, `bobotie.html`, `matoke.html` | Servings scaling, ingredient checklist, collapsible steps, embedded YouTube video, print view |
| Privacy / Accessibility | `privacy.html`, `accessibility.html` | Supporting pages linked from the footer |

## Interactive features

- **Save recipes** — bookmark any recipe; the header shows a live count, a toast confirms with *Undo*, and saves persist via `localStorage`. `recipes.html?saved` lists saved recipes.
- **Filter & search** — combine region, dietary preference, cooking time and free-text search (matches names and ingredients). Results are announced to screen readers and reflected in the URL.
- **Scale servings** — quantities update from 1 to 16 servings with readable fractions (½, ¼, ⅓…) and singular/plural agreement. Cooking times are intentionally not scaled.
- **Step by step** — expand/collapse each method step or all at once; ticking *Step complete* closes it and opens the next.
- **Recipe videos** — each recipe page embeds a YouTube cooking video for that dish (privacy-enhanced `youtube-nocookie.com` embed, lazy-loaded, with a descriptive title and a link to watch on YouTube):
  - Pondu — *Cook with Nahima*
  - Nyama Choma — *Judith Otieno*
  - Brochettes — *African Chef TV*
  - Bobotie — *Articook*
  - Matoke — *Winnie's Home Kitchen*
- **Light & dark theme** — follows the device setting by default and remembers your choice.
- **Form validation** — errors are written beside each field (not shown by colour alone), summarised at the top, and the form is replaced by a personalised confirmation on success.
- **Responsive** — designed for mobile (390px), tablet (834px) and desktop (1440px).

## Accessibility

Semantic landmarks and headings, skip link, visible keyboard focus, 44px touch targets, ARIA states (`aria-pressed`, `aria-expanded`, `aria-invalid`), live regions for result counts and saved states, `prefers-reduced-motion` support, and a print stylesheet for recipes.

## Project structure

```
├── index.html, recipes.html, regions.html, about.html, contact.html
├── pondu.html, nyama-choma.html, brochettes.html, bobotie.html, matoke.html
├── privacy.html, accessibility.html
├── css/style.css        # design tokens, components, layouts, dark theme, print
├── js/main.js           # theme, menu, search drawer, saved recipes, newsletter
├── js/recipes.js        # recipe search, filters and sorting
├── js/recipe.js         # servings scaling, step accordion, print
├── js/contact.js        # contact form validation and confirmation
└── images/              # food photography from the Figma design
```

## Running locally

Open `index.html` in a browser, or serve the folder so URLs behave like a live site:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Fonts (Playfair Display and DM Sans) load from Google Fonts.
