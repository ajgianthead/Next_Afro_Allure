export type PlanType = 'STARTER' | 'GROWTH'

/**
 * The plan a business should be treated as having right now. Use this for
 * every feature gate. Growth covers paid, trialing, comped (100%-off code)
 * and complimentary early-access accounts — the subscription webhook and the
 * daily complimentary job keep business_users.plan_type current.
 */
export function effectivePlanType(planType: PlanType | null | undefined): PlanType {
    return planType ?? 'STARTER'
}
