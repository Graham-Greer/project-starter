# UI Components

This document is the scoped reference for components in `src/components/ui`.

## Scope

- Layer: `ui`
- Purpose: reusable, product-ready interface components built from primitives
- Source path: `src/components/ui`

## Conventions

- Component-first folder structure:
  - `src/components/ui/<ComponentName>/<ComponentName>.jsx`
  - `src/components/ui/<ComponentName>/<component-name>.module.css`
  - `src/components/ui/<ComponentName>/index.js`
- Export via layer barrel:
  - `src/components/ui/index.js`
- All styles must consume design-system tokens from `globals.css`.

## Current Components

## `Button`

Source:
- `src/components/ui/Button/Button.jsx`
- `src/components/ui/Button/button.module.css`

### Props

- `children`: button label/content
- `className`: additional class names
- `variant`: `primary | secondary | tertiary`
  - aliases also supported: `solid -> primary`, `outline -> secondary`, `ghost -> tertiary`
- `size`: `sm | md | lg`
- `tone`: `neutral | brand | danger`
- `href`: if provided (and not disabled/loading), renders Next `Link`
- `target`, `rel`: passed when rendering link
- `type`: button type (`button` default)
- `disabled`: disables interaction
- `loading`: sets disabled behavior and `aria-busy`
- `fullWidth`: stretches to full container width
- `iconLeft`: icon before text (icon name string or node)
- `iconRight`: icon after text (icon name string or node)

### Behavior

- Link mode:
  - Renders `Link` when `href` is provided and not disabled/loading.
- Button mode:
  - Renders native `<button>` otherwise.
- External link safety:
  - Adds `rel="noopener noreferrer"` automatically when `target="_blank"` and `rel` is not provided.

### Usage

```jsx
import { Button } from "@/components/ui";

<Button variant="primary" tone="neutral">Get Started</Button>

<Button variant="secondary" tone="brand" iconRight="arrowRight">
  Learn More
</Button>

<Button href="/contact" variant="tertiary" tone="neutral">
  Contact
</Button>
```

## `Card`

Source:
- `src/components/ui/Card/Card.jsx`
- `src/components/ui/Card/card.module.css`

### Props

- `as`: root element (`article` default)
- `variant`: `flat | outlined | elevated`
- `padding`: `sm | md | lg`
- `interactive`: enables hover/interaction affordance
- `href`: optional link wrapper for clickable cards
- `title`, `description`: convenience content props
- `media`: optional media slot (top of card)
- `actions`: optional actions slot (bottom of card)
- `children`: additional custom content

### Usage

```jsx
import { Card, Button } from "@/components/ui";

<Card
  variant="outlined"
  title="Starter Plan"
  description="Great for small projects."
  actions={<Button variant="secondary">Select</Button>}
/>
```

## `Image`

Source:
- `src/components/ui/Image/Image.jsx`
- `src/components/ui/Image/image.module.css`

### Props

- Wraps Next Image with token-friendly defaults.
- `src`, `alt`, `width`, `height`, `fill`, `sizes`, `priority`, `quality`
- `aspectRatio`: CSS aspect-ratio value (e.g. `"16 / 9"`)
- `objectFit`: image fit strategy (`cover` default)
- `radius`: `none | sm | md | lg | xl | full`
- `wrapperClassName`, `className`

### Usage

```jsx
import { Image } from "@/components/ui";

<Image
  src="/hero.jpg"
  alt="Project hero"
  width={1200}
  height={800}
  aspectRatio="16 / 9"
  radius="lg"
/>
```

## `Badge`

Source:
- `src/components/ui/Badge/Badge.jsx`
- `src/components/ui/Badge/badge.module.css`

### Props

- `variant`: `subtle | solid | outline`
- `tone`: `neutral | brand | danger`
- `size`: `sm | md`
- `as`: root element (`span` default)

### Usage

```jsx
import { Badge } from "@/components/ui";

<Badge variant="subtle" tone="brand">Featured</Badge>
```

## `Accordion`

Source:
- `src/components/ui/Accordion/Accordion.jsx`
- `src/components/ui/Accordion/accordion.module.css`

### Props

- `items`: array of `{ id, title, content, disabled }`
- `type`: `single | multiple`
- `value`, `defaultValue`, `onValueChange`
- `collapsible`: for `single` mode, whether open item can be collapsed

### Usage

```jsx
import { Accordion } from "@/components/ui";

<Accordion
  type="single"
  items={[
    { id: "a", title: "What is included?", content: "Starter setup and components." },
    { id: "b", title: "Can I customize?", content: "Yes, everything is token-driven." },
  ]}
/>
```

## `Tabs`

Source:
- `src/components/ui/Tabs/Tabs.jsx`
- `src/components/ui/Tabs/tabs.module.css`

### Props

- `items`: array of `{ id, label, content, disabled }`
- `value`, `defaultValue`, `onValueChange`
- `orientation`: `horizontal | vertical`

### Behavior

- Keyboard support:
  - Arrow keys move between tabs (based on orientation)
  - `Home` / `End` jump to first/last enabled tab

### Usage

```jsx
import { Tabs } from "@/components/ui";

<Tabs
  items={[
    { id: "overview", label: "Overview", content: <p>Overview content</p> },
    { id: "details", label: "Details", content: <p>Detail content</p> },
  ]}
/>
```

## `LogoMarquee`

Source:
- `src/components/ui/LogoMarquee/LogoMarquee.jsx`
- `src/components/ui/LogoMarquee/logo-marquee.module.css`

### Props

- `items`: array of logo items:
  - `{ id, name, src, alt, width, height, href, target }`
- `speed`: `slow | normal | fast`
- `direction`: `left | right`
- `pauseOnHover`: boolean
- `ariaLabel`: region label for accessibility

### Reduced Motion

- Automatically disables marquee animation under `prefers-reduced-motion: reduce`.
- Falls back to horizontal scroll.

### Usage

```jsx
import { LogoMarquee } from "@/components/ui";

<LogoMarquee
  items={[
    { id: "a", name: "Brand A", src: "/logos/a.svg", width: 120, height: 32 },
    { id: "b", name: "Brand B", src: "/logos/b.svg", width: 110, height: 32 },
  ]}
  speed="normal"
  pauseOnHover
/>
```

## Adding a New UI Component

1. Create folder and files using component-first convention.
2. Build on primitives where possible.
3. Keep API consistent with design-system standards (`variant`, `size`, `tone` where relevant).
4. Export component in `src/components/ui/index.js`.
5. Add its contract and usage example to this file.
