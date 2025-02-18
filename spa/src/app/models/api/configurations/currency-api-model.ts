import { BaseConfigurationApiModel } from ".."
import { Configurations } from "../../enums"

export interface CurrencyApiModel extends BaseConfigurationApiModel {
  symbol: string
  country: string
}
