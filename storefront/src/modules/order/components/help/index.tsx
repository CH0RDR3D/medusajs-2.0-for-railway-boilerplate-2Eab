import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { HelpCircle, Mail, RotateCcw, ShieldCheck } from "lucide-react"

const Help = () => {
  return (
    <div className="mt-8 pt-6 border-t border-[var(--surface-border)]">
      <Heading level="h3" className="text-base-semi text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-amber-500" />
        <span>Need help with your order?</span>
      </Heading>
      <div className="text-sm text-[var(--text-secondary)]">
        <ul className="gap-y-2.5 flex flex-col">
          <li>
            <LocalizedClientLink
              href="/contact"
              className="inline-flex items-center gap-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Customer Support</span>
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href="/returns"
              className="inline-flex items-center gap-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Returns & Exchanges Policy</span>
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href="/customer-care"
              className="inline-flex items-center gap-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FAQs & Delivery Tracking</span>
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
