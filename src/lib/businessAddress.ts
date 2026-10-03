export interface BusinessAddress {
    no_address: boolean
    line_1: string
    line_2: string
    city: string
    state: string
    zip_code: string
}

export const EMPTY_ADDRESS: BusinessAddress = { no_address: false, line_1: '', line_2: '', city: '', state: '', zip_code: '' }

export const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'PR',
]

export type AddressErrors = Partial<Record<'line_1' | 'city' | 'state' | 'zip_code', string>>

/**
 * Field-level validation. With `required`, an empty address is an error
 * (welcome modal); otherwise an untouched address is allowed (settings).
 */
export function validateBusinessAddress(addr: BusinessAddress, { required = false } = {}): AddressErrors {
    if (addr.no_address) return {}
    const anyFilled = [addr.line_1, addr.line_2, addr.city, addr.state, addr.zip_code].some(v => v?.trim())
    if (!required && !anyFilled) return {}

    const errors: AddressErrors = {}
    if (addr.line_1.trim().length < 3) errors.line_1 = 'Enter your street address'
    if (addr.city.trim().length < 2) errors.city = 'Enter a city'
    if (!US_STATES.includes(addr.state.trim().toUpperCase())) errors.state = 'Use a 2-letter state (e.g. TX)'
    if (!/^\d{5}(-\d{4})?$/.test(addr.zip_code.trim())) errors.zip_code = 'Enter a 5-digit ZIP'
    return errors
}

export function normalizeBusinessAddress(addr: BusinessAddress): BusinessAddress {
    if (addr.no_address) return { ...EMPTY_ADDRESS, no_address: true }
    return {
        no_address: false,
        line_1: addr.line_1.trim(),
        line_2: addr.line_2.trim(),
        city: addr.city.trim(),
        state: addr.state.trim().toUpperCase(),
        zip_code: addr.zip_code.trim(),
    }
}
