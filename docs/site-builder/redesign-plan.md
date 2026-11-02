# Website builder makeover — plan

Status: **approved Nov 2, 2026.** Layout catalog approved as drawn (https://claude.ai/artifact/YZYPWqcrXZF3nBqoAv6ELH).

## Decisions (Nov 2)

- **One builder for everyone.** The new section builder replaces both the Simple Builder (template sites) and the Custom Builder (free-form Puck pages). It lives where the Simple Builder is today (Dashboard → Website, `/dashboard/booking-site`).
- **Plans only change what's available.** Starter: layouts 1–8 of every section and the basic animations. Growth: all 20 layouts and every animation. Everything else (sections, properties, theme, publishing) is the same for both. A Starter business that picks a Pro layout sees it locked with an upgrade prompt. If a Growth business downgrades, layouts it already published keep showing, but it can't pick new Pro ones.
- **Templates stay** as one-click starter pages in the new builder (Maison Tresse, Fade House, Atelier Clair, Rouge Maison, Coil Crown, Quickstart), each a set of sections + layouts + theme that reproduces today's look.
- **Welcome onboarding** keeps its quick website step (template, colors, logo, photos) but creates a new-builder page.
- **Every page is responsive**: each layout is designed for phone, tablet and desktop, checked in the editor's device toggle and by visual tests at all three widths.
- **Existing sites:**
  - Template sites switch to the new renderer automatically through their template's starter page, filled with their saved logo, photos, text, colors and fonts. Checked by before/after screenshots of each template so nothing visibly breaks.
  - Free-form Custom Builder pages keep showing as they are until the owner opens the new builder, which starts them from the closest starter page prefilled with their content; they publish when ready. The old editors are removed.
- Open questions from §10 settled with the defaults: reviews come from the existing `reviews` table plus testimonials the business types in; Contact includes message-form layouts (bot check + rate limit); maps use the free OpenStreetMap embed.

## 1. What changes and why

Today the Custom Builder (Puck 0.21.3, `src/app/business/[businessName]/edit/`) is a free-form page builder: Containers, Rows, Columns, Grids, 12 text presets, Images, Videos, Buttons, plus 6 pre-built blocks. It's powerful but slow to use and easy to make a page that looks broken on phones.

The new builder is **only sections**. A business adds sections (Hero, Services, Gallery…), picks one of **20 layouts** for each, edits its **properties**, and picks **animations**. Every layout is designed and tested on desktop, tablet and phone, so whatever they choose looks professional.

We keep **Puck** (upgraded to **0.24.0**, released Oct 29): it already gives us the canvas, drag-to-reorder, selection, undo/redo, saving and the public renderer. We replace what's inside it.

## 2. Sections (13)

| # | Section | What it shows | Live data it can use |
|---|---|---|---|
| 1 | **Navbar** | Logo/name, links to sections, Book button | Business name, logo, sections on the page (auto links) |
| 2 | **Hero** | First screen: headline, photo/video, Book button | Next openings, rating, years in business |
| 3 | **About** | The stylist/business story | Bio, portrait/about photo |
| 4 | **Services** ("Popular services") | Services with prices, times, Book buttons | Services (name, price, "from" price for size/length options, duration, photo); auto "most booked" or hand-picked |
| 5 | **Gallery** | Photos/videos of work | Site media library |
| 6 | **Reviews** | Testimonials and rating | Testimonials the business enters (name, text, stars, service, photo). Later: verified reviews from completed appointments |
| 7 | **Offers** | Loyalty and referral programs, custom promos | Loyalty program (e.g. "every 5th visit $10 off"), referral program (e.g. "you both get $10"), custom promo with optional end date |
| 8 | **Book now (CTA)** | A call-to-action band; can include the waitlist | Next openings, waitlist on/off |
| 9 | **Hours & location** ("Location and availability") | Address/map, weekly hours, open-now, next openings | Business hours (availability schedule), address (or "I travel to you"), next openings |
| 10 | **Contact** | Phone, email, socials, optional message form | Phone, email, Instagram/TikTok |
| 11 | **FAQ** | Questions and answers | Business-entered; suggested starter questions |
| 12 | **Policies & prep** | Deposit, cancellation, late/no-show fees, "before your appointment" | Booking settings (deposit, cancel/reschedule limits, late fee, no-show fee, read-before-booking, prep instructions) |
| 13 | **Footer** | Name, links, socials, legal, "Powered by AfroAllure" | Same as navbar + hours/contact |

Also: a **Spacer/Divider** utility (heights + shapes: line, wave, curve, slant, zig-zag), no layout tab.

Sections with live data stay in sync: when a price or hours change, the site updates. Every live value can be overridden or hidden.

## 3. The editor screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ AfroAllure | Kay's Braids   [Desktop|Tablet|Phone]  ↶ ↷   Theme  Preview  Publish │
├───────────────┬──────────────────────────────────────────┬───────────────────┤
│ PAGE          │                                          │ HERO              │
│ ▸ Navbar      │                                          │ [Properties][Layout][Animation] │
│ ▸ Hero    ●   │          live page (Puck canvas)         │                   │
│ ▸ Services    │      click a section to edit it,         │  (tab content)    │
│ ▸ Gallery     │      drag to reorder                     │                   │
│ ▸ Reviews     │                                          │                   │
│ ▸ Footer      │                                          │                   │
│ [+ Add section]│                                         │                   │
└───────────────┴──────────────────────────────────────────┴───────────────────┘
```

- **Left — Page outline:** the sections in order. Drag to reorder, eye icon to hide, ⋯ menu to duplicate/delete. **+ Add section** opens the section picker.
- **Section picker:** large cards (about 2× today's component cards — roughly 160×130 px, 2 per row) with a picture of the section, its name and a one-line description. Same card style as today (white, `#E8E2D6` border, coral `#FC6161` hover/selected), just bigger and with a thumbnail.
- **Center — Canvas:** the real page. Device toggle (desktop/tablet/phone). Hovering a section shows its name and quick actions (move up/down, duplicate, delete).
- **Right — the three tabs** for the selected section (§4–§6). With nothing selected, the right panel shows **Theme** (site-wide fonts, colors, button style, corner style), which every section inherits.
- **Top bar:** undo/redo, Theme, Preview (opens the real page), Publish, save status (autosave).
- **Starter presets:** the 6 existing templates (Maison Tresse, Fade House, Atelier Clair, Rouge Maison, Coil Crown, Quickstart) become one-click starting pages: a set of sections + layouts + theme.

## 4. Tab 1 — Properties

Grouped, collapsible. Only the groups and text roles that apply to the section's type appear.

1. **Content** — the section's text and media, one field per text role (e.g. Hero: eyebrow, headline, subheading, button label, second button label; Services: title, intro, which services, how many, show price/duration/description/photo). Images/video from the media library. Links: to a section on the page, the booking page (optionally a specific service), or an external link (made safe — see `safeHref`).
2. **Text styles** — per text role (eyebrow, heading, subheading, body, button, item title, price…):
   font (site heading font, site body font, or any from the font list), size (S/M/L/XL presets + exact px, with a separate phone size), weight, italic, letter case (as typed / UPPERCASE / Title), letter spacing, line height, alignment.
3. **Colors** — background, text, accent, button background, button text, card background, border. **Use site theme** (default on) and **Invert colors** (one switch: swaps background ↔ text, keeps the accent). Contrast warning when text is hard to read.
4. **Background** — solid, gradient (2 colors + angle), image, or video; overlay color + opacity; blur; pattern (subtle dots/grain/lines).
5. **Buttons** — style (solid, outline, text link, pill), size, corner radius, icon (arrow/calendar/none).
6. **Spacing & shape** — top/bottom padding (none/S/M/L/XL), content width (narrow/normal/wide/full bleed), corner radius for cards and photos, card shadow, border, divider shape above/below (none, wave, curve, slant, zig-zag).
7. **Visibility & link** — hide on phone / hide on desktop; section anchor name (what the navbar links to).

## 5. Tab 2 — Layout

A 2-column grid of **20 large layout cards** (same card style as §3: about 160×120 px, thumbnail on top, name below, a small "Basic"/"Pro" tag). The thumbnail is a mini wireframe of that layout drawn in the section's current colors. Clicking a card switches the layout instantly; content and styles carry over. Layouts are numbered so we can talk about them ("Hero 7").

Layouts 1–8 are the basics; 9–20 are the more advanced, designer-style ones.

### Navbar
1. **Classic** — logo left, links right, Book button
2. **Centered logo** — links split on both sides of the logo
3. **Logo over links** — centered logo, links in a row below
4. **Minimal** — name + Book button only
5. **Always-menu** — logo + menu icon that opens a full-screen menu
6. **Left links** — links left, logo center, Book right
7. **Right logo** — links left, logo on the right
8. **Underline tabs** — links with an animated underline on the active section
9. **Transparent overlay** — sits over the hero, turns solid when scrolling
10. **Floating pill** — rounded bar floating off the top edge
11. **Glass** — translucent blurred bar, sticky
12. **Info bar + nav** — thin top strip (phone, address, today's hours) above the nav
13. **Announcement + nav** — promo strip (e.g. referral offer) above the nav
14. **Wordmark** — big editorial name, small links underneath
15. **Boxed cells** — full-width grid of bordered cells (logo | links | Book)
16. **Social center** — logo left, social icons center, Book right
17. **Status badge** — name + "Open today 9–5" / "Next opening Thu 10 AM" badge + Book
18. **Split pill links** — links grouped in a centered pill, logo and Book at the ends
19. **Side rail** — vertical nav fixed on the left (desktop), top bar on phones
20. **Bottom booking bar** — slim top bar + sticky "Book now" bar at the bottom of the screen (phone-first)

### Hero
1. **Centered** — headline, subheading, Book button on a color background
2. **Split** — text left, photo right
3. **Split reversed** — photo left, text right
4. **Full photo, centered text** — photo with overlay, text in the middle
5. **Full photo, corner text** — text bottom-left like a magazine cover
6. **Stacked** — photo on top, text below
7. **Minimal line** — one large line of text + Book button, lots of space
8. **Portrait intro** — round portrait + "Hi, I'm Kay" + short intro
9. **Video background** — muted looping video behind the text
10. **Slideshow** — crossfading photos behind the text
11. **Collage** — 3 overlapping photos beside the text
12. **Oversized type** — huge name filling the width, small photo tucked in
13. **Floating card** — full photo, text in a card floating over it
14. **Arch photo** — photo in an arch/oval frame (popular in beauty)
15. **Offset frame** — photo offset from a colored block behind it
16. **Diagonal split** — photo and color divided on a slant
17. **Stats row** — headline + row of stats (years, clients, ★ rating)
18. **Before / after** — draggable before/after slider beside the text
19. **Marquee headline** — the name scrolling across over the photo
20. **Next openings** — headline + the next 3 open times as buttons that go straight to booking

### About
1. **Text** — centered heading and bio
2. **Photo left** — photo left, text right
3. **Photo right** — text left, photo right
4. **Two columns** — bio split into two columns
5. **Portrait circle** — round photo above the bio
6. **Pull quote** — large quote, bio below
7. **Credentials** — bio + row of facts (years, certifications, specialties)
8. **Values** — bio + 3 value cards with icons (e.g. "Healthy hair first")
9. **Arch photo** — photo in an arch frame beside the text
10. **Overlapping photos** — two photos overlapping, text beside
11. **Full photo + card** — full-width photo, bio in a card over it
12. **Since…** — big year/number ("Since 2015") beside the story
13. **Signature** — bio ending in a handwritten-style name
14. **Timeline** — the journey in steps (started, trained, opened the studio)
15. **Q&A** — Who I am / What I do / Why clients come back
16. **Tabs** — My story / Training / Products I use
17. **Video** — short intro video beside the text
18. **Sticky photo** — photo stays in place while the text scrolls (desktop)
19. **Collage** — 3–4 photos in a grid with the text
20. **Editorial** — magazine look: drop cap, narrow column, small caption photo

### Services
1. **Price list** — name … price, dotted leader lines, like a menu
2. **Two-column menu** — the price list in two columns
3. **Simple list + Book** — each service with a Book button
4. **Cards (3 across)** — photo, name, time, price, Book
5. **Cards (2 across, large)** — bigger photos and descriptions
6. **Table** — Service | Time | Price | Book
7. **Category tabs** — tabs per category (Braids, Locs, Silk press…)
8. **Category accordion** — expand a category to see its services
9. **Carousel** — swipeable cards
10. **Featured + list** — one big featured service, the rest as a list
11. **Photo rows** — photo left, details right, alternating
12. **Hover reveal** — photo cards that show details on hover (tap on phones)
13. **Masonry** — photos of different heights with price tags
14. **Numbered** — 01, 02, 03… with big numbers
15. **Big type** — large editorial service names, small details
16. **Pricing cards** — pricing-plan style cards, one highlighted
17. **Split categories** — categories on the left, services on the right
18. **Circle photos** — round photos with name and price below
19. **Overlap cards** — cards overlapping a photo band
20. **Quick picks** — compact chips ("Knotless · from $180 · 5h") that jump straight to booking

### Gallery
1. **Grid (3)**
2. **Grid (4)**
3. **Grid with captions**
4. **Carousel**
5. **Full-width slider**
6. **Masonry**
7. **Two large** — two big photos side by side
8. **Featured + grid** — one large, smaller ones beside it
9. **Mosaic** — mixed sizes in a tight grid
10. **Bento** — rounded tiles of different sizes
11. **Filmstrip** — horizontal scroll strip
12. **Infinite marquee** — photos slowly scrolling across
13. **Staggered columns** — columns offset vertically
14. **Polaroids** — slightly rotated framed photos
15. **Before / after pairs** — slider per pair
16. **Circles** — round crops
17. **Collage + text** — photos with a heading laid over them
18. **Full-width stack** — big photos one after another
19. **Feed grid** — square 3×3 grid with an Instagram handle button
20. **Lightbox strip** — one big photo, thumbnails underneath

Every gallery opens photos full-screen on tap (lightbox).

### Reviews
1. **Single quote** — one large testimonial
2. **Three cards**
3. **Grid with stars**
4. **Carousel**
5. **List** — simple stacked quotes
6. **Quote + photo** — testimonial beside the client's photo
7. **Rating summary** — big ★ average and count, quotes below
8. **Split** — heading left, quotes right
9. **Masonry wall**
10. **Marquee** — reviews scrolling across
11. **Double marquee** — two rows scrolling opposite ways
12. **Chat bubbles** — reviews as messages
13. **Card deck** — stacked cards that fan out
14. **Featured + small** — one big quote, smaller ones beside
15. **Photo-backed** — quote over the photo of the hairstyle
16. **Post cards** — social-post style cards with avatar and handle
17. **Big avatars slider** — large client photos with dots
18. **Badges** — rating number + badges ("5★ on Google", "300+ clients")
19. **Timeline** — reviews over time
20. **Accordion** — short quotes that expand

### Offers (loyalty, referral, promos)
Choose what to show: loyalty program, referral program, a custom promo, or both programs.
1. **Strip** — thin full-width banner
2. **Centered card**
3. **Color block** — full-width bold block
4. **Badge + button**
5. **Minimal line** — text + link
6. **Big number** — "$10 OFF" huge, details small
7. **Two offers** — loyalty and referral side by side
8. **Split + icon** — text left, icon/illustration right
9. **Coupon** — ticket style with a perforated edge
10. **Stamp card** — loyalty punch card ("5 visits = $10 off") with stamps
11. **Progress** — "Visit 5 times → reward" as a progress bar
12. **Steps** — 1 Share your link → 2 Friend books → 3 You both save
13. **Gift card** — offer shown as a gift card
14. **Code box** — "Have a referral or reward code?" with a copy/enter box
15. **Countdown** — custom promo with a timer to its end date
16. **Image background** — offer over a photo
17. **Corner ribbon** — card with a ribbon in the corner
18. **Tiers** — stacked rewards (bronze/silver/gold style)
19. **Marquee** — offer text scrolling across
20. **Floating ribbon** — small sticky ribbon on the side of the screen that expands on tap

### Book now (CTA)
1. **Centered band**
2. **Split** — text left, button right
3. **Card**
4. **Minimal link**
5. **Two buttons** — Book / Join waitlist
6. **Gradient band**
7. **Bordered box**
8. **Phone + Book** — call or book
9. **Photo background**
10. **Photo beside**
11. **Next openings** — the next open times as buttons
12. **Week strip** — the next 7 days with open/full dots
13. **Service picker** — choose a service, then Book
14. **Waitlist form** — inline "tell me about openings" form when fully booked
15. **Big type** — "BOOK YOUR APPOINTMENT" huge across the screen
16. **Marquee** — "BOOK NOW • BOOK NOW •" scrolling
17. **Diagonal** — slanted band
18. **Quote + CTA** — a short review, then the button
19. **Stats + CTA** — "300+ clients · 4.9★" then the button
20. **Sticky bar** — slim bar that stays at the bottom while scrolling

### Hours & location
1. **Hours + address** — two columns
2. **Hours table**
3. **Address card** — with a Directions button
4. **Map + details** — map left, details right
5. **Full map + card** — map across the section, card over it
6. **Open now** — "Open now · until 6 PM" + today's hours
7. **Next openings** — live next open times
8. **Two cards** — Location / Hours
9. **Icons row** — address, hours, parking, accessibility
10. **Week grid** — 7 day columns
11. **Week strip** — today highlighted, swipe through the week
12. **Big today** — "Open today 9–5" in large type
13. **Next openings + map**
14. **Service area** — for mobile stylists: "I travel to you" + areas served (no address)
15. **Studio photo** — photo of the space + details
16. **Accordion** — Hours / Getting here / Parking
17. **Map background** — hours over a faded map
18. **Timeline** — today's open hours as a bar
19. **Minimal** — one line each
20. **Footer strip** — compact single row

The exact address can stay hidden ("shared when you book"), as the template sites do today. Maps use a free OpenStreetMap embed (no API key, no cost).

### Contact
1. **Icon list** — phone, email, Instagram, TikTok
2. **Cards**
3. **Big links** — large centered links
4. **Social buttons**
5. **Two columns** — contact + short note
6. **Minimal**
7. **Big phone** — the number in large type with Call / Text buttons
8. **Photo + contact**
9. **Message form** — sends the business an email (with the Turnstile bot check and rate limit)
10. **Form + details**
11. **QR code** — scan to book or to save the contact
12. **Business card** — styled like a business card
13. **Text me** — chat-bubble "Text me" button
14. **Floating card**
15. **Banner**
16. **Socials grid** — tiles with handles
17. **Hours + contact**
18. **Map + contact**
19. **FAQ + contact**
20. **Bordered list**

### FAQ
1. **Accordion**
2. **Two-column accordion**
3. **Open list** — all answers visible
4. **Cards**
5. **Numbered**
6. **Split** — heading left, questions right
7. **Category tabs**
8. **Minimal**
9. **Bordered rows**
10. **Highlighted first** — the most-asked question shown open and larger
11. **Chat** — question/answer as message bubbles
12. **Search** — filter questions as you type
13. **Grid of cards** — question cards that flip to the answer
14. **Icon + question** — an icon per topic
15. **Image + accordion**
16. **Sticky heading** — heading stays while questions scroll (desktop)
17. **Big question** — large question text, small answers
18. **Stacked panels** — full-width alternating color panels
19. **Two columns open**
20. **FAQ + contact** — accordion with "Still have a question?" contact at the end

Starter questions offered (edit or delete): how to prepare, what to bring, hair included?, deposits, lateness, kids, payment methods.

### Policies & prep
1. **Cards grid** — one card per policy
2. **Accordion**
3. **Checklist** — "Before your appointment" with check icons
4. **Two columns** — Policies / Prep
5. **Icon list**
6. **Highlight box** — the most important policy in a colored box
7. **Steps** — 1 Book → 2 Pay deposit → 3 Arrive prepped
8. **Table** — Policy | Details
9. **Minimal**
10. **Split** — heading left, list right
11. **Timeline** — what happens before, during, after
12. **Tabs** — Deposits / Cancellations / Prep
13. **Numbered**
14. **Banner** — one-line key policy + "Read all"
15. **Bordered rows**
16. **Do / Don't** — two columns with ✓ and ✕
17. **Sticky heading**
18. **Fee cards** — deposit, late fee, no-show fee as amounts
19. **Read before booking** — the business's Read-before-booking text, styled
20. **Compact strip** — icons with short labels

Policy values come from Booking Settings, so they always match what the booking page enforces.

### Footer
1. **Simple** — name, links, © line
2. **Centered**
3. **Columns** — About / Links / Contact / Hours
4. **Socials row**
5. **Minimal**
6. **Two rows** — links, then legal
7. **Big name** — huge wordmark across the bottom
8. **Book band** — CTA band joined to the footer
9. **Hours + contact**
10. **Map footer**
11. **Card footer** — rounded block inset from the edges
12. **Split** — brand left, links right
13. **Newsletter-style** — "Get first dibs on openings" (joins the waitlist)
14. **Photo strip** — row of gallery photos above the footer
15. **Stacked** — everything centered in a column
16. **Boxed cells** — bordered grid
17. **Dark band**
18. **Marquee** — name scrolling across
19. **Logo center**
20. **Compact** — one line

All footers keep the legal links and a small "Booking by AfroAllure" link.

## 6. Tab 3 — Animation

Light and tasteful; nothing that makes people dizzy. Built with the `motion` library already installed.

**Entrance (when the section scrolls into view)**
- Basic: None · Fade · Fade up · Fade down · Slide from left · Slide from right · Zoom in · Zoom out
- Advanced: Blur in · Soft rise (spring) · Reveal up (wipe) · Reveal from sides · Heading line-by-line · Heading word-by-word · Gentle flip in

**What animates:** whole section · heading only · text then items · items one by one (stagger, e.g. service cards, gallery photos, reviews)

**Scroll effects:** parallax background (slow / medium) · image zoom while scrolling · fade out when leaving · sticky photo (only where the layout supports it)

**Hover effects** (cards, photos, buttons): none · lift · zoom photo · glow · underline grow · slight tilt

**Ambient:** slow zoom on hero photo (Ken Burns) · marquee speed · gradient drift

**Numbers:** count up (stats, ratings, "$10 off")

**Controls:** duration (fast / normal / slow + exact ms), delay, easing (smooth / snappy / soft bounce), stagger gap, play once or every time, start point (as soon as it appears / when half visible). A **▶ Preview** button replays it on the canvas.

**Rules:** content is always visible without JavaScript; animations only move/fade (no layout shift); people who turn on "reduce motion" in their phone settings get no movement; each animation has a sensible default per layout.

## 7. How it's built

**Data:** still Puck data in `web_editors.editor_data`, under a new site type `BUILDER`. Each section is one Puck component (13 + Spacer):
```ts
{ type: 'Services', props: { id, layout: 14, content: {...}, style: {...}, animation: {...}, visibility: {...} } }
```
The site theme (fonts, colors, button and corner style) lives in Puck's root props.

**Puck usage:**
- Upgrade `@puckeditor/core` 0.21.3 → 0.24.0 first (also clears the `happy-dom` audit warning).
- `overrides.fields` renders our 3-tab panel (Radix Tabs, already installed); `overrides.drawer` renders the section picker; custom field types for color, font, size, layout picker, media, links.
- Live data (services, hours, openings, programs, policies, address) is loaded on the server and passed to both editor and public page as Puck `metadata`, so sections render real info without each one fetching.

**Reused from the Simple Builder** (`src/features/siteBuilder/`, which becomes part of `src/features/builder/`):
- `themes.ts` — color schemes, font pairings, contrast helpers, booking-page theme sync (`toBookingTheme`)
- `server/loadSite.ts` — the public data a site shows (services with prices, hours, policies, reviews, rating, city; never the street address)
- `uploads.ts` + `MediaPanel` — photo/video uploads to the owner-only `site-media` bucket
- `templates/parts.tsx` — Root (theme CSS variables), Button, Slot/MediaView, Lightbox, Stars, and the section variants the templates use (they become the starting point for several layouts)
- `TemplatePicker` — becomes the starter-page picker

**Code layout** (new `src/features/builder/`):
- `sections/<name>/` — `config.ts` (fields, defaults), `layouts/01-classic.tsx … 20-*.tsx`, `wireframes.ts` (thumbnail drawings)
- `shared/` — SectionShell (background, padding, width, dividers, colors), Text (per-role styles), Media, Buttons, Carousel, Marquee, Lightbox, Map
- `animation/` — entrance/scroll/hover presets on `motion`
- `editor/` — page outline, section picker, tabs panel, layout cards, theme panel
- One shared render path: the canvas and the public page render the same components (no drift).

**Making 260 layouts manageable:** layouts are built from the shared pieces, so most are 40–120 lines. Each layout declares how it collapses on phones. Every layout gets a visual test (screenshot at desktop/tablet/phone with sample data) so changes can't silently break one.

**Performance:** sections are code-split by type; only used layouts load. Images go through `next/image`. Animations use transform/opacity only.

**Accessibility:** contrast warning in the Colors group; carousels and marquees are pausable and keyboard-usable; accordions and tabs use Radix.

## 8. Existing sites, plans and onboarding

See **Decisions (Nov 2)** at the top. In practice:
- **Data:** `web_editors.type = 'BUILDER'`; the published page in `builder_data`, the working draft in `builder_draft`, `builder_published_at` (migration 20261102000000). `site_data` and `theme_data` stay for the booking page and for rollback.
- **Template sites** (`TEMPLATE`): `templateToBuilder(site_data, info)` (src/features/builder/presets.ts) turns the site into its template's starter page with the same colors, fonts, text and photos. The editor opens template sites this way; publishing stores the page as `BUILDER`. *Change from the original plan (Nov 2):* live template sites keep the old renderer until the Reviews, Hours and Book now sections exist (steps 4–5), because every template has them and rendering through the builder before then would drop them from live sites. The switch is one branch in `business/[businessName]/page.tsx`.
- **Phone Book bar:** every old template had a sticky Book bar on phones; builder pages keep it as a site-look option (`mobileBookBar`, on by default). It steps aside when the menu bar is the Bottom booking bar layout.
- **Free-form pages** (`CUSTOM`, `SECTIONS`): keep the legacy renderer until the owner publishes a new-builder page; the old editors are deleted.
- **Plan gating:** every layout and animation is tagged `basic` or `pro`. The editor locks Pro ones for Starter (lock icon + upgrade prompt); the save action rejects a Pro choice from a Starter business unless that section already had it published.
- **Welcome onboarding:** `WebsiteSetupStep` keeps its look (starter page, colors, logo, photos); its previews are builder pages, and finishing publishes a `BUILDER` page (`site_data` is saved too).
- **Booking page** (`/dashboard/booking-page`) is its own screen now; "match my website" reads the builder page's theme.

## 9. Delivery order

1. **Foundation** — Puck 0.24 upgrade; `BUILDER` type and renderer; editor shell at `/dashboard/booking-site` (outline, section picker, 3 tabs, theme panel, device toggle); SectionShell; animation engine; layout cards with wireframes; plan gating.
2. **Core sections** — Navbar, Hero, About, Services, Gallery, Footer (6 × 20 layouts).
3. **Starter pages + migration** — the 6 templates as starter pages; template sites render through the new builder (before/after screenshots); welcome onboarding step; Simple and Custom Builder editors removed.
4. **Data sections** — Hours & location, Offers, Book now, Policies & prep.
5. **Content sections** — Reviews, Contact, FAQ, Spacer.
6. **Polish** — visual tests for all 260 layouts at phone/tablet/desktop, accessibility pass, performance pass.

Steps 1–5 ship together: the old editors are removed in step 3, and pages made in the new builder lack Reviews, Hours and Book now until steps 4–5, so merging earlier would give new sites fewer sections than the templates had. (Originally steps 1–3.) Each step is tested in the browser before the next, and nothing reaches production until you merge.
