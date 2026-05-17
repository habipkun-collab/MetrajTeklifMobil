import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useNorms } from '../context/NormContext'
import type { NormProfile } from '../types/norms'
import { colors, spacing } from '../theme'

type NormKey = keyof NormProfile

const SECTIONS: { title: string; fields: { key: NormKey; label: string }[] }[] = [
  {
    title: 'Duvar örme',
    fields: [
      { key: 'brick12PerM2', label: 'Tuğla 12 cm (adet/m²)' },
      { key: 'brick19PerM2', label: 'Tuğla 19 cm (adet/m²)' },
      { key: 'aeratedBlockPerM2', label: 'Gazbeton blok (adet/m²)' },
      { key: 'mortarM3PerM2Brick12', label: 'Harç m³/m² (12 cm)' },
      { key: 'mortarM3PerM2Brick19', label: 'Harç m³/m² (19 cm)' },
      { key: 'cementKgPerM3Mortar', label: 'Çimento kg/m³ harç' },
    ],
  },
  {
    title: 'Betonarme',
    fields: [
      { key: 'rebarKgPerM3Foundation', label: 'Donatı kg/m³ (temel)' },
      { key: 'rebarKgPerM3Slab', label: 'Donatı kg/m³ (döşeme)' },
      { key: 'rebarKgPerM3Column', label: 'Donatı kg/m³ (kolon/kiriş)' },
      { key: 'siteMixCementBagsPerM3', label: 'Şantiye beton çimento (torba/m³)' },
      { key: 'formworkM2PerM3Concrete', label: 'Kalıp m² / m³ beton' },
    ],
  },
  {
    title: 'Çatı',
    fields: [
      { key: 'roofTilePerM2', label: 'Kiremit (adet/m²)' },
      { key: 'roofMembraneM2PerM2', label: 'Membran m²/m²' },
      { key: 'roofMetalSheetM2PerM2', label: 'Metal kaplama m²/m²' },
      { key: 'roofSlopeWastePct', label: 'Varsayılan eğim payı %' },
    ],
  },
  {
    title: 'Çelik',
    fields: [
      { key: 'steelMeshKgPerM2', label: 'Hasır çelik kg/m²' },
      { key: 'steelStructuralKgPerM2', label: 'Konstrüksiyon kg/m²' },
      { key: 'steelWastePctDefault', label: 'Varsayılan fire %' },
    ],
  },
  {
    title: 'Elektrik (alan bazlı)',
    fields: [
      { key: 'electricalCableMPerM2Light', label: 'Kablo m/m² (hafif)' },
      { key: 'electricalCableMPerM2Standard', label: 'Kablo m/m² (standart)' },
      { key: 'electricalCableMPerM2Dense', label: 'Kablo m/m² (yoğun)' },
      { key: 'electricalOutletsPerM2', label: 'Priz noktası / m²' },
    ],
  },
  {
    title: 'Cephe & iskele',
    fields: [
      { key: 'facadeCompositeM2PerM2', label: 'Kompozit m²/m²' },
      { key: 'facadeSubframeM2PerM2', label: 'Karkas m²/m²' },
      { key: 'elevatorInstallUnitsPerStop', label: 'Asansör montaj birimi/durak' },
      { key: 'hvacUnitPerM2', label: 'HVAC paket / m²' },
      { key: 'scaffoldM2PerFaceM2', label: 'İskele m² / yüzey m²' },
    ],
  },
  {
    title: 'Yalıtım & bitirme',
    fields: [
      { key: 'waterproofingM2PerM2', label: 'Su yalıtımı m²/m²' },
      { key: 'insulationKgPerM2PerCm', label: 'Yalıtım kg/m²/cm' },
      { key: 'paintLitersPerM2PerCoat', label: 'Boya lt/m²/kat' },
      { key: 'plumbingPipeMPerM2', label: 'Tesisat borusu m/m²' },
    ],
  },
]

export default function NormSettingsScreen() {
  const { profile, updateProfile, resetToDefaults } = useNorms()

  const setNum = (key: NormKey, text: string) => {
    const n = parseFloat(text.replace(',', '.'))
    if (!Number.isNaN(n)) updateProfile({ [key]: n })
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Bu katsayılar tüm projelerdeki metraj hesaplarında kullanılır. Değiştirdiğinizde mevcut
        projeler otomatik yeniden hesaplanır.
      </Text>

      {SECTIONS.map((sec) => (
        <View key={sec.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          {sec.fields.map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={String(profile[f.key])}
                onChangeText={(t) => setNum(f.key, t)}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}
        </View>
      ))}

      <Pressable style={styles.resetBtn} onPress={resetToDefaults}>
        <Text style={styles.resetBtnText}>Varsayılan normlara dön</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  lead: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  field: { marginBottom: spacing.sm },
  label: { fontWeight: '600', color: colors.text, marginBottom: 4, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  resetBtn: {
    marginTop: spacing.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
  },
  resetBtnText: { color: colors.danger, fontWeight: '700' },
})
