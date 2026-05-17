import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PriceCatalog } from '../types/priceCatalog'

const STORAGE_KEY = 'metrajteklif.priceCatalog.v1'

export async function loadPriceCatalog(): Promise<PriceCatalog | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw == null || raw === '') return null
    const data = JSON.parse(raw) as unknown
    if (data == null || typeof data !== 'object' || Array.isArray(data)) return null
    return data as PriceCatalog
  } catch {
    return null
  }
}

export async function savePriceCatalog(catalog: PriceCatalog): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
  } catch {
    // Sessiz
  }
}
