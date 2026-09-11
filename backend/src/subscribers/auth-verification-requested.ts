import { INotificationModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { STORE_CORS } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

interface VerificationRequestedData {
  entity_id: string // The email address
  entity_type: string // "email"
  code_provider?: string
  auth_identity_id: string
  code: string
  expires_at?: Date | string
  metadata?: Record<string, any>
}

/**
 * Subscriber handling email verification requests.
 * Dispatches verification emails via Medusa Notification Module (Resend/Sendgrid)
 * with a secure token link to the storefront /verify-account endpoint.
 */
export default async function authVerificationRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<VerificationRequestedData>) {
  const logger = container.resolve('logger')
  const email = data.entity_id
  const token = data.code

  if (!email || !token) {
    logger.warn('[Auth Verification] Missing email or verification code in event data.')
    return
  }

  // Resolve Storefront URL (handling comma-separated CORS origins or fallback)
  const storefrontBase = (
    process.env.STOREFRONT_URL ||
    STORE_CORS?.split(',')[0]?.trim() ||
    'http://localhost:8000'
  ).replace(/\/+$/, '')

  const verificationLink = `${storefrontBase}/verify-account?token=${encodeURIComponent(token)}`

  logger.info(`[Auth Verification] Generated verification link for ${email}: ${verificationLink}`)

  try {
    const notificationModuleService: INotificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )

    await notificationModuleService.createNotifications({
      to: email,
      channel: 'email',
      template: EmailTemplates.VERIFY_EMAIL,
      data: {
        emailOptions: {
          replyTo: process.env.RESEND_FROM_EMAIL || 'support@syastore.com',
          subject: 'Verify your email address - SYA Store',
        },
        verificationLink,
        name: data.metadata?.first_name || data.metadata?.name,
        preview: 'Complete your registration by verifying your email address',
      },
    })

    logger.info(`[Auth Verification] Successfully dispatched verification email to ${email}`)
  } catch (error) {
    logger.error(
      `[Auth Verification] Failed to send verification email to ${email}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'auth.verification_requested',
}
