// Editor design tokens — "Apple feel" chrome with AfroAllure brand colors.
// Import as: import T from '@/lib/editor-tokens'

const T = {
    // ── Backgrounds ────────────────────────────────────────────────────────────
    bgCanvas:   '#FAF7F2',   // warm cream canvas surround
    bgPanel:    '#FFFFFF',   // sidebar / settings panel background
    bgHover:    '#F5F6F8',   // row / item hover — very light gray
    bgPressed:  '#ECEEF1',   // active / pressed — slightly darker
    bgSelected: '#FFF5F5',   // selected item tint (warm red)
    bgInput:    '#F9F8F6',   // number / text inputs

    // ── Borders ────────────────────────────────────────────────────────────────
    borderDefault: '#E8E2D6',   // panel dividers, input borders (warm, not cold gray)
    borderStrong:  '#D4CCC4',   // stronger dividers
    borderFocus:   '#FC6161',   // focus ring (AfroAllure red, not blue) — 2px

    // ── Text ───────────────────────────────────────────────────────────────────
    textPrimary:   '#1A1818',   // labels, values (warm dark)
    textSecondary: '#6F6863',   // muted labels, hints (warm muted)
    textTertiary:  '#9E9590',   // placeholders, drag handles (very muted)

    // ── AfroAllure brand accents ──────────────────────────────────────────────
    accent:        '#FC6161',   // primary CTA, active states, selected borders, focus rings
    accentHover:   '#E85555',   // darker on hover
    gold:          '#C9974A',   // premium / founding-member indicators, special badges only
    dark:          '#0F0E0E',   // sparingly — text only, never large surfaces
    cream:         '#FAF7F2',   // canvas / warm surfaces
    accentSuccess: '#10B981',
    accentWarning: '#F59E0B',
    accentDanger:  '#EF4444',

    // ── Typography ─────────────────────────────────────────────────────────────
    fontFamily: "'Inter', system-ui, sans-serif",
    fontMono:   "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",

    sizeXs:   11,   // px — chip labels, drag handles
    sizeSm:   12,   // property labels
    sizeBase: 13,   // body / field values
    sizeMd:   14,   // section titles, buttons

    weightNormal:   400,
    weightMedium:   500,
    weightSemibold: 600,

    lineHeightBody:  1.4,
    lineHeightLabel: 1.2,

    // ── Spacing scale ──────────────────────────────────────────────────────────
    spaceXs:  4,
    spaceSm:  8,
    spaceMd:  12,
    spaceLg:  16,
    spaceXl:  24,
    space2xl: 32,

    // ── Border radius ──────────────────────────────────────────────────────────
    radiusSm: 8,    // inputs
    radiusMd: 10,   // buttons
    radiusLg: 12,   // cards / panels
    radiusXl: 16,   // modals

    // ── Shadows ────────────────────────────────────────────────────────────────
    shadowPanel:    '0 1px 3px rgba(0,0,0,0.08)',
    shadowCard:     '0 2px 8px rgba(0,0,0,0.06)',
    shadowFloating: '0 4px 16px rgba(0,0,0,0.10)',
    shadowModal:    '0 8px 32px rgba(0,0,0,0.12)',

    // ── Control dimensions ─────────────────────────────────────────────────────
    controlHeight:     28,   // standard input / button height (px)
    controlHeightSm:   24,
    sidebarLeft:      260,   // px — left "Add Elements" panel width
    sidebarRight:     320,   // px — right settings panel width
    topbarHeight:      52,   // px

    // ── Transitions ────────────────────────────────────────────────────────────
    transFast:   '80ms ease-out',    // instant feedback, < 100ms
    transModal:  '150ms ease-out',   // modal fade + slide
    transNormal: '140ms ease-out',
    transSlow:   '200ms ease-out',
    // Spring physics for panel transitions — pass directly as a framer-motion
    // `transition` prop, e.g. <motion.div transition={T.springPanel}>
    springPanel: { type: 'spring' as const, stiffness: 300, damping: 30 },
    pressScale:    0.97,             // subtle scale on button press
    pressDuration: '100ms ease-out',
} as const

export default T
