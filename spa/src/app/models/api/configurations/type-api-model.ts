import { BaseConfigurationApiModel } from ".."
import { Configurations } from "../../enums"

export interface TypeApiModel extends BaseConfigurationApiModel {
  configurationType: Configurations.Currencies
  description: string
}
