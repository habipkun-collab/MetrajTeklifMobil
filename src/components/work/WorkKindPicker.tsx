import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { workKindsForDiscipline } from '../../catalog/workKindMeta'
import type { WorkKindMeta } from '../../catalog/workKindMeta'
import type { Discipline } from '../../types/domain'
import type { WorkKind } from '../../types/workItem'
import { colors, spacing } from '../../theme'

export default function WorkKindPicker({
  visible,
  discipline,
  onClose,
  onSelect,
}: {
  visible: boolean
  discipline: Discipline
  onClose: () => void
  onSelect: (kind: WorkKind, meta: WorkKindMeta) => void
}) {
  const kinds = workKindsForDiscipline(discipline)
  const byCategory = kinds.reduce<Record<string, WorkKindMeta[]>>((acc, m) => {
    const list = acc[m.category] ?? []
    list.push(m)
    acc[m.category] = list
    return acc
  }, {})

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>İş kalemi türü seçin</Text>
          <Text style={styles.sub}>
            Her tür için hangi ölçüleri gireceğiniz ve hangi malzemelerin hesaplanacağı farklıdır.
          </Text>
          <ScrollView style={styles.scroll}>
            {Object.entries(byCategory).map(([cat, items]) => (
              <View key={cat} style={styles.group}>
                <Text style={styles.cat}>{cat}</Text>
                {items.map((m) => (
                  <Pressable
                    key={m.kind}
                    style={styles.row}
                    onPress={() => {
                      onSelect(m.kind, m)
                      onClose()
                    }}
                  >
                    <Text style={styles.rowTitle}>{m.title}</Text>
                    <Text style={styles.rowHelp}>{m.shortHelp}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>İptal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    padding: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md, lineHeight: 18 },
  scroll: { maxHeight: 420 },
  group: { marginBottom: spacing.md },
  cat: { fontWeight: '700', color: colors.primary, marginBottom: 8 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.bg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontWeight: '700', color: colors.text },
  rowHelp: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  cancel: { marginTop: spacing.sm, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: colors.textSecondary, fontWeight: '600' },
})
