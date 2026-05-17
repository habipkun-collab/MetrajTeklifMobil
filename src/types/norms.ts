/** Global yaklaşık metraj normları — Ayarlar ekranından düzenlenir. */
export interface NormProfile {
  brick12PerM2: number
  brick19PerM2: number
  aeratedBlockPerM2: number
  mortarM3PerM2Brick12: number
  mortarM3PerM2Brick19: number
  aeratedGlueKgPerM2: number
  cementKgPerM3Mortar: number
  sandM3PerM3Mortar: number

  rebarKgPerM3Slab: number
  rebarKgPerM3Foundation: number
  rebarKgPerM3Column: number
  siteMixCementBagsPerM3: number
  siteMixSandM3PerM3: number
  siteMixGravelM3PerM3: number

  plasterDensityKgM3: number
  paintLitersPerM2PerCoat: number
  screedCementKgPerM3: number

  roofTilePerM2: number
  roofMembraneM2PerM2: number
  roofMetalSheetM2PerM2: number
  roofSlopeWastePct: number

  steelMeshKgPerM2: number
  steelStructuralKgPerM2: number
  steelWastePctDefault: number

  electricalCableMPerM2Light: number
  electricalCableMPerM2Standard: number
  electricalCableMPerM2Dense: number
  electricalOutletsPerM2: number

  insulationEpsM2PerM2: number
  insulationWoolM2PerM2: number
  insulationKgPerM2PerCm: number

  waterproofingM2PerM2: number
  waterproofingPrimerLtPerM2: number

  plumbingPipeMPerM2: number
  formworkM2PerM3Concrete: number

  facadeStoneM2PerM2: number
  facadeCompositeM2PerM2: number
  facadeGlassM2PerM2: number
  facadePaintM2PerM2: number
  facadeSubframeM2PerM2: number

  elevatorInstallUnitsPerStop: number
  hvacUnitPerM2: number
  hvacDuctMPerM2: number
  hvacVrfFactor: number
  hvacDuctedFactor: number
  scaffoldM2PerFaceM2: number
}

export function defaultNormProfile(): NormProfile {
  return {
    brick12PerM2: 55,
    brick19PerM2: 110,
    aeratedBlockPerM2: 7,
    mortarM3PerM2Brick12: 0.022,
    mortarM3PerM2Brick19: 0.034,
    aeratedGlueKgPerM2: 3.5,
    cementKgPerM3Mortar: 320,
    sandM3PerM3Mortar: 0.95,

    rebarKgPerM3Slab: 80,
    rebarKgPerM3Foundation: 100,
    rebarKgPerM3Column: 130,
    siteMixCementBagsPerM3: 7,
    siteMixSandM3PerM3: 0.42,
    siteMixGravelM3PerM3: 0.84,

    plasterDensityKgM3: 1800,
    paintLitersPerM2PerCoat: 0.15,
    screedCementKgPerM3: 350,

    roofTilePerM2: 10,
    roofMembraneM2PerM2: 1.12,
    roofMetalSheetM2PerM2: 1.08,
    roofSlopeWastePct: 12,

    steelMeshKgPerM2: 4,
    steelStructuralKgPerM2: 35,
    steelWastePctDefault: 8,

    electricalCableMPerM2Light: 2.5,
    electricalCableMPerM2Standard: 4,
    electricalCableMPerM2Dense: 6.5,
    electricalOutletsPerM2: 0.35,

    insulationEpsM2PerM2: 1.05,
    insulationWoolM2PerM2: 1.05,
    insulationKgPerM2PerCm: 0.45,

    waterproofingM2PerM2: 1.1,
    waterproofingPrimerLtPerM2: 0.2,

    plumbingPipeMPerM2: 3.5,
    formworkM2PerM3Concrete: 6,

    facadeStoneM2PerM2: 1.05,
    facadeCompositeM2PerM2: 1.05,
    facadeGlassM2PerM2: 1.02,
    facadePaintM2PerM2: 1.08,
    facadeSubframeM2PerM2: 0.35,

    elevatorInstallUnitsPerStop: 0.15,
    hvacUnitPerM2: 0.012,
    hvacDuctMPerM2: 0.8,
    hvacVrfFactor: 1.2,
    hvacDuctedFactor: 1.4,
    scaffoldM2PerFaceM2: 1,
  }
}

export function mergeNormProfile(partial: Partial<NormProfile>): NormProfile {
  return { ...defaultNormProfile(), ...partial }
}
