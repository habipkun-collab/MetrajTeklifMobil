import { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { computeCostTotals, lineAmount } from '../catalog/costEstimateLogic'
import { getQuoteTemplateGroups } from '../catalog/quoteTemplates'
import { usePriceCatalog } from '../context/PriceCatalogContext'
import { useProjects } from '../context/ProjectContext'
import { COST_UNIT_LABELS, type CostUnit } from '../types/costEstimate'
import { colors, spacing } from '../theme'
import type { CostEstimateProps } from '../navigation/types'

const manualUnits: CostUnit[] = ['adet', 'kg', 'm2', 'lt', 'torba', 'takim', 'diger']

export default function CostEstimateScreen({ route, navigation }: CostEstimateProps) {
  const { projectId } = route.params
  const {
    getProject,
    syncCostFromMetraj,
    updateCostSettings,
    updateCostLine,
    addManualCostLine,
    removeCostLine,
  } = useProjects()
  const { lookup, rememberPrice } = usePriceCatalog()
  const project = getProject(projectId)

  const [manualLabel, setManualLabel] = useState('')
  const [manualQty, setManualQty] = useState('1')
  const [manualUnit, setManualUnit] = useState<CostUnit>('adet')
  const [manualPrice, setManualPrice] = useState('')
  const [rememberManual, setRememberManual] = useState(true)
  const [laborDraft, setLaborDraft] = useState<string | null>(null)

  useEffect(() => {
    if (!project) return
    if (project.costEstimate.lines.length === 0) {
      syncCostFromMetraj(projectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca proje açılışında boşsa doldur
  }, [projectId])

  useEffect(() => {
    if (project) setLaborDraft(String(project.costEstimate.laborMarkupPct))
  }, [projectId, project?.costEstimate.laborMarkupPct])

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Proje bulunamadı.</Text>
      </View>
    )
  }

  const templateGroups = getQuoteTemplateGroups(project.discipline)

  const laborPct =
    laborDraft != null && laborDraft !== ''
      ? parseFloat(laborDraft.replace(',', '.'))
      : project.costEstimate.laborMarkupPct
  const laborValid = !Number.isNaN(laborPct)
  const totals = computeCostTotals(
    {
      ...project.costEstimate,
      laborMarkupPct: laborValid ? Math.min(100, Math.max(0, laborPct)) : 0,
    },
    project.vatRatePct
  )

  const commitLabor = () => {
    const raw = (laborDraft ?? '').trim().replace(',', '.')
    if (raw === '') {
      setLaborDraft(String(project.costEstimate.laborMarkupPct))
      return
    }
    const n = parseFloat(raw)
    if (!Number.isNaN(n)) {
      updateCostSettings(projectId, { laborMarkupPct: Math.min(100, Math.max(0, n)) })
      setLaborDraft(String(Math.min(100, Math.max(0, n))))
    }
  }

  const addManual = () => {
    const qty = parseFloat(manualQty.replace(',', '.'))
    if (Number.isNaN(qty) || qty <= 0) return
    const priceRaw = manualPrice.trim() ? parseFloat(manualPrice.replace(',', '.')) : NaN
    const unitPriceTry =
      manualPrice.trim() && !Number.isNaN(priceRaw) && priceRaw > 0 ? priceRaw : undefined
    const label = manualLabel.trim() || 'Malzeme'
    addManualCostLine(projectId, { label, quantity: qty, unit: manualUnit, unitPriceTry })
    if (rememberManual && unitPriceTry != null) {
      rememberPrice(label, unitPriceTry)
    }
    setManualLabel('')
    setManualQty('1')
    setManualPrice('')
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Miktarlar metrajdan gelir; birim fiyatları burada girersiniz. İşçilik, malzeme toplamının
        üzerine yüzde olarak eklenir.
      </Text>

      <Pressable style={styles.syncBtn} onPress={() => syncCostFromMetraj(projectId)}>
        <Text style={styles.syncBtnText}>Metrajdan kalemleri güncelle</Text>
      </Pressable>

      <Text style={styles.section}>Branş malzeme şablonları</Text>
      <Text style={styles.muted}>
        İnşaat, peyzaj ve iç mimarlık tekliflerinde sık kullanılan kalemleri tek dokunuşla ekleyin.
        Miktarları ve birim fiyatları sonradan düzenleyin.
      </Text>
      {templateGroups.map((group) => (
        <View key={group.title} style={styles.templateGroup}>
          <Text style={styles.templateGroupTitle}>{group.title}</Text>
          <View style={styles.templateRow}>
            {group.items.map((item) => (
              <Pressable
                key={item.label}
                style={styles.templateChip}
                onPress={() =>
                  addManualCostLine(projectId, {
                    label: item.label,
                    quantity: item.defaultQty,
                    unit: item.unit,
                    category: item.category,
                  })
                }
              >
                <Text style={styles.templateChipText}>+ {item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.section}>Maliyet kalemleri</Text>
      {project.costEstimate.lines.length === 0 ? (
        <Text style={styles.muted}>
          Önce alanlarda kaplama girin, ardından yukarıdaki düğme ile kalemleri oluşturun.
        </Text>
      ) : (
        project.costEstimate.lines.map((line) => {
          const fromMetraj = line.source.type !== 'manual'
          const amt = lineAmount(line)
          const catalog = lookup(line.label.split(' (')[0] ?? line.label)
          return (
            <View key={line.id} style={styles.lineCard}>
              <Text style={styles.lineTitle}>{line.label}</Text>
              <Text style={styles.lineQty}>
                Miktar: {line.quantity} {COST_UNIT_LABELS[line.unit]}
                {fromMetraj ? ' · metraj' : ' · elle'}
              </Text>
              <Text style={styles.label}>Birim fiyat (TRY/{COST_UNIT_LABELS[line.unit]})</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={line.unitPriceTry != null ? String(line.unitPriceTry) : ''}
                onChangeText={(t) => {
                  const raw = t.trim().replace(',', '.')
                  if (raw === '') {
                    updateCostLine(projectId, line.id, { unitPriceTry: undefined })
                    return
                  }
                  const n = parseFloat(raw)
                  if (!Number.isNaN(n)) updateCostLine(projectId, line.id, { unitPriceTry: n })
                }}
              />
              {catalog && line.unitPriceTry == null ? (
                <Pressable
                  onPress={() =>
                    updateCostLine(projectId, line.id, { unitPriceTry: catalog.unitPriceTry })
                  }
                >
                  <Text style={styles.catalogLink}>
                    Kütüphaneden uygula: {catalog.unitPriceTry.toFixed(2)} ₺
                  </Text>
                </Pressable>
              ) : null}
              <Text style={styles.lineTotal}>
                Satır tutarı: {amt != null ? `${amt.toFixed(2)} ₺` : '—'}
              </Text>
              {!fromMetraj ? (
                <Pressable onPress={() => removeCostLine(projectId, line.id)}>
                  <Text style={styles.remove}>Kalemi sil</Text>
                </Pressable>
              ) : null}
            </View>
          )
        })
      )}

      <Text style={styles.section}>Elle malzeme ekle</Text>
      <Text style={styles.label}>Malzeme adı</Text>
      <TextInput
        style={styles.input}
        value={manualLabel}
        onChangeText={setManualLabel}
        placeholder="Örn. Sıva, profil, yapıştırıcı"
        placeholderTextColor={colors.textSecondary}
      />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Miktar</Text>
          <TextInput
            style={styles.input}
            value={manualQty}
            onChangeText={setManualQty}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Birim</Text>
          <View style={styles.unitRow}>
            {manualUnits.map((u) => (
              <Pressable
                key={u}
                onPress={() => setManualUnit(u)}
                style={[styles.unitChip, manualUnit === u && styles.unitChipOn]}
              >
                <Text style={[styles.unitChipText, manualUnit === u && styles.unitChipTextOn]}>
                  {COST_UNIT_LABELS[u]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.label}>Birim fiyat (TRY)</Text>
      <TextInput
        style={styles.input}
        value={manualPrice}
        onChangeText={setManualPrice}
        keyboardType="decimal-pad"
        placeholderTextColor={colors.textSecondary}
      />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Fiyatı kütüphaneye kaydet</Text>
        <Switch value={rememberManual} onValueChange={setRememberManual} />
      </View>
      <Pressable style={styles.secondaryBtn} onPress={addManual}>
        <Text style={styles.secondaryBtnText}>Malzeme kalemi ekle</Text>
      </Pressable>

      <Text style={styles.section}>İşçilik</Text>
      <Text style={styles.label}>Malzeme tutarı üzerine işçilik %</Text>
      <TextInput
        style={styles.input}
        value={laborDraft ?? ''}
        onChangeText={setLaborDraft}
        onBlur={commitLabor}
        keyboardType="decimal-pad"
        placeholder="Örn. 15 veya 20"
        placeholderTextColor={colors.textSecondary}
      />
      <View style={styles.chipRow}>
        {[0, 10, 15, 20, 25].map((p) => (
          <Pressable
            key={p}
            style={[styles.chip, laborValid && laborPct === p && styles.chipOn]}
            onPress={() => {
              updateCostSettings(projectId, { laborMarkupPct: p })
              setLaborDraft(String(p))
            }}
          >
            <Text style={[styles.chipText, laborValid && laborPct === p && styles.chipTextOn]}>
              %{p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.totals}>
        <Row label="Malzeme ara toplamı" value={totals.materialSubtotal} />
        <Row
          label={`İşçilik (%${laborValid ? laborPct : project.costEstimate.laborMarkupPct})`}
          value={totals.laborAmount}
        />
        <Row label="Ara toplam (KDV hariç)" value={totals.subtotalBeforeVat} />
        <Row label={`KDV %${project.vatRatePct}`} value={totals.vatAmount} />
        <Row label="Genel toplam (teklif)" value={totals.grandTotal} strong />
        <Text style={styles.totalsMeta}>
          Fiyat girilen kalem: {totals.pricedLineCount} / {totals.totalLineCount}
        </Text>
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Summary', { projectId })}
      >
        <Text style={styles.primaryBtnText}>Teklif özetine git →</Text>
      </Pressable>
    </ScrollView>
  )
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={strong ? styles.totalLabelStrong : styles.totalLabel}>{label}</Text>
      <Text style={strong ? styles.totalValueStrong : styles.totalValue}>{value.toFixed(2)} ₺</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lead: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  syncBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  syncBtnText: { color: '#fff', fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  muted: { color: colors.textSecondary, marginBottom: spacing.md },
  lineCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  lineTitle: { fontWeight: '700', color: colors.text, fontSize: 15 },
  lineQty: { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  label: { fontWeight: '600', color: colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.bg,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  catalogLink: { color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  lineTotal: { fontWeight: '700', color: colors.primary },
  remove: { color: colors.danger, marginTop: spacing.sm, fontWeight: '600' },
  row2: { flexDirection: 'row', gap: 12 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unitChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitChipText: { fontSize: 12, color: colors.text },
  unitChipTextOn: { color: '#fff', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  secondaryBtnText: { color: '#fff', fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  totals: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { color: colors.textSecondary, flex: 1, paddingRight: 8 },
  totalLabelStrong: { fontWeight: '800', color: colors.text, flex: 1 },
  totalValue: { fontWeight: '600', color: colors.text },
  totalValueStrong: { fontWeight: '800', color: colors.primary, fontSize: 18 },
  totalsMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  templateGroup: { marginBottom: spacing.md },
  templateGroupTitle: { fontWeight: '700', color: colors.primary, marginBottom: 8, fontSize: 14 },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  templateChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateChipText: { fontSize: 12, color: colors.text, fontWeight: '600' },
})
