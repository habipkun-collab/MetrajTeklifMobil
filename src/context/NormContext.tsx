import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadNormProfile, saveNormProfile } from '../storage/normStorage'
import { defaultNormProfile, type NormProfile } from '../types/norms'

interface NormContextValue {
  ready: boolean
  profile: NormProfile
  version: number
  updateProfile: (patch: Partial<NormProfile>) => void
  resetToDefaults: () => void
}

const NormContext = createContext<NormContextValue | null>(null)

export function NormProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<NormProfile>(defaultNormProfile())
  const [ready, setReady] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    void loadNormProfile().then((p) => {
      setProfile(p)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    void saveNormProfile(profile)
  }, [profile, ready])

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const updateProfile = useCallback(
    (patch: Partial<NormProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }))
      bump()
    },
    [bump]
  )

  const resetToDefaults = useCallback(() => {
    setProfile(defaultNormProfile())
    bump()
  }, [bump])

  const value = useMemo(
    () => ({ ready, profile, version, updateProfile, resetToDefaults }),
    [ready, profile, version, updateProfile, resetToDefaults]
  )

  return <NormContext.Provider value={value}>{children}</NormContext.Provider>
}

export function useNorms() {
  const ctx = useContext(NormContext)
  if (!ctx) throw new Error('useNorms NormProvider içinde kullanılmalı')
  return ctx
}
