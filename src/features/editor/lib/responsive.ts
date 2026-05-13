export const TEXT_SIZE_MAP: Record<string, string> = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-xl',
    lg: 'text-xl md:text-3xl',
    xl: 'text-3xl md:text-5xl',
}

export const SPACING_MAP: Record<string, string> = {
    tight:    'py-4 px-3 md:py-8 md:px-4',
    normal:   'py-8 px-4 md:py-16 md:px-8',
    spacious: 'py-12 px-6 md:py-24 md:px-16',
}

export const MOBILE_LAYOUT_MAP: Record<string, string> = {
    stack: 'flex flex-col',
    row:   'flex flex-col md:flex-row',
    hide:  'flex flex-col [&>*:last-child]:hidden md:[&>*:last-child]:block',
}

export const TEXT_SIZE_OPTIONS = [
    { label: 'Small',       value: 'sm' },
    { label: 'Medium',      value: 'md' },
    { label: 'Large',       value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
]

export const SPACING_OPTIONS = [
    { label: 'None (manual)', value: 'none' },
    { label: 'Tight',         value: 'tight' },
    { label: 'Normal',        value: 'normal' },
    { label: 'Spacious',      value: 'spacious' },
]

export const MOBILE_LAYOUT_OPTIONS = [
    { label: 'Stack vertically',  value: 'stack' },
    { label: 'Stay side by side', value: 'row' },
]

export const MOBILE_WIDTH_OPTIONS = [
    { label: 'Full width on mobile', value: 'full' },
    { label: 'Keep same size',       value: 'auto' },
]

export const MOBILE_VISIBILITY_OPTIONS = [
    { label: 'Show on mobile', value: 'show' },
    { label: 'Hide on mobile', value: 'hide' },
]
