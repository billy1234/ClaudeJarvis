# Jarvis — Agent Styling Guide

Reference this document before writing any UI code for this project.

---

## Design Language

**"Antares Obsidian"** — a dark, TV-optimised dashboard aesthetic. Think premium, minimal, editorial. No clutter.

---

## Colors

All colors are defined as CSS custom properties in `frontend/src/index.css` and available as Tailwind utilities.

| Token | Value | Usage |
|---|---|---|
| `background` | `#050507` | Page canvas |
| `surface` | `#0a0a0c` | Base surfaces |
| `surface-container-low` | `#0d0d12` | Item backgrounds |
| `surface-container` | `#15151a` | Cards |
| `surface-container-high` | `#1c1c24` | Elevated elements |
| `surface-container-highest` | `#2a2a35` | Highest elevation |
| `primary` | `#FF6200` | **Neon orange — brand accent** |
| `primary-container` | `#3d1500` | Tinted orange backgrounds |
| `on-primary-container` | `#ffd0b0` | Text on orange backgrounds |
| `tertiary` | `#00f0ff` | Cyan — used for "imminent" highlights |
| `on-surface` | `#f1f1f3` | Primary text |
| `on-surface-variant` | `#c4c6d0` | Secondary text |
| `outline` | `#737783` | Muted/placeholder text |
| `error` | `#ff4d4d` | Error states |

### Special effects

```css
/* Glass panel — use for all card sections */
.glass-panel {
  background-color: rgba(10, 10, 12, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 98, 0, 0.12);
}

/* Signature gradient — brand CTAs, reminders card, logo */
.signature-gradient {
  background: linear-gradient(135deg, #FF6200 0%, #CC3D00 100%);
}
```

### Orange tint helpers (use inline style)
```
rgba(255, 98, 0, 0.1)   — subtle tint backgrounds
rgba(255, 98, 0, 0.2)   — border accents
rgba(255, 98, 0, 0.4)   — checkbox / inactive borders
rgba(255, 98, 0, 0.5)   — glow shadows
rgba(255, 98, 0, 0.6)   — strong glow (FAB shadow)
```

---

## Typography

| Font | Family | Usage |
|---|---|---|
| Headline | `Manrope` | Titles, section headers, logo — `font-headline` |
| Body | `Inter` | All data content, labels — default body |

### Scale
- Page title: `text-xl font-semibold uppercase tracking-wide text-outline`
- Card title: `font-headline font-bold text-2xl text-white`
- Item primary: `text-sm font-semibold text-white`
- Item secondary/meta: `text-[10px] uppercase tracking-widest text-outline`
- Priority label: `text-[10px] font-black uppercase tracking-[0.2em]`

**Never use font-weight 700+ on body text.** Keep body at `font-medium` (500) for the sophisticated look.

---

## Layout

The dashboard is locked to `h-screen overflow-hidden` — **no page scroll**.

```
h-screen flex flex-col
  └── <Header />          — sticky, glassmorphism
  └── <main flex-1 flex flex-col>
        └── heading row   — small, muted
        └── grid flex-1 min-h-0   — 3-column, fills remaining height
              ├── ShoppingListCard  col-span-4
              ├── TodosCard         col-span-4
              └── RemindersCard     col-span-4
```

Cards use `h-full flex flex-col` so they stretch to fill the grid row.

---

## Card Anatomy

Every panel follows this structure:

```tsx
<section className="glass-panel rounded-[2rem] p-8 h-full flex flex-col">
  {/* Header — shrink-0 */}
  <div className="flex justify-between items-center mb-6 shrink-0">
    <div className="flex items-center gap-4">
      {/* Icon container */}
      <div style={{ backgroundColor: 'rgba(255,98,0,0.1)', borderColor: 'rgba(255,98,0,0.2)', color: '#FF6200' }}
           className="w-12 h-12 rounded-2xl flex items-center justify-center border">
        <FontAwesomeIcon icon={...} />
      </div>
      <h3 className="font-headline font-bold text-2xl text-white">Title</h3>
    </div>
    {/* Add button */}
    <button style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FF6200' }}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5">
      <FontAwesomeIcon icon={faPlus} />
    </button>
  </div>

  {/* Content — flex-1 min-h-0 */}
  <div className="flex-1 min-h-0">
    ...
  </div>
</section>
```

---

## Item Styling

### Standard list item
```tsx
<div
  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all"
  style={{ backgroundColor: 'rgba(13,13,18,0.8)' }}
>
```

### Priority item (todos) — left border accent
```tsx
<div
  className="p-5 rounded-2xl border-y border-r border-white/5"
  style={{ borderLeft: `4px solid ${color}` }}
>
```

Priority colors:
- `high` → `#ff4d4d`
- `medium` → `#FF6200`
- `low` → `rgba(255,255,255,0.15)`

### Reminder item — left line accent
```tsx
<div className="relative pl-8">
  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
       style={{ backgroundColor: isFirst ? '#00f0ff' : 'rgba(255,255,255,0.25)' }} />
  ...
</div>
```

---

## Icons

Uses **Font Awesome** (`@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons`).

Always pass `IconDefinition` objects — never icon name strings.

```tsx
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

<FontAwesomeIcon icon={faBasketShopping} className="text-xl" />
```

---

## Rules

- **No 1px dividers** — use spacing and background shifts to create structure
- **No scrollbars** — truncate with "and X more" or use `ResizeObserver` to fit content dynamically
- **No pure black** — use `on-surface` (`#f1f1f3`) for text
- **Glow shadows** for primary actions: `boxShadow: '0 8px 32px -8px rgba(255,98,0,0.5)'`
- **Ambient blobs** on gradient panels: `w-64 h-64 bg-white/10 blur-[100px]` absolutely positioned
- **Border radius**: cards use `rounded-[2rem]`, items use `rounded-xl` or `rounded-2xl`
- **Padding**: cards `p-8`, items `p-3`–`p-5`
