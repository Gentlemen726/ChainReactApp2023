import React from "react"
import { observer } from "mobx-react-lite"
import { View, TextStyle, ViewStyle, Dimensions } from "react-native"
import { ContentStyle, FlashList } from "@shopify/flash-list"
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated"
import { useIsFocused } from "@react-navigation/native"
import { Text } from "../../components"
import { TabScreenProps } from "../../navigators/TabNavigator"
import { colors, spacing } from "../../theme"
import { useHeader } from "../../hooks/useHeader"
import { ScheduleDayPicker } from "./ScheduleDayPicker"
import ScheduleCard, { ScheduleCardProps, Variants } from "./ScheduleCard"
import { useStores } from "../../models"
import { formatDate } from "../../utils/formatDate"
import { useAppNavigation, useAppState } from "../../hooks"
import { format } from "date-fns"

const { width } = Dimensions.get("window")

export const ScheduleScreen: React.FC<TabScreenProps<"Schedule">> = observer(
  function ScheduleScreen() {
    useHeader({ title: "Schedule" })

    const navigation = useAppNavigation()
    const { schedulesStore } = useStores()
    const { fetchData, setSelectedSchedule, selectedSchedule, schedules, getScheduleIndex } =
      schedulesStore
    const hScrollRef = React.useRef(null)
    const scheduleListRefs = React.useMemo(() => {
      return Object.fromEntries(
        schedules.map((s) => [s.date, React.createRef<FlashList<ScheduleCardProps>>()]),
      )
    }, [])

    const currentDate = format(new Date(), "yyyy-MM-dd")

    const scrollX = useSharedValue(0)
    const isFocused = useIsFocused()

    React.useLayoutEffect(() => {
      fetchData()
    }, [fetchData])

    const updateSchedule = React.useCallback(
      (index) => {
        setSelectedSchedule(schedules[index])
      },
      [schedules],
    )

    const onItemPress = React.useCallback(
      (itemIndex) => {
        const currentIndex = getScheduleIndex()
        if (currentIndex === itemIndex) {
          scheduleListRefs[schedules[currentIndex].date]?.current?.scrollToOffset({
            animated: true,
            offset: 0,
          })
        } else {
          hScrollRef?.current?.scrollToOffset({ offset: itemIndex * width })
        }
      },
      [hScrollRef, getScheduleIndex],
    )

    const navigateToCurrentDay = React.useCallback(() => {
      // Check if current date is in list of conference days
      // If it is, navigate to that schedule's day
      // If not, just skip and pick up where the user left off
      const conferenceDates = schedules.map((x) => x.date)
      const scheduleIndex = conferenceDates.findIndex((date) => date === currentDate)

      if (scheduleIndex > -1) {
        setTimeout(() => {
          onItemPress(scheduleIndex)
        }, 100)
      }

      // TODO: Scroll to the proper time of day talk in the FlashList
      // setTimeout(() => {
      //   scheduleListRefs[schedules[0].date]?.current?.scrollToIndex({ animated: true, index: 2 })
      // }, 100)
    }, [onItemPress, scheduleListRefs, schedules, currentDate])

    // When app comes from the background to the foreground, focus on the current day in the schedule
    useAppState({
      match: /background/,
      nextAppState: "active",
      callback: () => {
        setTimeout(() => {
          navigateToCurrentDay()
        }, 250)
      },
    })

    const scrollHandler = useAnimatedScrollHandler(
      {
        onScroll: (event) => {
          scrollX.value = event.contentOffset.x
        },
        onMomentumEnd: (event) => {
          const contentOffset = event.contentOffset

          // Divide the horizontal offset by the width of the view to see which page is visible
          const index = Math.floor(contentOffset.x / width)

          // ! isFocused check for iOS, see details here: https://github.com/software-mansion/react-native-screens/issues/1183
          if (isFocused) {
            runOnJS(updateSchedule)(index)
          }
        },
      },
      [isFocused],
    )

    if (!selectedSchedule) return null

    return (
      <>
        <View style={$root}>
          <Animated.FlatList
            ref={hScrollRef}
            data={schedules}
            keyExtractor={(item) => item.date}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={scrollHandler}
            bounces={false}
            scrollEventThrottle={16}
            renderItem={({ item: schedule }) => (
              <View style={[$container, { width }]}>
                <FlashList
                  ref={scheduleListRefs[schedule.date]}
                  ListHeaderComponent={
                    <View style={$headingContainer}>
                      <Text preset="heading" style={$heading}>
                        {formatDate(schedule.date, "EE, MMMM dd")}
                      </Text>
                      <Text style={$subheading}>{schedule.title}</Text>
                    </View>
                  }
                  data={schedule.events}
                  renderItem={({ item }: { item: ScheduleCardProps }) => {
                    const { time, eventTitle, heading, subheading } = item
                    const onPress =
                      item.variant !== "event"
                        ? () => navigation.navigate("TalkDetails")
                        : undefined
                    return (
                      <View style={$cardContainer}>
                        <ScheduleCard
                          variant={item.variant as Variants}
                          {...{ time, eventTitle, heading, subheading, onPress }}
                        />
                      </View>
                    )
                  }}
                  getItemType={(item) => {
                    // To achieve better performance, specify the type based on the item
                    return item.variant
                  }}
                  estimatedItemSize={225}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={$list}
                />
              </View>
            )}
          />
        </View>
        <ScheduleDayPicker {...{ scrollX, onItemPress }} />
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $container: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.large,
}

const $heading: TextStyle = {
  fontSize: 32,
  lineHeight: 45.2,
}

const $subheading: TextStyle = {
  color: colors.palette.primary500,
}

const $list: ContentStyle = {
  paddingTop: spacing.medium,
  paddingBottom: 48 + spacing.medium,
}

const $cardContainer: ViewStyle = {
  paddingBottom: spacing.large,
}

const $headingContainer: ViewStyle = {
  paddingBottom: spacing.large,
}
