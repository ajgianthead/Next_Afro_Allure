export const PLAN_LIMITS = {
  STARTER: {
    maxMonthlyBookings: 10,
    maxAvailabilities: 1,
    canUseDragDropEditor: false,
    canUseAdvancedPayments: false,
    canViewDetailedAnalytics: false,
    canUseAutomatedReminders: false,
  },
  GROWTH: {
    maxMonthlyBookings: Infinity,
    maxAvailabilities: Infinity,
    canUseDragDropEditor: true,
    canUseAdvancedPayments: true,
    canViewDetailedAnalytics: true,
    canUseAutomatedReminders: true,
  },
}

export function getBusinessPermissions(planType: 'STARTER' | 'GROWTH') {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.STARTER
}
