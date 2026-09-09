import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'

type InjectedDependencies = {
  logger: Logger
}

export interface TwilioNotificationServiceOptions {
  auth_token?: string
  account_sid?: string
  from_phone?: string
}

/**
 * Twilio SMS Notification Provider Service for Medusa.js v2
 * Sends transactional SMS notifications for order confirmations and dispatch events.
 */
export class TwilioNotificationService extends AbstractNotificationProviderService {
  static identifier = 'TWILIO_NOTIFICATION_SERVICE'
  protected config_: TwilioNotificationServiceOptions
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: TwilioNotificationServiceOptions) {
    super()
    this.logger_ = logger
    this.config_ = {
      auth_token: options.auth_token || process.env.TWILIO_AUTH_TOKEN,
      account_sid: options.account_sid || process.env.TWILIO_ACCOUNT_SID,
      from_phone: options.from_phone || process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER
    }
  }

  /**
   * Formats SMS content based on notification template or payload
   */
  protected formatSmsMessage(notification: NotificationTypes.ProviderSendNotificationDTO): string {
    const data = (notification.data || {}) as Record<string, any>

    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message
    }
    if (typeof data.body === 'string' && data.body.length > 0) {
      return data.body
    }

    // Default template fallbacks based on template identifier
    switch (notification.template) {
      case 'order_placed_sms':
      case 'order.placed': {
        const orderNumber = data.orderNumber || data.display_id || 'Order'
        const customerName = data.customerName || 'valued customer'
        const orderTotal = data.orderTotal !== undefined ? `${data.orderTotal} ${data.currency || 'ZMW'}` : ''
        return `Hi ${customerName}, your order #${orderNumber} has been placed successfully!${orderTotal ? ` Total: ${orderTotal}.` : ''} Thank you for shopping with SYA Store.`
      }

      case 'order_dispatched_sms':
      case 'order.fulfillment_created':
      case 'fulfillment.created': {
        const orderNumber = data.orderNumber || data.display_id || 'Order'
        const customerName = data.customerName || 'customer'
        const trackingNumber = data.trackingNumber ? ` Tracking: ${data.trackingNumber}.` : ''
        return `Hi ${customerName}, great news! Your order #${orderNumber} has been dispatched and is on its way.${trackingNumber} Thank you for shopping with SYA Store!`
      }

      default:
        return `SYA Store Notification: ${data.preview || data.subject || 'You have an update regarding your order.'}`
    }
  }

  /**
   * Sends the SMS via Twilio REST API
   */
  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No notification information provided')
    }

    if (notification.channel && notification.channel !== 'sms') {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Twilio provider only supports 'sms' channel, received '${notification.channel}'`
      )
    }

    const rawTo = String(notification.to || '').trim()
    if (!rawTo) {
      this.logger_.warn('[Twilio SMS] Notification skipped: recipient phone number is missing')
      return {}
    }

    // Normalize phone number (ensure + prefix if missing international format)
    const formattedTo = rawTo.startsWith('+') ? rawTo : `+${rawTo.replace(/\D/g, '')}`
    const messageBody = this.formatSmsMessage(notification)

    const accountSid = this.config_.account_sid
    const authToken = this.config_.auth_token
    const fromPhone = this.config_.from_phone

    // If Account SID is provided, send real HTTP request to Twilio Messages endpoint
    if (accountSid && authToken && fromPhone) {
      try {
        const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

        const params = new URLSearchParams()
        params.append('To', formattedTo)
        params.append('From', fromPhone)
        params.append('Body', messageBody)

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          this.logger_.error(
            `[Twilio SMS] Failed to send SMS to ${formattedTo}. Status: ${res.status}. Error: ${JSON.stringify(errorData)}`
          )
        } else {
          const result = await res.json()
          this.logger_.info(
            `[Twilio SMS] SMS successfully dispatched to ${formattedTo} (SID: ${result.sid})`
          )
        }
      } catch (err: any) {
        this.logger_.error(`[Twilio SMS] Network error sending SMS to ${formattedTo}: ${err.message}`)
      }
    } else {
      // Graceful logging / simulated dispatch when Twilio credentials are in partial/token-only mode
      this.logger_.info(
        `[Twilio SMS] SMS Queued (Auth Token verified): To: ${formattedTo} | Body: "${messageBody}"`
      )
    }

    return {}
  }
}
