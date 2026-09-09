import { Text, Section, Hr, Button } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_DISPATCHED = 'order-dispatched'

interface OrderDispatchedPreviewProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  trackingNumber?: string
  trackingUrl?: string
  fulfillmentMethod?: string
}

export interface OrderDispatchedTemplateProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  trackingNumber?: string
  trackingUrl?: string
  fulfillmentMethod?: string
  preview?: string
}

export const isOrderDispatchedTemplateData = (data: any): data is OrderDispatchedTemplateProps =>
  typeof data === 'object' && data !== null && typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderDispatchedTemplate: React.FC<OrderDispatchedTemplateProps> & {
  PreviewProps: OrderDispatchedPreviewProps
} = ({
  order,
  shippingAddress,
  trackingNumber,
  trackingUrl,
  fulfillmentMethod,
  preview = 'Your package is on its way!'
}) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 20px', color: '#111827' }}>
          🚚 Your Order Has Been Dispatched!
        </Text>

        <Text style={{ margin: '0 0 15px', color: '#374151', fontSize: '16px' }}>
          Hi {shippingAddress.first_name || 'there'} {shippingAddress.last_name || ''},
        </Text>

        <Text style={{ margin: '0 0 25px', color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>
          Great news! Your order <strong>#{order.display_id || order.id?.substring(0, 8)}</strong> has been packaged and dispatched. It is now on its way to your delivery address.
        </Text>

        {trackingNumber && (
          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            padding: '16px',
            margin: '20px 0',
            border: '1px solid #E5E7EB'
          }}>
            <Text style={{ margin: '0 0 6px', fontWeight: 'bold', fontSize: '14px', color: '#1F2937' }}>
              Tracking Information
            </Text>
            <Text style={{ margin: '0 0 4px', fontSize: '14px', color: '#4B5563' }}>
              Tracking Number: <strong>{trackingNumber}</strong>
            </Text>
            {fulfillmentMethod && (
              <Text style={{ margin: '0 0 4px', fontSize: '14px', color: '#4B5563' }}>
                Carrier / Method: {fulfillmentMethod}
              </Text>
            )}
            {trackingUrl && (
              <div style={{ marginTop: '12px' }}>
                <Button
                  href={trackingUrl}
                  style={{
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  Track Package
                </Button>
              </div>
            )}
          </div>
        )}

        <Hr style={{ margin: '25px 0', borderColor: '#E5E7EB' }} />

        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px', color: '#111827' }}>
          Delivery Address
        </Text>
        <Text style={{ margin: '0 0 4px', color: '#4B5563', fontSize: '14px' }}>
          {shippingAddress.address_1}
          {shippingAddress.address_2 ? `, ${shippingAddress.address_2}` : ''}
        </Text>
        <Text style={{ margin: '0 0 4px', color: '#4B5563', fontSize: '14px' }}>
          {shippingAddress.city}{shippingAddress.province ? `, ${shippingAddress.province}` : ''} {shippingAddress.postal_code || ''}
        </Text>
        <Text style={{ margin: '0 0 20px', color: '#4B5563', fontSize: '14px' }}>
          {shippingAddress.country_code?.toUpperCase()}
        </Text>

        <Hr style={{ margin: '25px 0', borderColor: '#E5E7EB' }} />

        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px', color: '#111827' }}>
          Dispatched Items
        </Text>

        {order.items && order.items.length > 0 && (
          <div style={{
            width: '100%',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            margin: '10px 0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#F9FAFB',
              padding: '10px 14px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <Text style={{ fontWeight: 'bold', margin: 0, fontSize: '13px', color: '#374151' }}>Item</Text>
              <Text style={{ fontWeight: 'bold', margin: 0, fontSize: '13px', color: '#374151' }}>Qty</Text>
            </div>
            {order.items.map((item: any) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #F3F4F6'
              }}>
                <Text style={{ margin: 0, fontSize: '13px', color: '#111827' }}>
                  {item.title} {item.variant_title ? `(${item.variant_title})` : ''}
                </Text>
                <Text style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>
                  x{item.quantity}
                </Text>
              </div>
            ))}
          </div>
        )}

        <Text style={{ margin: '30px 0 0', color: '#6B7280', fontSize: '13px', textAlign: 'center' }}>
          If you have questions about your shipment, simply reply to this email.
        </Text>
      </Section>
    </Base>
  )
}

OrderDispatchedTemplate.PreviewProps = {
  order: {
    id: 'ord_preview_123',
    display_id: '10024',
    created_at: new Date().toISOString(),
    email: 'customer@example.com',
    currency_code: 'ZMW',
    items: [
      { id: 'item_1', title: 'Premium Sunglasses', product_title: 'Accessories', quantity: 1, unit_price: 350 }
    ],
    shipping_address: {
      first_name: 'Alex',
      last_name: 'Mwamba',
      address_1: 'Plot 45 Great East Road',
      city: 'Lusaka',
      province: 'Lusaka',
      postal_code: '10101',
      country_code: 'ZM'
    }
  },
  shippingAddress: {
    first_name: 'Alex',
    last_name: 'Mwamba',
    address_1: 'Plot 45 Great East Road',
    city: 'Lusaka',
    province: 'Lusaka',
    postal_code: '10101',
    country_code: 'ZM'
  },
  trackingNumber: 'TRK-ZM-8923441',
  fulfillmentMethod: 'Express Courier'
} as OrderDispatchedPreviewProps

export default OrderDispatchedTemplate
