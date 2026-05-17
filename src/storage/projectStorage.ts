import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Project } from '../types/domain'
import { normalizeProject } from '../types/domain'

const STORAGE_KEY = 'metrajteklif.projects.v1'

export async function loadProjects(): Promise<Project[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw == null || raw === '') return null
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return null
    return (data as Project[]).map(normalizeProject)
  } catch {
    return null
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // Sessiz: disk dolu veya izin; uygulama bellek içi çalışmaya devam eder
  }
}
