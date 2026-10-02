'use server'

import { IssueRefundInput } from "../types"
import { getRefundSummary, issueRefund, listRefunds } from "./domain"

export const getRefundSummaryAction = async (appointmentId: string) => {
    return await getRefundSummary(appointmentId)
}

export const listRefundsAction = async (appointmentId: string) => {
    return await listRefunds(appointmentId)
}

export const issueRefundAction = async (input: IssueRefundInput) => {
    return await issueRefund(input)
}
