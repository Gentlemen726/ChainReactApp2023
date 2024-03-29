import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { translate } from "../../i18n"
import { useAppNavigation, useHeader } from "../../hooks"
import { colors, spacing } from "../../theme"
import { openLinkInBrowser } from "../../utils/openLinkInBrowser"

const phoneNumber = "360-450-4752"
const emailAddress = "conf@infinite.red"

export const ContactUsScreen = () => {
  const callPhoneNumber = () => openLinkInBrowser(`tel:${phoneNumber}`)
  const contactByEmail = () => openLinkInBrowser(`mailto:${emailAddress}`)

  const navigation = useAppNavigation()

  useHeader({
    title: translate("infoScreen.contactUsTitle"),
    leftIcon: "back",
    onLeftPress: () => navigation.goBack(),
  })

  return (
    <Screen style={$root} preset="scroll" ScrollViewProps={{ showsVerticalScrollIndicator: false }}>
      <View style={$content}>
        <Text preset="screenHeading" tx="infoScreen.haveQuestions" style={$mb} />
        <Text style={$mb}>
          {translate("infoScreen.reachOut")}
          <Text style={$linkText} onPress={contactByEmail} text={emailAddress} selectable />
        </Text>

        <Text preset="screenHeading" tx="infoScreen.reportingIncidentTitle" style={$mb} />
        <Text>
          {translate("infoScreen.reportingIncidentPart1")}
          <Text style={$linkText} onPress={callPhoneNumber} text={phoneNumber} selectable />
          {translate("infoScreen.reportingIncidentPart2")}
        </Text>
      </View>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  paddingHorizontal: spacing.large,
}

const $mb: TextStyle = {
  marginBottom: spacing.medium,
}

const $linkText: TextStyle = {
  textDecorationLine: "underline",
  textDecorationColor: colors.text,
}
