import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

/**
 * Order Placed Subscriber
 * Sends email (via Resend) and SMS (via Twilio) notifications when an order is successfully placed.
 * Handles notification failures gracefully so order creation is never blocked.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ['items', 'summary', 'shipping_address']
    })

    const shippingAddress = order.shipping_address
      ? (orderModuleService as any).orderAddressService_
        ? await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id).catch(() => order.shipping_address)
        : order.shipping_address
      : null

    const orderNumber = order.display_id || order.id.substring(0, 8)
    const customerName = shippingAddress?.first_name || 'Valued Customer'
    const totalAmount = order.summary?.current_order_total !== undefined
      ? Number(order.summary.current_order_total) / 100
      : (order.summary as any)?.raw_current_order_total?.value || 0
    const currency = (order.currency_code || 'ZMW').toUpperCase()

    // 1. Send Email Notification via Resend
    if (order.email) {
      try {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: 'email',
          template: EmailTemplates.ORDER_PLACED,
          data: {
            emailOptions: {
              replyTo: process.env.RESEND_REPLY_TO || 'support@syastore.com',
              subject: `Order #${orderNumber} Confirmed - SYA Store`
            },
            order: {
              ...order,
              display_id: String(orderNumber),
              summary: {
                raw_current_order_total: { value: totalAmount }
              }
            },
            shippingAddress: shippingAddress || {},
            preview: `Thank you for your order #${orderNumber}!`
          }
        })
        console.log(`[Order Notifications] Resend email successfully dispatched for order #${orderNumber} to ${order.email}`)
      } catch (emailError) {
        console.error(`[Order Notifications] Failed to send email for order #${orderNumber}:`, emailError)
      }
    }

    // 2. Send SMS Notification via Twilio
    const recipientPhone = shippingAddress?.phone || (order as any).phone
    if (recipientPhone) {
      try {
        const smsBody = `Hi ${customerName}, your order #${orderNumber} has been confirmed! Total: ${totalAmount} ${currency}. Thank you for shopping with SYA Store.`

        await notificationModuleService.createNotifications({
          to: recipientPhone,
          channel: 'sms',
          template: 'order_placed_sms',
          data: {
            message: smsBody,
            orderNumber,
            customerName,
            orderTotal: totalAmount,
            currency,
            storeUrl: process.env.STOREFRONT_URL || 'https://syastore.com'
          }
        })
        console.log(`[Order Notifications] Twilio SMS successfully dispatched for order #${orderNumber} to ${recipientPhone}`)
      } catch (smsError) {
        console.warn(`[Order Notifications] Failed to send Twilio SMS for order #${orderNumber}:`, smsError)
      }
    }
  } catch (error) {
    console.error('[Order Notifications] Error in order-placed subscriber:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
