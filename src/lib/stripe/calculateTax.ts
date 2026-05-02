import { stripe } from "./stripeClient"

export interface TaxAddress {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
}

export function buildTaxAddress(addr: {
    no_address?: boolean
    line_1?: string
    city?: string
    state?: string
    zip_code?: string
}): TaxAddress | undefined {
    if (!addr || addr.no_address) return undefined
    return {
        line1: addr.line_1 ?? '',
        city: addr.city ?? '',
        state: addr.state ?? '',
        postal_code: addr.zip_code ?? '',
        country: 'US',
    }
}

export const calculateTax = async (connectedAccountId: string, price: number, address?: TaxAddress) => {
    const taxCalc = await stripe.tax.calculations.create({
        currency: 'usd',
        line_items: [{ amount: price, reference: "Appointment Payment" }],
        customer_details: {
            address: address ?? { line1: '2800 Post Oak Blvd', state: 'TX', city: 'Houston', country: 'US', postal_code: '77056' },
            address_source: 'billing'
        }
    }, { stripeAccount: connectedAccountId })
    return taxCalc
}
