import AsyncStorage from '@react-native-async-storage/async-storage'
import { emptyOrganizationProfile, type OrganizationProfile } from '../types/organization'

const STORAGE_KEY = 'metrajteklif.organization.v1'

export async function loadOrganization(): Promise<OrganizationProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw == null || raw === '') return emptyOrganizationProfile()
    return { ...emptyOrganizationProfile(), ...(JSON.parse(raw) as OrganizationProfile) }
  } catch {
    return emptyOrganizationProfile()
  }
}

export async function saveOrganization(profile: OrganizationProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Sessiz
  }
}
