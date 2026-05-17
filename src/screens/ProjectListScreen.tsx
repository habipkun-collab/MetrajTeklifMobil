import { useLayoutEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useProjects } from '../context/ProjectContext'
import { DISCIPLINE_LABELS } from '../constants/disciplines'
import type { Discipline } from '../types/domain'
import { colors, spacing } from '../theme'
import type { ProjectListProps } from '../navigation/types'

const disciplineOptions = (Object.keys(DISCIPLINE_LABELS) as Discipline[]).map((key) => ({
  key,
  label: DISCIPLINE_LABELS[key],
}))

export default function ProjectListScreen({ navigation }: ProjectListProps) {
  const { projects, createProject, deleteProject } = useProjects()
  const [modal, setModal] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.navigate('NormSettings')}
            hitSlop={12}
            style={{ paddingHorizontal: 6 }}
          >
            <Text style={styles.headerLink}>Normlar</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('OrganizationProfile')}
            hitSlop={12}
            style={{ paddingHorizontal: 6 }}
          >
            <Text style={styles.headerLink}>Firma</Text>
          </Pressable>
        </View>
      ),
    })
  }, [navigation])
  const [name, setName] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('interior')

  const openCreate = () => {
    setName('')
    setDiscipline('interior')
    setModal(true)
  }

  const confirmCreate = () => {
    const id = createProject(name || 'Yeni proje', discipline)
    setModal(false)
    navigation.navigate('ProjectEditor', { projectId: id })
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Metraj + Teklif</Text>
      <Text style={styles.sub}>Projeler — deterministik motor, AI sunucuda (plan)</Text>

      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz proje yok. Aşağıdan oluşturun.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={styles.cardMain}
              onPress={() => navigation.navigate('ProjectEditor', { projectId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {DISCIPLINE_LABELS[item.discipline]} · {item.spaces.length}{' '}
                alan
              </Text>
            </Pressable>
            <Pressable onPress={() => deleteProject(item.id)} hitSlop={12} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Sil</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+ Yeni proje</Text>
      </Pressable>

      <Modal visible={modal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Yeni proje</Text>
            <TextInput
              placeholder="Proje adı"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.fieldLabel}>Branş şablonu</Text>
            <View style={styles.row}>
              {disciplineOptions.map((d) => (
                <Pressable
                  key={d.key}
                  onPress={() => setDiscipline(d.key)}
                  style={[styles.chip, discipline === d.key && styles.chipOn]}
                >
                  <Text style={[styles.chipText, discipline === d.key && styles.chipTextOn]}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(false)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>İptal</Text>
              </Pressable>
              <Pressable onPress={confirmCreate} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Oluştur</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.lg },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
  sub: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMain: { flex: 1, paddingVertical: spacing.xs },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  cardMeta: { color: colors.textSecondary, marginTop: 4 },
  deleteBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  deleteText: { color: colors.danger, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  fieldLabel: { fontWeight: '600', marginBottom: spacing.xs, color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnGhost: { paddingVertical: 10, paddingHorizontal: 14 },
  btnGhostText: { color: colors.textSecondary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerLink: { color: colors.primary, fontWeight: '700', fontSize: 14 },
})
