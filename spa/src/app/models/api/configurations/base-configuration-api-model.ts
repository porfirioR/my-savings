import { Configurations } from "../../enums"

export interface BaseConfigurationApiModel {
  configurationType: Configurations
  id: number
  name: string
}