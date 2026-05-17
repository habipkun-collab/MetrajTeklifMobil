import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { computeWorkItem } from '../engine/workCompute'
import { useNorms } from './NormContext'
import { loadProjects, saveProjects } from '../storage/projectStorage'
import type { NormProfile } from '../types/norms'
import { syncCostLinesFromMetraj } from '../catalog/costEstimateLogic'
import type { CostEstimate, CostLine, CostUnit } from '../types/costEstimate'
import type { Discipline, Project, Space } from '../types/domain'
import { emptyProject, normalizeProject } from '../types/domain'
import type { WorkItem, WorkItemInput } from '../types/workItem'

interface ProjectContextValue {
  projects: Project[]
  createProject: (name: string, discipline: Discipline) => string
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'clientName' | 'vatRatePct'>>) => void
  deleteProject: (id: string) => void
  addSpace: (projectId: string, name: string) => void
  addWorkItem: (projectId: string, spaceId: string, item: WorkItemInput) => void
  updateWorkItem: (
    projectId: string,
    spaceId: string,
    workItemId: string,
    patch: Partial<WorkItemInput>
  ) => void
  removeWorkItem: (projectId: string, spaceId: string, workItemId: string) => void
  removeSpace: (projectId: string, spaceId: string) => void
  updateSpace: (projectId: string, spaceId: string, name: string) => void
  getProject: (id: string) => Project | undefined
  recomputeAll: (projectId: string) => void
  syncCostFromMetraj: (projectId: string) => void
  updateCostSettings: (projectId: string, patch: Partial<Pick<CostEstimate, 'laborMarkupPct'>>) => void
  updateCostLine: (
    projectId: string,
    lineId: string,
    patch: Partial<Pick<CostLine, 'label' | 'quantity' | 'unit' | 'unitPriceTry'>>
  ) => void
  addManualCostLine: (
    projectId: string,
    item: {
      label: string
      quantity: number
      unit: CostUnit
      unitPriceTry?: number
      category?: string
    }
  ) => void
  removeCostLine: (projectId: string, lineId: string) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

function recomputeSpace(space: Space, norms: NormProfile): Space {
  return {
    ...space,
    workItems: space.workItems.map((wi) => computeWorkItem(wi, norms)),
  }
}

function recomputeProject(p: Project, norms: NormProfile): Project {
  return normalizeProject({
    ...p,
    spaces: p.spaces.map((s) => recomputeSpace(s, norms)),
  })
}

function recomputeAndSyncCost(p: Project, norms: NormProfile): Project {
  const recomputed = recomputeProject(p, norms)
  return {
    ...recomputed,
    costEstimate: syncCostLinesFromMetraj(recomputed, recomputed.costEstimate),
  }
}

function patchProject(projectId: string, projects: Project[], updater: (p: Project) => Project) {
  return projects.map((p) => (p.id === projectId ? normalizeProject(updater(p)) : p))
}

function newWorkId(): string {
  return `wi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { profile: norms, version, ready: normsReady } = useNorms()
  const [projects, setProjects] = useState<Project[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadProjects().then((loaded) => {
      if (cancelled) return
      if (loaded && loaded.length > 0) setProjects(loaded.map((p) => recomputeProject(p, norms)))
      setStorageReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!storageReady || !normsReady) return
    setProjects((prev) => prev.map((p) => recomputeProject(p, norms)))
    // Norm katsayıları değişince tüm metrajları yeniden üret
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version tetikleyici
  }, [version])

  useEffect(() => {
    if (!storageReady) return
    void saveProjects(projects)
  }, [projects, storageReady])

  const createProject = useCallback((name: string, discipline: Discipline) => {
    const p = emptyProject(name.trim() || 'Yeni proje', discipline)
    const computed = recomputeProject(p, norms)
    setProjects((prev) => [...prev, computed])
    return p.id
  }, [])

  const updateProject = useCallback(
    (id: string, patch: Partial<Pick<Project, 'name' | 'clientName' | 'vatRatePct'>>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? recomputeProject({ ...p, ...patch }, norms) : p))
      )
    },
    []
  )

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [norms])

  const addSpace = useCallback((projectId: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const space: Space = {
          id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim() || 'Alan',
          workItems: [],
        }
        return recomputeProject({ ...p, spaces: [...p.spaces, space] }, norms)
      })
    )
  }, [norms])

  const addWorkItem = useCallback(
    (projectId: string, spaceId: string, item: WorkItemInput) => {
      const line = computeWorkItem({ ...item, id: newWorkId() } as WorkItem, norms)
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          const spaces = p.spaces.map((s) =>
            s.id === spaceId ? { ...s, workItems: [...s.workItems, line] } : s
          )
          return recomputeAndSyncCost({ ...p, spaces }, norms)
        })
      )
    },
    [norms]
  )

  const updateWorkItem = useCallback(
    (projectId: string, spaceId: string, workItemId: string, patch: Partial<WorkItemInput>) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          const spaces = p.spaces.map((s) => {
            if (s.id !== spaceId) return s
            const workItems = s.workItems.map((wi) => {
              if (wi.id !== workItemId) return wi
              return computeWorkItem({ ...wi, ...patch, id: wi.id } as WorkItem, norms)
            })
            return { ...s, workItems }
          })
          return recomputeAndSyncCost({ ...p, spaces }, norms)
        })
      )
    },
    [norms]
  )

  const removeWorkItem = useCallback((projectId: string, spaceId: string, workItemId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const spaces = p.spaces.map((s) =>
          s.id === spaceId
            ? { ...s, workItems: s.workItems.filter((wi) => wi.id !== workItemId) }
            : s
        )
        return recomputeAndSyncCost({ ...p, spaces }, norms)
      })
    )
  }, [norms])

  const removeSpace = useCallback((projectId: string, spaceId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        if (p.spaces.length <= 1) return p
        return recomputeAndSyncCost({
          ...p,
          spaces: p.spaces.filter((s) => s.id !== spaceId),
        }, norms)
      })
    )
  }, [norms])

  const updateSpace = useCallback((projectId: string, spaceId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const spaces = p.spaces.map((s) => (s.id === spaceId ? { ...s, name: trimmed } : s))
        return recomputeProject({ ...p, spaces }, norms)
      })
    )
  }, [norms])

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  )

  const recomputeAll = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? recomputeProject(p, norms) : p))
    )
  }, [norms])

  const syncCostFromMetraj = useCallback((projectId: string) => {
    setProjects((prev) =>
      patchProject(projectId, prev, (p) => ({
        ...p,
        costEstimate: syncCostLinesFromMetraj(p, p.costEstimate),
      }))
    )
  }, [])

  const updateCostSettings = useCallback(
    (projectId: string, patch: Partial<Pick<CostEstimate, 'laborMarkupPct'>>) => {
      setProjects((prev) =>
        patchProject(projectId, prev, (p) => ({
          ...p,
          costEstimate: { ...p.costEstimate, ...patch },
        }))
      )
    },
    []
  )

  const updateCostLine = useCallback(
    (
      projectId: string,
      lineId: string,
      patch: Partial<Pick<CostLine, 'label' | 'quantity' | 'unit' | 'unitPriceTry'>>
    ) => {
      setProjects((prev) =>
        patchProject(projectId, prev, (p) => ({
          ...p,
          costEstimate: {
            ...p.costEstimate,
            lines: p.costEstimate.lines.map((line) =>
              line.id === lineId ? { ...line, ...patch, id: line.id } : line
            ),
          },
        }))
      )
    },
    []
  )

  const addManualCostLine = useCallback(
    (
      projectId: string,
      item: {
        label: string
        quantity: number
        unit: CostUnit
        unitPriceTry?: number
        category?: string
      }
    ) => {
      const line: CostLine = {
        id: `cost_m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        label: item.label.trim() || 'Malzeme',
        quantity: item.quantity,
        unit: item.unit,
        unitPriceTry: item.unitPriceTry,
        category: item.category,
        source: { type: 'manual' },
      }
      setProjects((prev) =>
        patchProject(projectId, prev, (p) => ({
          ...p,
          costEstimate: {
            ...p.costEstimate,
            lines: [...p.costEstimate.lines, line],
          },
        }))
      )
    },
    []
  )

  const removeCostLine = useCallback((projectId: string, lineId: string) => {
    setProjects((prev) =>
      patchProject(projectId, prev, (p) => ({
        ...p,
        costEstimate: {
          ...p.costEstimate,
          lines: p.costEstimate.lines.filter((l) => l.id !== lineId),
        },
      }))
    )
  }, [])

  const value = useMemo(
    () => ({
      projects,
      createProject,
      updateProject,
      deleteProject,
      addSpace,
      addWorkItem,
      updateWorkItem,
      removeWorkItem,
      removeSpace,
      updateSpace,
      getProject,
      recomputeAll,
      syncCostFromMetraj,
      updateCostSettings,
      updateCostLine,
      addManualCostLine,
      removeCostLine,
    }),
    [
      projects,
      createProject,
      updateProject,
      deleteProject,
      addSpace,
      addWorkItem,
      updateWorkItem,
      removeWorkItem,
      removeSpace,
      updateSpace,
      getProject,
      recomputeAll,
      syncCostFromMetraj,
      updateCostSettings,
      updateCostLine,
      addManualCostLine,
      removeCostLine,
    ]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects ProjectProvider içinde kullanılmalı')
  return ctx
}
