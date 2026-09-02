import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

/**
 * Order Placed Subscriber
 * Sends email and phone/SMS notifications when an order is successfully placed.
 * Handles notification failures gracefully to not block order creation.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  try {
    const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
    const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

    // Send email notification
    try {
      await notificationModuleService.createNotifications({
        to: order.email,
        channel: 'email',
        template: EmailTemplates.ORDER_PLACED,
        data: {
          emailOptions: {
            replyTo: 'info@example.com',
            subject: 'Your order has been placed'
          },
          order,
          shippingAddress,
          preview: 'Thank you for your order!'
        }
      })
      console.log(`[Order Notifications] Email sent for order ${order.id}`)
    } catch (emailError) {
      console.error(`[Order Notifications] Failed to send email for order ${order.id}:`, emailError)
      // Continue to SMS even if email fails
    }

    // Send SMS notification if phone is available
    if (order.shipping_address?.phone) {
      try {
        const phoneNumber = order.shipping_address.phone.replace(/\D/g, '')
        
        // SMS message with order summary
        const smsMessage = `Hi ${order.shipping_address.first_name}, your order #${order.display_id || order.id.substring(0, 8)} has been confirmed! Total: ${(order.summary?.total || 0) / 100} ZMW. Track it at [store-url].`
        
        await notificationModuleService.createNotifications({
          to: phoneNumber,
          channel: 'sms',
          template: 'order_placed_sms',
          data: {
            orderNumber: order.display_id || order.id.substring(0, 8),
            customerName: order.shipping_address.first_name,
            orderTotal: (order.summary?.total || 0) / 100,
            currency: order.currency_code || 'ZMW',
            storeUrl: process.env.STOREFRONT_URL || 'store.com'
          }
        })
        console.log(`[Order Notifications] SMS sent to ${phoneNumber} for order ${order.id}`)
      } catch (smsError) {
        console.warn(`[Order Notifications] Failed to send SMS for order ${order.id}:`, smsError)
        // SMS failure should not block the order process
      }
    }
  } catch (error) {
    console.error('[Order Notifications] Error in order-placed subscriber:', error)
    // Silently fail to prevent order creation from being blocked
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
