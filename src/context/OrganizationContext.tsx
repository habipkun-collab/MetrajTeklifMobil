import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadOrganization, saveOrganization } from '../storage/organizationStorage'
import { emptyOrganizationProfile, type OrganizationProfile } from '../types/organization'

interface OrganizationContextValue {
  ready: boolean
  profile: OrganizationProfile
  updateProfile: (patch: Partial<OrganizationProfile>) => void
  setLogoBase64: (logoBase64: string | null) => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OrganizationProfile>(emptyOrganizationProfile())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void loadOrganization().then((p) => {
      setProfile(p)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    void saveOrganization(profile)
  }, [profile, ready])

  const updateProfile = useCallback((patch: Partial<OrganizationProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  const setLogoBase64 = useCallback((logoBase64: string | null) => {
    setProfile((prev) => ({ ...prev, logoBase64 }))
  }, [])

  const value = useMemo(
    () => ({ ready, profile, updateProfile, setLogoBase64 }),
    [ready, profile, updateProfile, setLogoBase64]
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization OrganizationProvider içinde kullanılmalı')
  return ctx
}
