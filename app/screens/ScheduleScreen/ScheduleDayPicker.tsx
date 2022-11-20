import { ReactNativeFirebase } from "@react-native-firebase/app"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { Dimensions, Pressable, TextStyle, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, SharedValue, interpolate } from "react-native-reanimated"
import { Text } from "../../components"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { formatDate } from "../../utils/formatDate"

type Props = {
  scrollX: SharedValue<number>
  onItemPress: (itemIndex) => void
}

const { width } = Dimensions.get("window")

export const ScheduleDayPicker: FC<Props> = observer(function ScheduleDayPicker({
  scrollX,
  onItemPress,
}) {
  const { schedulesStore } = useStores()
  const { setSelectedSchedule, schedules, selectedSchedule } = schedulesStore
  const wrapperWidth = width - spacing.extraSmall * 2
  const widthSize = wrapperWidth / schedules.length

  const containerRef = React.useRef()
  const [measures, setMeasures] = React.useState([{ x: 0 }, { x: 0 }, { x: 0 }])
  const itemRefs = schedules.map((item) => React.createRef<View>())

  React.useEffect(() => {
    const m = []
    schedules.map((item, index) => {
      itemRefs[index].current.measureLayout(
        containerRef.current,
        (x, y, width, height) => {
          m.push({ x, y, width, height })

          if (m.length === schedules.length) {
            setMeasures(m)
          }
        },
        () => {},
      )
    })
  }, [])

  const inputRange = schedules.map((_, index) => index * width)

  const $animatedLeftStyle = useAnimatedStyle(() => {
    const left = interpolate(
      scrollX.value,
      inputRange,
      measures.map((measure) => measure.x - spacing.micro),
    )

    return {
      left,
      width: widthSize,
    }
  }, [inputRange, scrollX, measures])

  return (
    <View ref={containerRef} style={$wrapperStyle}>
      {measures.length > 0 && <Animated.View style={[$animatedViewStyle, $animatedLeftStyle]} />}
      {schedules.map((schedule, index) => (
        <Pressable
          key={schedule.date}
          ref={itemRefs[index]}
          onPress={() => {
            // onItemPress(index)
            // leftValue.value = widthSize * index
            // setTimeout(() => setSelectedSchedule(schedule), 250)
            setSelectedSchedule(schedule)
          }}
          style={$buttonStyle}
        >
          <Text
            preset="companionHeading"
            style={[$textStyle, selectedSchedule.date === schedule.date && $textSelectedStyle]}
          >
            {formatDate(schedule.date, "EE")}
          </Text>
        </Pressable>
      ))}
    </View>
  )
})

const $animatedViewStyle: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 100,
  height: "100%",
  position: "absolute",
}

const $buttonBaseStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral500,
  borderColor: colors.palette.primary500,
  borderRadius: 100,
  minHeight: 48,
}

const $textStyle: TextStyle = {
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 22.4,
}

const $textSelectedStyle: TextStyle = {
  color: colors.palette.neutral900,
}

const $wrapperStyle: ViewStyle[] = [
  $buttonBaseStyle,
  {
    borderWidth: 1,
    flexDirection: "row",
    position: "absolute",
    bottom: spacing.extraSmall,
    left: 0,
    marginHorizontal: spacing.extraSmall,
    right: 0,
  },
]

const $buttonStyle: ViewStyle[] = [
  $buttonBaseStyle,
  {
    alignItems: "center",
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
  },
]
