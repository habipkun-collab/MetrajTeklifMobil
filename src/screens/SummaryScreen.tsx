import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { computeCostTotals, lineAmount } from '../catalog/costEstimateLogic'
import { COST_UNIT_LABELS } from '../types/costEstimate'
import { useProjects } from '../context/ProjectContext'
import { colors, spacing } from '../theme'
import type { SummaryProps } from '../navigation/types'

export default function SummaryScreen({ route, navigation }: SummaryProps) {
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

  const totals = computeCostTotals(project.costEstimate, project.vatRatePct)
  const laborPct = project.costEstimate.laborMarkupPct

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>{project.name}</Text>
      {project.clientName ? (
        <Text style={styles.client}>Müşteri: {project.clientName}</Text>
      ) : null}

      <Text style={styles.section}>Teklif kalemleri</Text>
      {project.costEstimate.lines.length === 0 ? (
        <Text style={styles.muted}>
          Henüz maliyet kalemi yok. Önce metraj girin, ardından yaklaşık maliyet ekranından birim
          fiyatları doldurun.
        </Text>
      ) : (
        project.costEstimate.lines.map((line) => {
          const amt = lineAmount(line)
          return (
            <View key={line.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{line.label}</Text>
                <Text style={styles.rowDetail}>
                  {line.quantity} {COST_UNIT_LABELS[line.unit]}
                  {line.unitPriceTry != null
                    ? ` × ${line.unitPriceTry.toFixed(2)} ₺`
                    : ' · fiyat girilmedi'}
                </Text>
              </View>
              <Text style={styles.amount}>{amt != null ? `${amt.toFixed(2)} ₺` : '—'}</Text>
            </View>
          )
        })
      )}

      <View style={styles.totals}>
        <Line label="Malzeme ara toplamı" value={totals.materialSubtotal} />
        {laborPct > 0 ? (
          <Line label={`İşçilik (%${laborPct})`} value={totals.laborAmount} />
        ) : (
          <Line label="İşçilik" value={0} />
        )}
        <Line label="Ara toplam (KDV hariç)" value={totals.subtotalBeforeVat} />
        <Line label={`KDV %${project.vatRatePct}`} value={totals.vatAmount} />
        <Line label="Genel toplam" value={totals.grandTotal} strong />
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Export', { projectId })}
      >
        <Text style={styles.primaryBtnText}>PDF / Excel dışa aktar →</Text>
      </Pressable>

      <Pressable
        style={styles.linkBtn}
        onPress={() => navigation.navigate('CostEstimate', { projectId })}
      >
        <Text style={styles.linkBtnText}>Yaklaşık maliyeti düzenle</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Teklif, yaklaşık maliyet ekranındaki birim fiyatlar ve metraj miktarlarına dayanır. Metraj
        ve derz kg değerleri yaklaşıktır; sahada doğrulama önerilir.
      </Text>
    </ScrollView>
  )
}

function Line({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={strong ? styles.totalLabelStrong : styles.totalLabel}>{label}</Text>
      <Text style={strong ? styles.totalValueStrong : styles.totalValue}>{value.toFixed(2)} ₺</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '800', color: colors.text },
  client: { color: colors.textSecondary, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  muted: { color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: { fontWeight: '600', color: colors.text },
  rowDetail: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
  amount: {
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
    minWidth: 72,
    textAlign: 'right',
  },
  totals: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { color: colors.textSecondary },
  totalLabelStrong: { fontWeight: '800', color: colors.text },
  totalValue: { fontWeight: '600', color: colors.text },
  totalValueStrong: { fontWeight: '800', color: colors.primary, fontSize: 18 },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { marginTop: spacing.md, alignItems: 'center', paddingVertical: 10 },
  linkBtnText: { color: colors.primary, fontWeight: '700' },
  disclaimer: { marginTop: spacing.lg, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
})
