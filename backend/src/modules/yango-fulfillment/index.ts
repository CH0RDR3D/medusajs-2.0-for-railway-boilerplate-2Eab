import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { YangoEngineService } from "./services/yango-engine"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [YangoEngineService],
})
