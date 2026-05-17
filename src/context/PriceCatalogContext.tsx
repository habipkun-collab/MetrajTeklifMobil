import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getCatalogEntry,
  searchCatalog,
  upsertCatalogEntry,
} from '../catalog/priceCatalogLogic'
import { loadPriceCatalog, savePriceCatalog } from '../storage/priceCatalogStorage'
import type { MaterialPriceEntry, PriceCatalog } from '../types/priceCatalog'

interface PriceCatalogContextValue {
  ready: boolean
  entryCount: number
  search: (query: string, limit?: number) => MaterialPriceEntry[]
  lookup: (label: string) => MaterialPriceEntry | undefined
  rememberPrice: (label: string, unitPriceTry: number) => void
}

const PriceCatalogContext = createContext<PriceCatalogContextValue | null>(null)

export function PriceCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<PriceCatalog>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadPriceCatalog().then((loaded) => {
      if (cancelled) return
      if (loaded) setCatalog(loaded)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    void savePriceCatalog(catalog)
  }, [catalog, ready])

  const rememberPrice = useCallback((label: string, unitPriceTry: number) => {
    setCatalog((prev) => upsertCatalogEntry(prev, label, unitPriceTry))
  }, [])

  const search = useCallback(
    (query: string, limit?: number) => searchCatalog(catalog, query, limit),
    [catalog]
  )

  const lookup = useCallback((label: string) => getCatalogEntry(catalog, label), [catalog])

  const value = useMemo(
    () => ({
      ready,
      entryCount: Object.keys(catalog).length,
      search,
      lookup,
      rememberPrice,
    }),
    [ready, catalog, search, lookup, rememberPrice]
  )

  return <PriceCatalogContext.Provider value={value}>{children}</PriceCatalogContext.Provider>
}

export function usePriceCatalog() {
  const ctx = useContext(PriceCatalogContext)
  if (!ctx) throw new Error('usePriceCatalog PriceCatalogProvider içinde kullanılmalı')
  return ctx
}
