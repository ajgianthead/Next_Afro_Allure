import { STARTER_LIMITS } from '@/features/billing/plans'

export const PLAN_LIMITS = {
  STARTER: {
    maxMonthlyBookings: STARTER_LIMITS.bookingsPerMonth,
    maxAvailabilities: 1,
    canUseDragDropEditor: false,
    canUseAdvancedPayments: false,
    canViewDetailedAnalytics: false,
    canUseAutomatedReminders: false,
    canUseLoyalty: false,
  },
  GROWTH: {
    maxMonthlyBookings: Infinity,
    maxAvailabilities: Infinity,
    canUseDragDropEditor: true,
    canUseAdvancedPayments: true,
    canViewDetailedAnalytics: true,
    canUseAutomatedReminders: true,
    canUseLoyalty: true,
  },
}

export function getBusinessPermissions(planType: 'STARTER' | 'GROWTH') {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.STARTER
}
