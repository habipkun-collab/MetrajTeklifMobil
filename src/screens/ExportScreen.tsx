import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useOrganization } from '../context/OrganizationContext'
import { useProjects } from '../context/ProjectContext'
import { shareProjectJson, shareQuoteExcel, shareQuotePdf } from '../export/shareQuote'
import { colors, spacing } from '../theme'
import type { ExportProps } from '../navigation/types'

type ExportKind = 'pdf' | 'excel' | 'json'

export default function ExportScreen({ route, navigation }: ExportProps) {
  const { projectId } = route.params
  const { getProject } = useProjects()
  const { profile } = useOrganization()
  const project = getProject(projectId)
  const [busy, setBusy] = useState<ExportKind | null>(null)

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Proje bulunamadı.</Text>
      </View>
    )
  }

  const run = async (kind: ExportKind) => {
    setBusy(kind)
    try {
      if (kind === 'pdf') await shareQuotePdf(project, profile)
      else if (kind === 'excel') await shareQuoteExcel(project, profile)
      else await shareProjectJson(project)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Dışa aktarım başarısız.'
      Alert.alert('Hata', msg)
    } finally {
      setBusy(null)
    }
  }

  const firmReady = Boolean(profile.companyName.trim())

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Dışa aktarım</Text>
      <Text style={styles.p}>
        PDF ve Excel çıktıları firma profilinizdeki bilgiler ve logo ile hazırlanır. JSON, proje
        verisinin tam yedeğidir.
      </Text>

      {!firmReady ? (
        <Pressable
          style={styles.hintCard}
          onPress={() => navigation.navigate('OrganizationProfile')}
        >
          <Text style={styles.hintTitle}>Firma profili eksik</Text>
          <Text style={styles.hintText}>
            Teklif çıktısında firma adı görünmesi için profilinizi doldurun →
          </Text>
        </Pressable>
      ) : null}

      <ExportButton
        label="PDF teklif"
        sub="Logo ve firma bilgileri ile yazdırılabilir belge"
        loading={busy === 'pdf'}
        disabled={busy != null}
        onPress={() => void run('pdf')}
        primary
      />
      <ExportButton
        label="Excel (CSV)"
        sub="Excel’de açılabilir; noktalı virgül ayırıcı, Türkçe karakter destekli"
        loading={busy === 'excel'}
        disabled={busy != null}
        onPress={() => void run('excel')}
      />
      <ExportButton
        label="JSON yedek"
        sub="Tüm proje, metraj ve maliyet verisi"
        loading={busy === 'json'}
        disabled={busy != null}
        onPress={() => void run('json')}
      />

      <Pressable
        style={styles.link}
        onPress={() => navigation.navigate('OrganizationProfile')}
      >
        <Text style={styles.linkText}>Firma profilini düzenle</Text>
      </Pressable>
    </ScrollView>
  )
}

function ExportButton({
  label,
  sub,
  loading,
  disabled,
  onPress,
  primary,
}: {
  label: string
  sub: string
  loading: boolean
  disabled: boolean
  onPress: () => void
  primary?: boolean
}) {
  return (
    <Pressable
      style={[styles.btn, primary && styles.btnPrimary, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={primary ? '#fff' : colors.primary} />
      ) : (
        <>
          <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
          <Text style={[styles.btnSub, primary && styles.btnSubPrimary]}>{sub}</Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  p: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  hintCard: {
    backgroundColor: '#fff8e6',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e8d48a',
    marginBottom: spacing.md,
  },
  hintTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  hintText: { color: colors.textSecondary },
  btn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    minHeight: 72,
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnDisabled: { opacity: 0.65 },
  btnText: { fontWeight: '800', fontSize: 16, color: colors.text },
  btnTextPrimary: { color: '#fff' },
  btnSub: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
  btnSubPrimary: { color: 'rgba(255,255,255,0.85)' },
  link: { marginTop: spacing.md, alignItems: 'center', paddingVertical: 10 },
  linkText: { color: colors.primary, fontWeight: '700' },
})
