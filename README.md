# Frise Chrono

A client-side timeline generator built with React. Create interactive chronological timelines with events, descriptions, and images, then export them as PNG or JPG.

## Features

- **Flexible dates** — supports year, month, or day precision, including negative years (BC / av. J.-C.)
- **Point and range events** — single-date markers or date-span bars
- **Descriptions** — multi-line descriptions rendered below events on the timeline
- **Image support** — attach images to events, displayed with aspect-ratio preservation
- **5 color palettes** — Terracotta, Ocean, Forest, Lavande, Ardoise
- **Auto-configuration** — automatically computes end date or duration from partial input
- **PNG / JPG export** — high-resolution (2x) image export of the timeline
- **Fully client-side** — no backend, no accounts, no data leaves your browser

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech stack

- [React 19](https://react.dev/) — UI framework
- [Vite](https://vite.dev/) — build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [Lucide React](https://lucide.dev/) — icons
- HTML5 Canvas — timeline rendering

## Usage

1. **Configure the timeline** — set start date, end date (or duration), and tick periodicity in the left panel
2. **Add events** — click "Ajouter" to create events with a title, dates, optional description, and optional image
3. **Customize** — switch between color palettes using the circles in the header
4. **Export** — download the timeline as PNG or JPG using the header buttons

## License

MIT
