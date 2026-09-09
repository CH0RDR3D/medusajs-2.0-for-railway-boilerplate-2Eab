import { ModuleProviderExports } from '@medusajs/framework/types'
import { TwilioNotificationService } from './services/twilio'

const services = [TwilioNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
