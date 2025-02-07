import { BaseConfigurationApiModel } from ".."
import { Configurations } from "../../enums"

export interface CurrencyApiModel extends BaseConfigurationApiModel {
  configurationType: Configurations.Currencies
  symbol: string
  country: string
}
