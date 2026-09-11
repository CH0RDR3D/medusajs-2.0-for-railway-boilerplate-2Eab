import { Button, Link, Section, Text, Img, Hr, Heading } from '@react-email/components'
import { Base } from './base'

/**
 * Key identifier for the VerifyEmailTemplate
 */
export const VERIFY_EMAIL = 'verify-email'

/**
 * Props for the VerifyEmailTemplate
 */
export interface VerifyEmailTemplateProps {
  /**
   * The direct verification link with secure token
   */
  verificationLink: string
  /**
   * Optional customer first name or email
   */
  name?: string
  /**
   * Preview text appearing in email inbox summary
   */
  preview?: string
}

/**
 * Type guard for checking if the data is valid VerifyEmailTemplateProps
 */
export const isVerifyEmailData = (data: any): data is VerifyEmailTemplateProps =>
  typeof data?.verificationLink === 'string' &&
  (typeof data?.preview === 'string' || !data?.preview)

/**
 * VerifyEmailTemplate component built with @react-email/components
 */
export const VerifyEmailTemplate = ({
  verificationLink,
  name,
  preview = 'Verify your email address to activate your SYA Store account',
}: VerifyEmailTemplateProps) => {
  return (
    <Base preview={preview}>
      <Section className="mt-[24px] text-center">
        <Heading className="text-[20px] font-bold text-[#111827] my-0">
          SYA STORE
        </Heading>
        <Text className="text-[12px] text-[#f59e0b] font-semibold uppercase tracking-wider mt-1">
          Account Email Verification
        </Text>
      </Section>

      <Section className="text-center mt-6">
        <Text className="text-[#1f2937] text-[15px] leading-[24px]">
          {name ? `Hello ${name},` : 'Hello,'}
        </Text>
        <Text className="text-[#4b5563] text-[14px] leading-[24px]">
          Thank you for creating an account with <strong>SYA Store</strong>. Please verify your email address to activate your account, prevent unauthorized registrations, and access member perks.
        </Text>

        <Section className="mt-6 mb-[28px]">
          <Button
            className="bg-[#f59e0b] rounded-md text-[#111827] text-[13px] font-bold no-underline px-6 py-3.5 shadow-sm"
            href={verificationLink}
          >
            Verify Email Address
          </Button>
        </Section>

        <Text className="text-[#6b7280] text-[13px] leading-[20px]">
          Button not working? Copy and paste this URL into your browser:
        </Text>
        <Text
          style={{
            maxWidth: '100%',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
          }}
          className="text-[12px] text-[#d97706]"
        >
          <Link href={verificationLink} className="text-[#d97706] underline">
            {verificationLink}
          </Link>
        </Text>
      </Section>

      <Hr className="border border-solid border-[#eaeaea] my-[24px] mx-0 w-full" />
      <Text className="text-[#9ca3af] text-[12px] leading-[20px]">
        If you did not create an account on SYA Store, please disregard this email. This verification link is valid for 24 hours.
      </Text>
    </Base>
  )
}

VerifyEmailTemplate.PreviewProps = {
  verificationLink: 'https://syastore.com/verify-account?token=sample_verification_token',
  name: 'Alex',
} as VerifyEmailTemplateProps

export default VerifyEmailTemplate
