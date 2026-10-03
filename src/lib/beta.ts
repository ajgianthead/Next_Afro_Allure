export type PlanType = 'STARTER' | 'GROWTH'

/**
 * While AfroAllure is in beta, every business gets full (Growth-plan) access
 * with no paywalls, booking caps or upgrade prompts. The plan stored in
 * business_users.plan_type is left untouched (the subscription webhook still
 * maintains it), so flipping this to false restores normal plan gating.
 */
export const BETA_FULL_ACCESS = true

/** The plan a business should be treated as having right now. Use this for every feature gate. */
export function effectivePlanType(planType: PlanType | null | undefined): PlanType {
    if (BETA_FULL_ACCESS) return 'GROWTH'
    return planType ?? 'STARTER'
}
