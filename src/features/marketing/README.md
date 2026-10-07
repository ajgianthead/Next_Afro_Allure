# Marketing pages

One page per specialty (`/for/<slug>`) and per feature (`/features/<slug>`), plus
the switch pages (`/switch/<platform>`). All share the menu in `menu.ts`.

| File | What it holds |
| --- | --- |
| `menu.ts` | The menu: Features, Who it's for, Switch, Pricing |
| `specialties.tsx` | Copy for the four specialty pages |
| `features.tsx` | Copy for the four feature pages |
| `media.ts` | Real stylists' photos and reels, and which pages they appear on |
| `components/MarketingPage.tsx` | The page layout |

To add a page: add an entry to `SPECIALTIES` or `FEATURES`, add its slug to
`MarketingPageSlug` in `media.ts`, and add a link in `menu.ts`. Only write
what AfroAllure does today.

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
