import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import { OrderDispatchedTemplate, ORDER_DISPATCHED, isOrderDispatchedTemplateData } from './order-dispatched'
import { VerifyEmailTemplate, VERIFY_EMAIL, isVerifyEmailData } from './verify-email'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  ORDER_DISPATCHED,
  VERIFY_EMAIL,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.ORDER_DISPATCHED:
      if (!isOrderDispatchedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_DISPATCHED}"`
        )
      }
      return <OrderDispatchedTemplate {...data} />

    case EmailTemplates.VERIFY_EMAIL:
      if (!isVerifyEmailData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.VERIFY_EMAIL}"`
        )
      }
      return <VerifyEmailTemplate {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export { InviteUserEmail, OrderPlacedTemplate, OrderDispatchedTemplate, VerifyEmailTemplate }

