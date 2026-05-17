import { useEffect } from 'react'
import { Platform, StatusBar, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NormProvider } from './src/context/NormContext'
import { OrganizationProvider } from './src/context/OrganizationContext'
import { PriceCatalogProvider } from './src/context/PriceCatalogContext'
import { ProjectProvider } from './src/context/ProjectContext'
import RootNavigator from './src/navigation/RootNavigator'

/** Web’de tarayıcı çevirisinin arayüzü bozmasını azaltır (HTML translate + lang). */
function WebDocumentLangTr() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return
    const html = document.documentElement
    const prevLang = html.getAttribute('lang')
    html.setAttribute('lang', 'tr')
    return () => {
      if (prevLang != null) html.setAttribute('lang', prevLang)
      else html.removeAttribute('lang')
    }
  }, [])
  return null
}

export default function App() {
  return (
    <SafeAreaProvider>
      <WebDocumentLangTr />
      <View style={{ flex: 1 }}>
        <OrganizationProvider>
          <NormProvider>
            <PriceCatalogProvider>
              <ProjectProvider>
              <RootNavigator />
              <StatusBar barStyle="dark-content" />
              </ProjectProvider>
            </PriceCatalogProvider>
          </NormProvider>
        </OrganizationProvider>
      </View>
    </SafeAreaProvider>
  )
}
