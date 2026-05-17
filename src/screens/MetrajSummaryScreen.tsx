import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { getWorkKindMeta } from '../catalog/workKindMeta'
import { useProjects } from '../context/ProjectContext'
import { colors, spacing } from '../theme'
import type { MetrajSummaryProps } from '../navigation/types'

export default function MetrajSummaryScreen({ route, navigation }: MetrajSummaryProps) {
  const { projectId } = route.params
  const { getProject } = useProjects()
  const project = getProject(projectId)

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Proje bulunamadı.</Text>
      </View>
    )
  }

  let itemCount = 0
  let materialLines = 0

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Tüm iş kalemlerinden üretilen malzeme miktarları. Duvar örme, kazı, betonarme, kaplama vb.
        için normatif yaklaşık değerlerdir; kesin keşif yerine teklif hazırlığı içindir.
      </Text>

      {project.spaces.map((space) => (
        <View key={space.id} style={styles.spaceBlock}>
          <Text style={styles.spaceTitle}>{space.name}</Text>
          {space.workItems.length === 0 ? (
            <Text style={styles.muted}>İş kalemi yok.</Text>
          ) : (
            space.workItems.map((wi) => {
              itemCount++
              const mats = wi.computed?.materials.filter(
                (m) =>
                  m.key !== 'wall_area' &&
                  m.key !== 'area' &&
                  m.key !== 'roof_area' &&
                  m.key !== 'facade_area'
              )
              materialLines += mats?.length ?? 0
              return (
                <View key={wi.id} style={styles.card}>
                  <Text style={styles.kind}>{getWorkKindMeta(wi.kind).title}</Text>
                  <Text style={styles.cardTitle}>{wi.label}</Text>
                  {wi.computed ? (
                    <>
                      <Text style={styles.summary}>{wi.computed.summary}</Text>
                      {mats?.map((m) => (
                        <Text key={m.key} style={styles.qtyRow}>
                          {m.label}: <Text style={styles.qtyVal}>{m.quantity} {m.unit}</Text>
                        </Text>
                      ))}
                      {wi.computed.notes[0] ? (
                        <Text style={styles.note}>{wi.computed.notes[0]}</Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.warn}>Hesap üretilemedi.</Text>
                  )}
                </View>
              )
            })
          )}
        </View>
      ))}

      {itemCount > 0 ? (
        <View style={styles.totals}>
          <Text style={styles.totalsTitle}>Özet</Text>
          <Text style={styles.totalsRow}>{itemCount} iş kalemi</Text>
          <Text style={styles.totalsRow}>{materialLines} malzeme satırı (metraj)</Text>
        </View>
      ) : null}

      <Pressable
        style={styles.navBtn}
        onPress={() => navigation.navigate('CostEstimate', { projectId })}
      >
        <Text style={styles.navBtnText}>Yaklaşık maliyet →</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lead: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  spaceBlock: { marginBottom: spacing.lg },
  spaceTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  muted: { color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  kind: { fontSize: 12, fontWeight: '700', color: colors.primary },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 2 },
  summary: { marginTop: 6, fontWeight: '600', color: colors.text },
  qtyRow: { marginTop: 6, color: colors.text, fontSize: 14 },
  qtyVal: { fontWeight: '800', color: colors.primary },
  note: { marginTop: 8, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  warn: { marginTop: 8, color: colors.danger, fontWeight: '600' },
  totals: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  totalsTitle: { fontWeight: '700', marginBottom: 8, color: colors.text },
  totalsRow: { color: colors.text, marginBottom: 4 },
  navBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
