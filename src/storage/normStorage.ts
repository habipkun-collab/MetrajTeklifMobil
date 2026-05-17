import AsyncStorage from '@react-native-async-storage/async-storage'
import { defaultNormProfile, mergeNormProfile, type NormProfile } from '../types/norms'

const STORAGE_KEY = 'metrajteklif.norms.v1'

export async function loadNormProfile(): Promise<NormProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw == null || raw === '') return defaultNormProfile()
    return mergeNormProfile(JSON.parse(raw) as Partial<NormProfile>)
  } catch {
    return defaultNormProfile()
  }
}

export async function saveNormProfile(profile: NormProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Sessiz
  }
}
