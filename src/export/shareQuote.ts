import * as FileSystem from 'expo-file-system/legacy'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Platform, Share } from 'react-native'
import { buildQuoteCsv, buildQuoteHtml } from './quoteDocument'
import type { OrganizationProfile } from '../types/organization'
import type { Project } from '../types/domain'

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^\w\u00C0-\u024F\s-]/gi, '').trim()
  return cleaned.slice(0, 48) || 'teklif'
}

async function shareUri(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Share.share({ url: uri, title: dialogTitle })
    return
  }
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Paylaşım bu cihazda kullanılamıyor.')
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle })
}

async function writeTempFile(fileName: string, contents: string): Promise<string> {
  const base = FileSystem.cacheDirectory
  if (!base) throw new Error('Geçici dosya dizini bulunamadı.')
  const path = base + fileName
  await FileSystem.writeAsStringAsync(path, contents, { encoding: FileSystem.EncodingType.UTF8 })
  return path
}

export async function shareQuotePdf(project: Project, org: OrganizationProfile): Promise<void> {
  const html = buildQuoteHtml(project, org)
  const { uri } = await Print.printToFileAsync({ html })
  await shareUri(uri, 'application/pdf', 'Teklif PDF')
}

export async function shareQuoteExcel(project: Project, org: OrganizationProfile): Promise<void> {
  const csv = buildQuoteCsv(project, org)
  const fileName = sanitizeFileName(project.name) + '_teklif.csv'

  if (Platform.OS === 'web') {
    await Share.share({ message: csv, title: fileName })
    return
  }

  const path = await writeTempFile(fileName, csv)
  await shareUri(path, 'text/csv', 'Teklif Excel (CSV)')
}

export async function shareProjectJson(project: Project): Promise<void> {
  const payload = JSON.stringify(project, null, 2)
  const fileName = sanitizeFileName(project.name) + '_proje.json'

  if (Platform.OS === 'web') {
    await Share.share({ message: payload, title: fileName })
    return
  }

  const path = await writeTempFile(fileName, payload)
  await shareUri(path, 'application/json', 'Proje JSON')
}
