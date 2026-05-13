export interface BookingTheme {
    primaryColor: string
    primaryTextColor: string
    backgroundColor: string
    cardColor: string
    borderColor: string
    textColor: string
    mutedColor: string
    accentColor: string
    fontFamily: string
    bodyFontFamily: string
    buttonRadius: string
    inputRadius: string
    cardRadius: string
}

export const DEFAULT_BOOKING_THEME: BookingTheme = {
    primaryColor: '#FC6161',
    primaryTextColor: '#FFFFFF',
    backgroundColor: '#FAF7F2',
    cardColor: '#FFFFFF',
    borderColor: '#E8E2D6',
    textColor: '#1A1818',
    mutedColor: '#6F6863',
    accentColor: '#C9974A',
    fontFamily: 'Fraunces',
    bodyFontFamily: 'Inter',
    buttonRadius: '12px',
    inputRadius: '12px',
    cardRadius: '16px',
}
