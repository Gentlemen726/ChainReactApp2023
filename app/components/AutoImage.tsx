import React, { useLayoutEffect, useState } from "react"
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  Platform,
} from "react-native"

/**
 * Get the dimensions of an image, scaled to fit the specified width
 * while maintaining the image's original ratio.
 *
 * @param image ImageSourcePropType—can be a remote image or a local image
 * @param width number—width of the space you want image to fill
 * @returns { height: number, width: number } as ImageStyle
 */
export const getImageDimensionsForWidth = (image: ImageSourcePropType, width: number) => {
  const { height: rawImageHeight, width: rawImageWidth } = Image.resolveAssetSource(image)
  const imageRatio = width / rawImageWidth
  return {
    height: rawImageHeight * imageRatio,
    width,
  } as ImageStyle
}

// TODO: document new props
export interface AutoImageProps extends ImageProps {
  /**
   * How wide should the image be?
   */
  maxWidth?: number
  /**
   * How tall should the image be?
   */
  maxHeight?: number
}

/**
 * A hook that will return the scaled dimensions of an image based on the
 * provided dimesions' aspect ratio. If no desired dimensions are provided,
 * it will return the original dimensions of the remote image.
 *
 * How is this different from `resizeMode: 'contain'`? Firstly, you can
 * specify only one side's size (not both). Secondly, the image will scale to fit
 * the desired dimensions instead of just being contained within its image-container.
 *
 */
export function useAutoImage(
  remoteUri: string,
  dimensions?: [maxWidth?: number, maxHeight?: number],
): [width: number, height: number] {
  const [[remoteWidth, remoteHeight], setRemoteImageDimensions] = useState([0, 0])
  const remoteAspectRatio = remoteWidth / remoteHeight
  const [maxWidth, maxHeight] = dimensions ?? []

  useLayoutEffect(() => {
    if (!remoteUri) return

    Image.getSize(remoteUri, (w, h) => setRemoteImageDimensions([w, h]))
  }, [remoteUri])

  if (Number.isNaN(remoteAspectRatio)) return [0, 0]

  if (maxWidth && maxHeight) {
    const aspectRatio = Math.min(maxWidth / remoteWidth, maxHeight / remoteHeight)
    return [remoteWidth * aspectRatio, remoteHeight * aspectRatio]
  } else if (maxWidth) {
    return [maxWidth, maxWidth / remoteAspectRatio]
  } else if (maxHeight) {
    return [maxHeight * remoteAspectRatio, maxHeight]
  } else {
    return [remoteWidth, remoteHeight]
  }
}

/**
 * An Image component that automatically sizes a remote or data-uri image.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md)
 */
export function AutoImage(props: AutoImageProps) {
  const { maxWidth, maxHeight, ...ImageProps } = props
  const source = props.source as ImageURISource

  const [width, height] = useAutoImage(
    Platform.select({
      web: (source?.uri as string) ?? (source as string),
      default: source?.uri as string,
    }),
    [maxWidth, maxHeight],
  )

  return <Image {...ImageProps} style={[{ width, height }, props.style]} />
}
