import { useState } from 'react'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useOrganization } from '../context/OrganizationContext'
import { colors, spacing } from '../theme'
export default function OrganizationProfileScreen() {
  const { profile, updateProfile, setLogoBase64 } = useOrganization()
  const [logoError, setLogoError] = useState(false)

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Logoyu seçmek için galeri erişimine izin verin.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.75,
      allowsEditing: true,
      aspect: [3, 1],
    })
    if (result.canceled || !result.assets[0]?.base64) return
    const mime = result.assets[0].mimeType ?? 'image/jpeg'
    setLogoBase64(`data:${mime};base64,${result.assets[0].base64}`)
    setLogoError(false)
  }

  const clearLogo = () => {
    setLogoBase64(null)
    setLogoError(false)
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Firma bilgileri ve logo, PDF ve Excel teklif çıktılarında üst bilgi olarak görünür.
      </Text>

      <Text style={styles.section}>Logo</Text>
      <View style={styles.logoRow}>
        {profile.logoBase64 && !logoError ? (
          <Image
            source={{ uri: profile.logoBase64 }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>Logo yok</Text>
          </View>
        )}
        <View style={styles.logoActions}>
          <Pressable style={styles.btn} onPress={() => void pickLogo()}>
            <Text style={styles.btnText}>Galeriden seç</Text>
          </Pressable>
          {profile.logoBase64 ? (
            <Pressable style={styles.btnGhost} onPress={clearLogo}>
              <Text style={styles.btnGhostText}>Logoyu kaldır</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Field label="Firma adı" value={profile.companyName} onChange={(v) => updateProfile({ companyName: v })} />
      <Field label="Slogan / kısa tanım" value={profile.tagline} onChange={(v) => updateProfile({ tagline: v })} />
      <Field label="Adres satırı 1" value={profile.addressLine1} onChange={(v) => updateProfile({ addressLine1: v })} />
      <Field label="Adres satırı 2" value={profile.addressLine2} onChange={(v) => updateProfile({ addressLine2: v })} />
      <Field label="İl / şehir" value={profile.city} onChange={(v) => updateProfile({ city: v })} />
      <Field label="Telefon" value={profile.phone} onChange={(v) => updateProfile({ phone: v })} keyboardType="phone-pad" />
      <Field label="E-posta" value={profile.email} onChange={(v) => updateProfile({ email: v })} keyboardType="email-address" />
      <Field label="Web sitesi" value={profile.website} onChange={(v) => updateProfile({ website: v })} />
      <Field label="Vergi dairesi" value={profile.taxOffice} onChange={(v) => updateProfile({ taxOffice: v })} />
      <Field label="Vergi no (VKN)" value={profile.taxNo} onChange={(v) => updateProfile({ taxNo: v })} />
      <Field
        label="Ticaret sicil no"
        value={profile.tradeRegistry}
        onChange={(v) => updateProfile({ tradeRegistry: v })}
      />

      <Text style={styles.section}>Teklif dipnotu</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={profile.quoteFooterNote}
        onChangeText={(v) => updateProfile({ quoteFooterNote: v })}
        multiline
        placeholderTextColor={colors.textSecondary}
      />
    </ScrollView>
  )
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  lead: { color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm, color: colors.text },
  logoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'flex-start' },
  logo: { width: 140, height: 56, backgroundColor: colors.surface, borderRadius: 8 },
  logoPlaceholder: {
    width: 140,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logoPlaceholderText: { color: colors.textSecondary, fontSize: 12 },
  logoActions: { flex: 1, gap: 8 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhost: { paddingVertical: 6 },
  btnGhostText: { color: colors.danger, fontWeight: '600' },
  field: { marginBottom: spacing.sm },
  label: { fontWeight: '600', color: colors.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
})
