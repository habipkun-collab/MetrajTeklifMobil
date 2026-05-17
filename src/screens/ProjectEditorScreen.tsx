import { useLayoutEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { DISCIPLINE_LABELS } from '../constants/disciplines'
import { useProjects } from '../context/ProjectContext'
import { colors, spacing } from '../theme'
import type { ProjectEditorProps } from '../navigation/types'

export default function ProjectEditorScreen({ navigation, route }: ProjectEditorProps) {
  const { projectId } = route.params
  const { getProject, updateProject, addSpace, removeSpace } = useProjects()
  const project = getProject(projectId)
  const [spaceName, setSpaceName] = useState('')
  const [vatDraft, setVatDraft] = useState<string | null>(null)

  useLayoutEffect(() => {
    const p = getProject(projectId)
    if (p) setVatDraft(String(p.vatRatePct))
    // Yalnızca proje değişince senkron; getProject her render’da yeni referans olabilir
  }, [projectId])

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Proje bulunamadı.</Text>
      </View>
    )
  }

  const kdvDisplay = vatDraft ?? String(project.vatRatePct)

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Proje adı</Text>
      <TextInput
        style={styles.input}
        value={project.name}
        onChangeText={(t) => updateProject(projectId, { name: t })}
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Branş</Text>
      <View style={styles.disciplinePill}>
        <Text style={styles.disciplinePillText}>{DISCIPLINE_LABELS[project.discipline]}</Text>
      </View>

      <Text style={styles.label}>Müşteri (opsiyonel)</Text>
      <TextInput
        style={styles.input}
        value={project.clientName ?? ''}
        onChangeText={(t) => updateProject(projectId, { clientName: t })}
        placeholder="Müşteri adı"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>KDV oranı (%)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={kdvDisplay}
        onChangeText={setVatDraft}
        onBlur={() => {
          const raw = (vatDraft ?? '').trim().replace(',', '.')
          if (raw === '') {
            setVatDraft(String(project.vatRatePct))
            return
          }
          const n = parseFloat(raw)
          if (!Number.isNaN(n)) {
            updateProject(projectId, { vatRatePct: n })
            setVatDraft(String(n))
          } else {
            setVatDraft(String(project.vatRatePct))
          }
        }}
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={styles.fieldHint}>Boş bırakırsanız kayıtlı oran geri yüklenir.</Text>

      <Text style={styles.section}>Alanlar</Text>
      {project.spaces.map((s) => (
        <View key={s.id} style={styles.spaceRow}>
          <Pressable
            style={styles.spaceRowMain}
            onPress={() => navigation.navigate('SpaceEditor', { projectId, spaceId: s.id })}
          >
            <Text style={styles.spaceName}>{s.name}</Text>
            <Text style={styles.spaceMeta}>{s.workItems.length} iş kalemi ›</Text>
          </Pressable>
          {project.spaces.length > 1 ? (
            <Pressable
              hitSlop={10}
              onPress={() => removeSpace(projectId, s.id)}
              style={styles.spaceDeleteWrap}
            >
              <Text style={styles.spaceDelete}>Sil</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      <Text style={styles.label}>Yeni alan adı</Text>
      <TextInput
        style={styles.input}
        value={spaceName}
        onChangeText={setSpaceName}
        placeholder="Örn. Banyo"
        placeholderTextColor={colors.textSecondary}
      />
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => {
          if (!spaceName.trim()) return
          addSpace(projectId, spaceName.trim())
          setSpaceName('')
        }}
      >
        <Text style={styles.secondaryBtnText}>Alan ekle</Text>
      </Pressable>

      <Text style={styles.flowSection}>Akış</Text>
      <Pressable
        style={styles.flowBtn}
        onPress={() => navigation.navigate('MetrajSummary', { projectId })}
      >
        <Text style={styles.flowBtnTitle}>1. Metraj özeti</Text>
        <Text style={styles.flowBtnSub}>Duvar, kazı, beton, kaplama miktarları — fiyat yok</Text>
      </Pressable>
      <Pressable
        style={styles.flowBtn}
        onPress={() => navigation.navigate('CostEstimate', { projectId })}
      >
        <Text style={styles.flowBtnTitle}>2. Yaklaşık maliyet</Text>
        <Text style={styles.flowBtnSub}>Birim fiyatlar, işçilik %, elle malzeme</Text>
      </Pressable>
      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Summary', { projectId })}
      >
        <Text style={styles.primaryBtnText}>3. Teklif özeti</Text>
      </Pressable>
      <Pressable
        style={styles.outlineBtn}
        onPress={() => navigation.navigate('Export', { projectId })}
      >
        <Text style={styles.outlineBtnText}>Dışa aktar (PDF / Excel)</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  fieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  disciplinePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  disciplinePillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.sm },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  spaceRowMain: {
    flex: 1,
    padding: spacing.md,
  },
  spaceDeleteWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  spaceDelete: { color: colors.danger, fontWeight: '600' },
  spaceName: { fontSize: 16, fontWeight: '600', color: colors.text },
  spaceMeta: { color: colors.textSecondary },
  secondaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: spacing.lg,
  },
  secondaryBtnText: { color: '#fff', fontWeight: '600' },
  flowSection: { fontSize: 18, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  flowBtn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  flowBtnTitle: { fontWeight: '700', color: colors.text, fontSize: 16 },
  flowBtnSub: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: { color: colors.primary, fontWeight: '700' },
})
