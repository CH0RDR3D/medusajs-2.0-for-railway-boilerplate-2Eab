import { ExecArgs } from '@medusajs/framework/types'
import { loadEnv } from '@medusajs/framework/utils'
import { Resend } from 'resend'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Resend Email Test Executable for Medusa 2.0
 * Run with: medusa exec ./src/scripts/test-resend.ts
 */
export default async function testResend({ container }: ExecArgs) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev'
  const TO_EMAIL = process.env.TEST_NOTIFICATION_EMAIL || 'thengandu@outlook.com'

  if (!RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY environment variable is not set in .env')
    return
  }

  const resend = new Resend(RESEND_API_KEY)

  console.log('--------------------------------------------------')
  console.log('📧 Testing Resend API Email Dispatch')
  console.log(`From: ${FROM_EMAIL}`)
  console.log(`To:   ${TO_EMAIL}`)
  console.log('--------------------------------------------------')

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: 'Hello World - ShadyStore Medusa Notification Test',
      html: '<p>Congrats on sending your <strong>first email</strong> from Medusa.js & Resend!</p><p>Your Resend integration is successfully connected and ready for order and dispatch notifications.</p>'
    })

    if (error) {
      console.error('❌ Resend API Error:', error)
      return
    }

    console.log('✅ Email sent successfully!')
    console.log('Response data:', data)
  } catch (err) {
    console.error('❌ Unexpected error while sending email:', err)
  }
}
