import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService, IFulfillmentModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

/**
 * Order Dispatched / Fulfillment Created Subscriber
 * Sends email (via Resend) and SMS (via Twilio) notifications when an order or fulfillment is dispatched.
 */
export default async function orderDispatchedHandler({
  event: { data, name },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  try {
    let orderId = data.order_id || data.id

    // If the event provides a fulfillment ID, attempt to retrieve the associated order
    if (data.fulfillment_id || name === 'fulfillment.created') {
      try {
        const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
        const fulfillment = await fulfillmentModuleService.retrieveFulfillment(data.fulfillment_id || data.id, {
          relations: ['labels', 'items']
        })
        if ((fulfillment as any).order_id) {
          orderId = (fulfillment as any).order_id
        }
      } catch (fErr) {
        // Fall back to direct orderId
      }
    }

    if (!orderId) {
      console.warn('[Dispatch Notifications] No order ID could be resolved from event data:', data)
      return
    }

    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ['items', 'shipping_address', 'fulfillments', 'fulfillments.labels']
    })

    if (!order) {
      console.warn(`[Dispatch Notifications] Order ${orderId} not found`)
      return
    }

    const shippingAddress: any = order.shipping_address || {}
    const orderNumber = order.display_id || order.id.substring(0, 8)
    const customerName = shippingAddress.first_name || 'Valued Customer'
    
    // Extract tracking number if available from fulfillment labels
    const fulfillments = (order as any).fulfillments || []
    const latestFulfillment = fulfillments[fulfillments.length - 1]
    const trackingNumber = latestFulfillment?.labels?.[0]?.tracking_number || (data as any)?.tracking_number || ''
    const trackingUrl = latestFulfillment?.labels?.[0]?.tracking_url || ''
    const fulfillmentMethod = latestFulfillment?.shipping_option?.name || 'Standard Courier'

    // 1. Send Dispatch Email via Resend
    if (order.email) {
      try {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: 'email',
          template: EmailTemplates.ORDER_DISPATCHED,
          data: {
            emailOptions: {
              replyTo: process.env.RESEND_REPLY_TO || 'support@syastore.com',
              subject: `🚚 Your Order #${orderNumber} Has Been Dispatched! - SYA Store`
            },
            order: {
              ...order,
              display_id: String(orderNumber)
            },
            shippingAddress,
            trackingNumber,
            trackingUrl,
            fulfillmentMethod,
            preview: `Your package for order #${orderNumber} is on its way!`
          }
        })
        console.log(`[Dispatch Notifications] Resend dispatch email sent for order #${orderNumber} to ${order.email}`)
      } catch (emailErr) {
        console.error(`[Dispatch Notifications] Failed to send dispatch email for order #${orderNumber}:`, emailErr)
      }
    }

    // 2. Send Dispatch SMS via Twilio
    const recipientPhone = shippingAddress.phone || (order as any).phone
    if (recipientPhone) {
      try {
        const trackingText = trackingNumber ? ` Tracking: ${trackingNumber}.` : ''
        const smsMessage = `Hi ${customerName}, great news! Your SYA Store order #${orderNumber} has been dispatched and is on its way.${trackingText} Thank you for shopping with us!`

        await notificationModuleService.createNotifications({
          to: recipientPhone,
          channel: 'sms',
          template: 'order_dispatched_sms',
          data: {
            message: smsMessage,
            orderNumber,
            customerName,
            trackingNumber,
            storeUrl: process.env.STOREFRONT_URL || 'https://syastore.com'
          }
        })
        console.log(`[Dispatch Notifications] Twilio dispatch SMS sent for order #${orderNumber} to ${recipientPhone}`)
      } catch (smsErr) {
        console.warn(`[Dispatch Notifications] Failed to send dispatch SMS for order #${orderNumber}:`, smsErr)
      }
    }
  } catch (error) {
    console.error('[Dispatch Notifications] Error in order-dispatched subscriber:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['order.fulfillment_created', 'fulfillment.created', 'shipment.created']
}
