# Marketing pages

One page per specialty (`/for/<slug>`) and per feature (`/features/<slug>`), plus
the switch pages (`/switch/<platform>`). All share the menu in `menu.ts`.

| File | What it holds |
| --- | --- |
| `menu.ts` | The menu: Features, Who it's for, Switch, Pricing |
| `specialties.tsx` | Copy for the hair pages (braiders, locticians, natural hair, wigs) |
| `beauty.tsx` | Copy for the beauty pages (nails, lashes, brows, makeup) |
| `features.tsx` | Copy for the four feature pages |
| `media.ts` | Real photos, reels and recordings, and where they appear |
| `widgets/Widgets.tsx` | The animated product demos |
| `components/MarketingPage.tsx` | The building blocks pages are put together from |

To add a page: add an entry to one of the copy files, add its slug to
`MarketingPageSlug` in `media.ts`, and add a link in `menu.ts`. Only write
what AfroAllure does today.

## Every page looks different on purpose

Each page picks its own `theme` (accent color and hero layout: `split-dark`,
`split-light`, `centered-dark`, `split-accent`) and its own `sections`, in its
own order, each with a style: pains as `cards`, `numbered` or `quotes`;
benefits as `grid`, `bento` or `checklist`; steps as `timeline` or `cards`;
feature `rows` that alternate sides; a `menu` with or without the live price
picker; a `facts` band; a big `demo` frame. A test fails if two pages end up
with the same layout.

## Demos, videos and screen recordings

Every visual on a page (the hero, each feature row, the phone beside the menu,
a demo frame) is an animated widget drawn in code: DMs turning into a booking,
texts landing on a phone, a deposit checkout, a booking site, a calendar
filling from the waitlist, a payout, a rebook email, a size × length picker.
To swap one for a real video or screen recording, add it to `SLOT_MEDIA` in
`media.ts` under `'<page>:<slot>'` (slots: `hero`, `demo`, `menu`, `row-1`,
`row-2`, `row-3`). Set `phone: true` to show it in a phone frame. Remove the
entry and the widget comes back.

Frames: `frame: 'laptop'` for dashboard and booking-site recordings (16:10),
`frame: 'phone'` for phone recordings and vertical reels (9:16). Until a
recording exists, laptops show a drawn demo of the real dashboard
(`widgets/Dashboard.tsx`: appointments, services editor, no-show flow).

### Recording a demo

- **Size**: record the browser at 1440 × 900 (16:10) for laptop slots; record
  the phone in portrait for phone slots.
- **Data**: use a demo business with made-up clients. Never show a real
  client's name, email or phone number.
- **Clean screen**: hide bookmarks and extensions, close other tabs, browser
  zoom at 100%, notifications off.
- **Length**: 8–20 seconds, one idea per clip, no sound (it plays muted and
  loops). Start and end on the same screen so the loop is seamless.
- **Export**: MP4 (H.264), 30 fps, under about 8 MB. Save a still from the
  first frame as the poster JPG. Put both in `public/demos/`.

## Adding a stylist's photo or reel

No stock photos and no AI-generated faces. Every face on these pages is a real
stylist who said yes, credited by name. Until a page has media, it shows a
"Your work could be here" card asking stylists to send their work.

### 1. Get permission in writing

DM or email the stylist and keep their reply. A message like:

> Hi [name]! We'd love to feature your [style] on AfroAllure's website
> (afroallure.co/for/braiders) to show what stylists in our community create.
> We'd credit you by name with a link to your Instagram. Is it OK for us to use
> [this photo / this reel] there? You can ask us to take it down any time.

If a client's face is in the photo or reel, the stylist should confirm the
client agreed to it being shared publicly.

### 2. Add the file (or the reel link)

- **Photo**: save it as `public/stylists/<name>-<style>.jpg` (about 1200px tall,
  under 500 KB) and use `kind: 'image'`, `src: '/stylists/<file>.jpg'`.
- **Reel you downloaded**: save the MP4 to `public/stylists/` (under about 8 MB)
  with a still image for `poster`, and use `kind: 'video'`.
- **Reel left on Instagram**: no download needed. Use `kind: 'instagram'` with
  the code from its link: `instagram.com/reel/`**`C9xYz123AbC`**`/`. The reel must
  be public. This works well for your Stylist Spotlight reels.

### 3. List it in `media.ts`

```ts
{
    kind: 'instagram',
    code: 'C9xYz123AbC',
    alt: 'Stylist spotlight: boho knotless braids, waist length',
    credit: { name: 'Kayla Johnson', instagram: 'braidsbykayla', city: 'Atlanta' },
    permissionGiven: '2026-10-07',
    pages: ['braiders', 'style-menus'],
},
```

`pages` takes any page slugs, or `'all'`. To take something down, delete its
entry (and its file in `public/stylists/`).
