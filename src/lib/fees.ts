export const PLATFORM_FEE_PERCENT = 0.03

export function calculatePlatformFee(amountInCents: number): number {
    return Math.round(amountInCents * PLATFORM_FEE_PERCENT)
}
