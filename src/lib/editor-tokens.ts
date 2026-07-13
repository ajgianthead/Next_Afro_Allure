// Editor design tokens — AfroAllure palette adapted to a clean Webflow-style editor chrome.
// Import as: import T from '@/lib/editor-tokens'

const T = {
    // ── Backgrounds ────────────────────────────────────────────────────────────
    bgCanvas:   '#F0EDE8',   // warm cream canvas surround
    bgPanel:    '#FFFFFF',   // sidebar / settings panel background
    bgHover:    '#FAF7F2',   // row / item hover
    bgPressed:  '#F0EDE8',   // active / pressed
    bgSelected: '#FFF5F5',   // selected item tint (warm red)
    bgInput:    '#FAF7F2',   // number / text inputs

    // ── Borders ────────────────────────────────────────────────────────────────
    borderDefault: '#E8E2D6',   // panel dividers, input borders
    borderStrong:  '#D4CFC8',   // stronger dividers
    borderFocus:   '#FC6161',   // focus ring (AfroAllure red)

    // ── Text ───────────────────────────────────────────────────────────────────
    textPrimary:   '#1A1818',   // labels, values
    textSecondary: '#6F6863',   // muted labels, hints
    textTertiary:  '#A09790',   // placeholders, drag handles

    // ── Accent ─────────────────────────────────────────────────────────────────
    accent:        '#FC6161',   // primary CTA, active states, focus
    accentHover:   '#E85555',   // darker on hover
    accentSuccess: '#10B981',
    accentWarning: '#F59E0B',
    accentDanger:  '#EF4444',

    // ── Typography ─────────────────────────────────────────────────────────────
    fontFamily: "'Inter', system-ui, sans-serif",
    fontMono:   "'JetBrains Mono', 'Fira Code', monospace",

    sizeXs:   11,   // px — chip labels, drag handles
    sizeSm:   12,   // property labels
    sizeBase: 13,   // body / field values
    sizeMd:   14,   // section titles, buttons

    weightNormal:   400,
    weightMedium:   500,
    weightSemibold: 600,

    // ── Spacing ────────────────────────────────────────────────────────────────
    spaceXs:  4,
    spaceSm:  8,
    spaceMd:  12,
    spaceLg:  16,
    spaceXl:  24,
    space2xl: 32,

    // ── Border radius ──────────────────────────────────────────────────────────
    radiusSm: 4,    // inputs, small chips
    radiusMd: 6,    // buttons, tags
    radiusLg: 8,    // cards, panels
    radiusXl: 12,   // modals

    // ── Shadows ────────────────────────────────────────────────────────────────
    shadowSm: '0 1px 2px rgba(0,0,0,0.06)',
    shadowMd: '0 4px 6px rgba(0,0,0,0.06)',
    shadowLg: '0 10px 24px rgba(0,0,0,0.10)',

    // ── Control dimensions ─────────────────────────────────────────────────────
    controlHeight:     28,   // standard input / button height (px)
    controlHeightSm:   24,
    sidebarLeft:      280,   // px — left panel width
    sidebarRight:     320,   // px — right panel width
    topbarHeight:      52,   // px

    // ── Transitions ────────────────────────────────────────────────────────────
    transFast:   '80ms ease-out',
    transNormal: '140ms ease-out',
    transSlow:   '200ms ease-out',
} as const

export default T
