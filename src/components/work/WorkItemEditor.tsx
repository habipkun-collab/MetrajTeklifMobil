import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { defaultNormProfile } from '../../types/norms'
import type { WastePolicy } from '../../engine/tileMath'
import type { WorkKindMeta } from '../../catalog/workKindMeta'
import { rebarKgPerM3ForElement } from '../../engine/concrete'
import { useNorms } from '../../context/NormContext'
import { UI } from '../../i18n/ui'
import type { WorkItemInput } from '../../types/workItem'
import { colors, spacing } from '../../theme'

const policies: { key: WastePolicy; label: string }[] = [
  { key: 'simple', label: 'Basit brüt' },
  { key: 'medium', label: 'Orta' },
  { key: 'conservative', label: 'Muhafazakâr' },
]

const MAX_WASTE = 50

export default function WorkItemEditor({
  draft,
  meta,
  onChange,
}: {
  draft: WorkItemInput
  meta: WorkKindMeta
  onChange: (next: WorkItemInput) => void
}) {
  const { profile: norms } = useNorms()
  const patch = (partial: Partial<WorkItemInput>) => {
    onChange({ ...draft, ...partial } as WorkItemInput)
  }

  const num = (s: string, fallback = 0) => {
    const n = parseFloat(s.replace(',', '.'))
    return Number.isNaN(n) ? fallback : n
  }

  return (
    <View>
      <Text style={styles.hint}>{meta.inputHint}</Text>
      <Field label="Kalem adı / açıklama" value={draft.label} onChangeText={(t) => patch({ label: t })} />
      <Field
        label="Kalem norm çarpanı % (100 = standart, 110 = %10 fazla)"
        value={String('normMultiplierPct' in draft ? (draft.normMultiplierPct ?? 100) : 100)}
        onChangeText={(t) => patch({ normMultiplierPct: num(t, 100) })}
        keyboardType="decimal-pad"
      />

      {draft.kind === 'tile' && (
        <>
          <Field label="Kaplama alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, draft.areaM2) })} keyboardType="decimal-pad" />
          <View style={styles.row2}>
            <Field label="Plaka en (cm)" value={String(draft.tileWidthCm)} onChangeText={(t) => patch({ tileWidthCm: num(t, 60) })} keyboardType="decimal-pad" flex />
            <Field label="Plaka boy (cm)" value={String(draft.tileHeightCm)} onChangeText={(t) => patch({ tileHeightCm: num(t, 60) })} keyboardType="decimal-pad" flex />
          </View>
          <Field label="Derz (mm)" value={String(draft.jointMm)} onChangeText={(t) => patch({ jointMm: num(t) })} keyboardType="decimal-pad" />
          <Field label={UI.wastePctFieldLabel(MAX_WASTE)} value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>{UI.wastePolicySection}</Text>
          <ChipRow
            options={policies.map((p) => ({ key: p.key, label: p.label }))}
            value={draft.wastePolicy}
            onChange={(v) => patch({ wastePolicy: v as WastePolicy })}
          />
          <View style={styles.switchRow}>
            <Text style={styles.label}>Derz harcı hesabı</Text>
            <Switch value={draft.includeGroutEstimate} onValueChange={(v) => patch({ includeGroutEstimate: v })} />
          </View>
        </>
      )}

      {draft.kind === 'masonry_wall' && (
        <>
          <View style={styles.row2}>
            <Field label="Duvar boyu (m)" value={String(draft.lengthM)} onChangeText={(t) => patch({ lengthM: num(t, 1) })} keyboardType="decimal-pad" flex />
            <Field label="Yükseklik (m)" value={String(draft.heightM)} onChangeText={(t) => patch({ heightM: num(t, 2.8) })} keyboardType="decimal-pad" flex />
          </View>
          <Field label="Boşluklar (kapı+pencere m²)" value={String(draft.openingsM2)} onChangeText={(t) => patch({ openingsM2: num(t) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Duvar malzemesi</Text>
          <ChipRow
            options={[
              { key: 'brick_12', label: 'Tuğla 12 cm' },
              { key: 'brick_19', label: 'Tuğla 19 cm' },
              { key: 'aerated_20', label: 'Gazbeton 20 cm' },
            ]}
            value={draft.material}
            onChange={(v) => patch({ material: v as typeof draft.material })}
          />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'excavation' && (
        <>
          <View style={styles.row2}>
            <Field label="Boy (m)" value={String(draft.lengthM)} onChangeText={(t) => patch({ lengthM: num(t, 1) })} keyboardType="decimal-pad" flex />
            <Field label="En (m)" value={String(draft.widthM)} onChangeText={(t) => patch({ widthM: num(t, 1) })} keyboardType="decimal-pad" flex />
          </View>
          <Field label="Derinlik (m)" value={String(draft.depthM)} onChangeText={(t) => patch({ depthM: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Hafriyat şişme payı (%)" value={String(draft.bulkingPct)} onChangeText={(t) => patch({ bulkingPct: num(t, 15) })} keyboardType="decimal-pad" />
        </>
      )}

      {(draft.kind === 'concrete' || draft.kind === 'reinforced_concrete') && (
        <>
          <View style={styles.row2}>
            <Field label="Boy (m)" value={String(draft.lengthM)} onChangeText={(t) => patch({ lengthM: num(t, 1) })} keyboardType="decimal-pad" flex />
            <Field label="En (m)" value={String(draft.widthM)} onChangeText={(t) => patch({ widthM: num(t, 1) })} keyboardType="decimal-pad" flex />
          </View>
          <Field label="Kalınlık (m)" value={String(draft.thicknessM)} onChangeText={(t) => patch({ thicknessM: num(t, 0.3) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Beton türü</Text>
          <ChipRow
            options={[
              { key: 'ready', label: 'Hazır beton' },
              { key: 'site', label: 'Şantiye karışımı' },
            ]}
            value={draft.mix}
            onChange={(v) => patch({ mix: v as typeof draft.mix })}
          />
          {draft.kind === 'reinforced_concrete' && (
            <>
              <Text style={styles.label}>Betonarme elemanı</Text>
              <ChipRow
                options={[
                  { key: 'foundation', label: 'Temel' },
                  { key: 'slab', label: 'Döşeme' },
                  { key: 'column', label: 'Kolon/Kiriş' },
                ]}
                value={draft.element}
                onChange={(v) =>
                  patch({
                    element: v as typeof draft.element,
                    rebarKgPerM3: rebarKgPerM3ForElement(v as typeof draft.element, norms),
                  })
                }
              />
              <View style={styles.switchRow}>
                <Text style={styles.label}>Donatı kg — statik/keşiften import</Text>
                <Switch
                  value={draft.useImportedRebarKg}
                  onValueChange={(v) => patch({ useImportedRebarKg: v })}
                />
              </View>
              {draft.useImportedRebarKg ? (
                <Field
                  label="Toplam donatı (kg)"
                  value={String(draft.importedRebarKg)}
                  onChangeText={(t) => patch({ importedRebarKg: num(t) })}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Field
                  label="Donatı yoğunluğu (kg/m³ beton)"
                  value={String(draft.rebarKgPerM3)}
                  onChangeText={(t) => patch({ rebarKgPerM3: num(t, 100) })}
                  keyboardType="decimal-pad"
                />
              )}
            </>
          )}
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 3) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'plaster' && (
        <>
          <Field label="Sıva alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Kalınlık (mm)" value={String(draft.thicknessMm)} onChangeText={(t) => patch({ thicknessMm: num(t, 15) })} keyboardType="decimal-pad" />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 8) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'screed' && (
        <>
          <Field label="Şap alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Kalınlık (cm)" value={String(draft.thicknessCm)} onChangeText={(t) => patch({ thicknessCm: num(t, 4) })} keyboardType="decimal-pad" />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'paint' && (
        <>
          <Field label="Boya alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Kat sayısı" value={String(draft.coats)} onChangeText={(t) => patch({ coats: Math.max(1, Math.round(num(t, 2))) })} keyboardType="number-pad" />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'roof' && (
        <>
          <Field label="Çatı alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Kaplama</Text>
          <ChipRow
            options={[
              { key: 'tile', label: 'Kiremit' },
              { key: 'membrane', label: 'Membran' },
              { key: 'metal_sheet', label: 'Metal' },
            ]}
            value={draft.covering}
            onChange={(v) => patch({ covering: v as typeof draft.covering })}
          />
          <Field label="Eğim / bindirme payı (%)" value={String(draft.slopeExtraPct)} onChangeText={(t) => patch({ slopeExtraPct: num(t, 12) })} keyboardType="decimal-pad" />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'steel' && (
        <>
          <Text style={styles.label}>Çelik türü</Text>
          <ChipRow
            options={[
              { key: 'rebar', label: 'Donatı' },
              { key: 'mesh', label: 'Hasır' },
              { key: 'structural', label: 'Profil' },
            ]}
            value={draft.role}
            onChange={(v) => patch({ role: v as typeof draft.role })}
          />
          <Text style={styles.label}>Giriş şekli</Text>
          <ChipRow
            options={[
              { key: 'per_m2', label: 'Alan × kg/m²' },
              { key: 'direct_kg', label: 'Doğrudan kg' },
            ]}
            value={draft.mode}
            onChange={(v) => patch({ mode: v as typeof draft.mode })}
          />
          {draft.mode === 'direct_kg' ? (
            <Field label="Toplam çelik (kg)" value={String(draft.directKg)} onChangeText={(t) => patch({ directKg: num(t) })} keyboardType="decimal-pad" />
          ) : (
            <>
              <Field label="Alan (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
              <Field label="kg/m² (0 = norm)" value={String(draft.kgPerM2)} onChangeText={(t) => patch({ kgPerM2: num(t) })} keyboardType="decimal-pad" />
            </>
          )}
          <Field label="Fire / ziyan (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 8) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'electrical' && (
        <>
          <Field label="Alan (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Tesisat yoğunluğu</Text>
          <ChipRow
            options={[
              { key: 'light', label: 'Hafif' },
              { key: 'standard', label: 'Standart' },
              { key: 'dense', label: 'Yoğun' },
            ]}
            value={draft.density}
            onChange={(v) => patch({ density: v as typeof draft.density })}
          />
        </>
      )}

      {draft.kind === 'plumbing' && (
        <>
          <Field label="Alan (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Armatür adedi" value={String(draft.fixtureCount)} onChangeText={(t) => patch({ fixtureCount: Math.max(0, Math.round(num(t))) })} keyboardType="number-pad" />
        </>
      )}

      {draft.kind === 'insulation' && (
        <>
          <Field label="Yalıtım alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Kalınlık (cm)" value={String(draft.thicknessCm)} onChangeText={(t) => patch({ thicknessCm: num(t, 5) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Malzeme</Text>
          <ChipRow
            options={[
              { key: 'eps', label: 'EPS' },
              { key: 'xps', label: 'XPS' },
              { key: 'mineral_wool', label: 'Taş yünü' },
            ]}
            value={draft.insulationType}
            onChange={(v) => patch({ insulationType: v as typeof draft.insulationType })}
          />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'waterproofing' && (
        <>
          <Field label="Alan (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Field label="Kat sayısı" value={String(draft.layers)} onChangeText={(t) => patch({ layers: Math.max(1, Math.round(num(t, 2))) })} keyboardType="number-pad" />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 8) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'formwork' && (
        <Field label="İlgili beton hacmi (m³)" value={String(draft.concreteVolumeM3)} onChangeText={(t) => patch({ concreteVolumeM3: num(t, 1) })} keyboardType="decimal-pad" />
      )}

      {draft.kind === 'facade' && (
        <>
          <Field label="Cephe alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Kaplama tipi</Text>
          <ChipRow
            options={[
              { key: 'composite', label: 'Kompozit' },
              { key: 'stone', label: 'Taş' },
              { key: 'glass', label: 'Cam' },
              { key: 'paint_only', label: 'Boya' },
            ]}
            value={draft.cladding}
            onChange={(v) => patch({ cladding: v as typeof draft.cladding })}
          />
          <Field label="Ziyan payı (%)" value={String(draft.wastePct)} onChangeText={(t) => patch({ wastePct: num(t, 5) })} keyboardType="decimal-pad" />
        </>
      )}

      {draft.kind === 'elevator' && (
        <>
          <Field label="Asansör adedi" value={String(draft.elevatorCount)} onChangeText={(t) => patch({ elevatorCount: Math.max(1, Math.round(num(t, 1))) })} keyboardType="number-pad" />
          <Field label="Durak sayısı" value={String(draft.stopCount)} onChangeText={(t) => patch({ stopCount: Math.max(2, Math.round(num(t, 5))) })} keyboardType="number-pad" />
        </>
      )}

      {draft.kind === 'hvac' && (
        <>
          <Field label="Iskan alanı (m²)" value={String(draft.areaM2)} onChangeText={(t) => patch({ areaM2: num(t, 1) })} keyboardType="decimal-pad" />
          <Text style={styles.label}>Sistem</Text>
          <ChipRow
            options={[
              { key: 'split', label: 'Split' },
              { key: 'vrf', label: 'VRF' },
              { key: 'ducted', label: 'Kanallı' },
            ]}
            value={draft.system}
            onChange={(v) => patch({ system: v as typeof draft.system })}
          />
        </>
      )}

      {draft.kind === 'scaffolding' && (
        <View style={styles.row2}>
          <Field label="Çevre (m)" value={String(draft.perimeterM)} onChangeText={(t) => patch({ perimeterM: num(t, 1) })} keyboardType="decimal-pad" flex />
          <Field label="Yükseklik (m)" value={String(draft.heightM)} onChangeText={(t) => patch({ heightM: num(t, 1) })} keyboardType="decimal-pad" flex />
        </View>
      )}
    </View>
  )
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  flex,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  keyboardType?: 'decimal-pad' | 'number-pad'
  flex?: boolean
}) {
  return (
    <View style={[styles.field, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  )
}

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[styles.chip, value === o.key && styles.chipOn]}
        >
          <Text style={[styles.chipText, value === o.key && styles.chipTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 },
  field: { marginBottom: spacing.sm },
  label: { fontWeight: '600', color: colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  row2: { flexDirection: 'row', gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
})
