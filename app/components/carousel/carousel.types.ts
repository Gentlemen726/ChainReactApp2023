import { ImageSourcePropType, ImageStyle } from "react-native"
import { ButtonProps } from "../Button"
import { IconProps } from "../Icon"

interface StaticCarouselProps {
  body: string
  button?: ButtonData & ButtonProps
  link?: { link: string; text: string }
  data: ImageSourcePropType[]
  meta?: string
  preset: "static"
  subtitle: string
  isBodySelectable?: boolean
}

export interface ButtonData {
  link: string
  text: string
}

export interface SocialButtonData {
  icon: IconProps["icon"]
  url?: string
}

export interface DynamicCarouselItem {
  body?: string
  image: ImageSourcePropType
  imageStyle?: ImageStyle
  label?: string
  leftButton?: ButtonData
  meta?: string
  rightButton?: ButtonData
  socialButtons?: SocialButtonData[]
  subtitle?: string
}

interface DynamicCarouselProps {
  preset: "dynamic"
  data: DynamicCarouselItem[]
}

export interface Spacer {
  spacer: number
}

export type CarouselProps =
  | (StaticCarouselProps | DynamicCarouselProps) & {
      openLink?: () => void
      carouselCardVariant?: "default" | "speaker"
    }
