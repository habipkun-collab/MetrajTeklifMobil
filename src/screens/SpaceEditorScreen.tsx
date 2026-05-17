import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import WorkItemEditor from '../components/work/WorkItemEditor'
import WorkKindPicker from '../components/work/WorkKindPicker'
import { getWorkKindMeta } from '../catalog/workKindMeta'
import { defaultWorkItem } from '../engine/workCompute'
import { useNorms } from '../context/NormContext'
import { useProjects } from '../context/ProjectContext'
import { colors, spacing } from '../theme'
import type { SpaceEditorProps } from '../navigation/types'
import type { WorkItem, WorkItemInput } from '../types/workItem'
import type { WorkKind } from '../types/workItem'

function workItemToInput(wi: WorkItem): WorkItemInput {
  const { computed: _c, id: _id, ...rest } = wi
  if (wi.kind === 'tile') {
    const { tileComputed: _t, ...tileRest } = rest as Extract<WorkItem, { kind: 'tile' }>
    return tileRest as WorkItemInput
  }
  return rest as WorkItemInput
}

export default function SpaceEditorScreen({ route }: SpaceEditorProps) {
  const { projectId, spaceId } = route.params
  const { profile: norms } = useNorms()
  const { getProject, addWorkItem, updateWorkItem, removeWorkItem, updateSpace } = useProjects()
  const project = getProject(projectId)
  const space = project?.spaces.find((s) => s.id === spaceId)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<WorkItemInput | null>(null)
  const [spaceNameDraft, setSpaceNameDraft] = useState('')

  const resetEditor = useCallback(() => {
    setEditingId(null)
    setDraft(null)
  }, [])

  useLayoutEffect(() => {
    if (space) setSpaceNameDraft(space.name)
  }, [spaceId, space?.name])

  useEffect(() => {
    resetEditor()
  }, [projectId, spaceId, resetEditor])

  const beginEdit = (wi: WorkItem) => {
    setEditingId(wi.id)
    setDraft(workItemToInput(wi))
  }

  const startNew = (kind: WorkKind) => {
    setEditingId(null)
    setDraft(defaultWorkItem(kind, norms))
    setPickerOpen(false)
  }

  const submit = () => {
    if (!project || !space || !draft) return
    if (editingId) {
      updateWorkItem(projectId, spaceId, editingId, draft)
    } else {
      addWorkItem(projectId, spaceId, draft)
    }
    resetEditor()
  }

  const items = useMemo(() => space?.workItems ?? [], [space])
  const draftMeta = draft ? getWorkKindMeta(draft.kind) : null

  if (!project || !space) {
    return (
      <View style={styles.center}>
        <Text>Alan bulunamadı.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{spaceNameDraft.trim() || space.name}</Text>

      <Text style={styles.label}>Alan adı</Text>
      <TextInput
        style={styles.input}
        value={spaceNameDraft}
        onChangeText={setSpaceNameDraft}
        onBlur={() => {
          if (!spaceNameDraft.trim()) {
            setSpaceNameDraft(space.name)
            return
          }
          updateSpace(projectId, spaceId, spaceNameDraft)
        }}
        placeholder="Örn. Zemin kat duvarlar, Temel kazısı"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.lead}>
        Her iş kalemi için ölçü girin; uygulama tuğla, beton, donatı, kazı hacmi gibi malzemeleri
        normatif yaklaşık miktarlara çevirir. Birim fiyatlar yaklaşık maliyet adımında girilir.
      </Text>

      {items.map((wi) => (
        <View
          key={wi.id}
          style={[styles.lineCard, editingId === wi.id && styles.lineCardActive]}
        >
          <Text style={styles.lineTitle}>{getWorkKindMeta(wi.kind).title}</Text>
          <Text style={styles.lineSub}>{wi.label}</Text>
          {wi.computed ? (
            <>
              <Text style={styles.lineResult}>{wi.computed.summary}</Text>
              {wi.computed.materials
                .filter(
                  (m) =>
                    m.key !== 'wall_area' &&
                    m.key !== 'area' &&
                    m.key !== 'roof_area' &&
                    m.key !== 'facade_area'
                )
                .slice(0, 4)
                .map((m) => (
                  <Text key={m.key} style={styles.matRow}>
                    {m.label}: <Text style={styles.matVal}>{m.quantity} {m.unit}</Text>
                  </Text>
                ))}
              {wi.computed.materials.length > 4 ? (
                <Text style={styles.more}>+{wi.computed.materials.length - 4} kalem daha</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.lineWarn}>Hesap üretilemedi; ölçüleri kontrol edin.</Text>
          )}
          <View style={styles.lineActions}>
            <Pressable onPress={() => beginEdit(wi)} hitSlop={8}>
              <Text style={styles.edit}>Düzenle</Text>
            </Pressable>
            <Pressable onPress={() => removeWorkItem(projectId, spaceId, wi.id)} hitSlop={8}>
              <Text style={styles.remove}>Sil</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {!draft ? (
        <Pressable style={styles.addKindBtn} onPress={() => setPickerOpen(true)}>
          <Text style={styles.addKindBtnText}>+ İş kalemi ekle</Text>
        </Pressable>
      ) : null}

      {draft && draftMeta ? (
        <>
          <Text style={styles.section}>{editingId ? 'Kalemi düzenle' : 'Yeni iş kalemi'}</Text>
          <View style={styles.kindBadgeWrap}>
            <Text style={styles.kindBadge}>{draftMeta.title}</Text>
          </View>
          <WorkItemEditor draft={draft} meta={draftMeta} onChange={setDraft} />
          <Pressable style={styles.addBtn} onPress={submit}>
            <Text style={styles.addBtnText}>{editingId ? 'Kaydet' : 'Kalem ekle'}</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={resetEditor}>
            <Text style={styles.ghostBtnText}>İptal</Text>
          </Pressable>
        </>
      ) : null}

      <WorkKindPicker
        visible={pickerOpen}
        discipline={project.discipline}
        onClose={() => setPickerOpen(false)}
        onSelect={(kind) => startNew(kind)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  lead: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md, fontSize: 13 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  section: { fontSize: 17, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  kindBadgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  kindBadge: { color: '#fff', fontWeight: '700' },
  addKindBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addKindBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ghostBtn: { marginTop: spacing.sm, paddingVertical: 12, alignItems: 'center' },
  ghostBtnText: { color: colors.textSecondary, fontWeight: '600' },
  lineCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  lineCardActive: { borderColor: colors.primary, borderWidth: 2 },
  lineTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  lineSub: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 2 },
  lineResult: { marginTop: 8, color: colors.primary, fontWeight: '600' },
  matRow: { marginTop: 4, color: colors.text, fontSize: 13 },
  matVal: { fontWeight: '700' },
  more: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  lineWarn: { marginTop: 8, color: colors.danger, fontWeight: '600', fontSize: 13 },
  lineActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  edit: { color: colors.primary, fontWeight: '700' },
  remove: { color: colors.danger, fontWeight: '600' },
})
