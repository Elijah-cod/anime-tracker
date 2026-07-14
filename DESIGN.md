# Anime Tracker Design System

## Direction

A light-first media utility inspired by the supplied Stitch screens: a quiet cool-gray canvas, persistent navigation, compact white work surfaces, poster-led content, and a restrained blue-violet accent. Dark mode remains available as a functional appearance option, not the default visual identity.

## Color

- Canvas: `oklch(0.975 0.008 255)`
- Surface: `oklch(0.995 0.003 255)`
- Surface muted: `oklch(0.955 0.012 265)`
- Ink: `oklch(0.22 0.025 265)`
- Muted ink: `oklch(0.52 0.025 265)`
- Border: `oklch(0.89 0.015 265)`
- Accent: `oklch(0.61 0.17 272)`
- Accent soft: `oklch(0.92 0.045 272)`
- Success: `oklch(0.68 0.14 155)`
- Warning: `oklch(0.74 0.15 78)`
- Danger: `oklch(0.62 0.2 25)`

Use the accent for active navigation, primary actions, progress, links, and focus states. Anime artwork supplies the broader palette.

## Typography

Use the native product stack: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Helvetica Neue`, sans-serif. Headings use 650 to 700 weight, labels use 550 to 650, and body copy uses 400 to 500. Keep desktop page titles between 28 and 36 pixels and mobile titles between 28 and 32 pixels.

## Layout

- Desktop sidebar: 244 pixels, fixed, full height.
- Desktop content: fluid with a 1180 pixel reading maximum and 40 to 56 pixel page gutters.
- Mobile top bar: 64 pixels.
- Mobile bottom navigation: 72 pixels plus safe-area inset.
- Content rhythm: 32 pixels between major sections, 16 to 20 pixels within controls and lists.
- Desktop poster grids: 4 to 6 columns depending on available width.
- Mobile poster grids: horizontal rails for active watching, 2 columns for discovery grids.

## Surfaces

Use open page sections by default. Reserve bordered white surfaces for interactive groups, editable rows, and community posts. Standard radius is 14 pixels; compact controls use 10 to 12 pixels. Shadows are subtle and limited to raised media cards or floating navigation.

## Components

- Navigation: icon plus label, soft accent fill for the active destination.
- Buttons: 44 pixel minimum height, 10 to 12 pixel radius, solid accent primary and quiet bordered secondary.
- Inputs: 44 to 48 pixel height, muted surface, clear focus ring.
- Progress: 5 to 7 pixel track with a solid accent fill.
- Status: compact text pill with semantic tint and a visible label.
- Posters: 2:3 artwork ratio for grids; 16:9 artwork for active-watching cards.
- Tables and lists: desktop table where comparison matters, stacked rows on mobile.

## Motion

Use 150 to 220 millisecond ease-out transitions for hover, focus, selected state, and optimistic updates. Disable nonessential transitions under `prefers-reduced-motion`. Do not animate page entry or layout geometry.

## Responsive Behavior

The sidebar becomes a compact top brand bar and fixed bottom navigation below 1024 pixels. Dense tables become touch-friendly stacked rows. Horizontal poster rails retain native scrolling and never force the page wider than the viewport.
