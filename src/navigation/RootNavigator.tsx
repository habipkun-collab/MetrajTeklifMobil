import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../theme'
import type { RootStackParamList } from './types'
import ProjectListScreen from '../screens/ProjectListScreen'
import ProjectEditorScreen from '../screens/ProjectEditorScreen'
import SpaceEditorScreen from '../screens/SpaceEditorScreen'
import MetrajSummaryScreen from '../screens/MetrajSummaryScreen'
import CostEstimateScreen from '../screens/CostEstimateScreen'
import SummaryScreen from '../screens/SummaryScreen'
import ExportScreen from '../screens/ExportScreen'
import OrganizationProfileScreen from '../screens/OrganizationProfileScreen'
import NormSettingsScreen from '../screens/NormSettingsScreen'
import UploadPdfScreen from '../screens/UploadPdfScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="ProjectList"
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: 700 },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projeler' }} />
        <Stack.Screen
          name="OrganizationProfile"
          component={OrganizationProfileScreen}
          options={{ title: 'Firma profili' }}
        />
        <Stack.Screen
          name="NormSettings"
          component={NormSettingsScreen}
          options={{ title: 'Norm katsayıları' }}
        />
        <Stack.Screen
          name="ProjectEditor"
          component={ProjectEditorScreen}
          options={{ title: 'Proje' }}
        />
        <Stack.Screen name="SpaceEditor" component={SpaceEditorScreen} options={{ title: 'Metraj' }} />
        <Stack.Screen
          name="MetrajSummary"
          component={MetrajSummaryScreen}
          options={{ title: 'Metraj özeti' }}
        />
        <Stack.Screen
          name="CostEstimate"
          component={CostEstimateScreen}
          options={{ title: 'Yaklaşık maliyet' }}
        />
        <Stack.Screen name="UploadPdf" component={UploadPdfScreen} options={{ title: 'Proje Yükle' }} />
        <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Teklif' }} />
        <Stack.Screen name="Export" component={ExportScreen} options={{ title: 'Dışa aktar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
