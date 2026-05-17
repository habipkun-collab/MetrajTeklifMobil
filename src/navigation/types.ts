import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  ProjectList: undefined
  OrganizationProfile: undefined
  NormSettings: undefined
  ProjectEditor: { projectId: string }
  SpaceEditor: { projectId: string; spaceId: string }
  MetrajSummary: { projectId: string }
  CostEstimate: { projectId: string }
  Summary: { projectId: string }
  Export: { projectId: string }
}

export type ProjectListProps = NativeStackScreenProps<RootStackParamList, 'ProjectList'>
export type OrganizationProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'OrganizationProfile'
>
export type NormSettingsProps = NativeStackScreenProps<RootStackParamList, 'NormSettings'>
export type ProjectEditorProps = NativeStackScreenProps<RootStackParamList, 'ProjectEditor'>
export type SpaceEditorProps = NativeStackScreenProps<RootStackParamList, 'SpaceEditor'>
export type MetrajSummaryProps = NativeStackScreenProps<RootStackParamList, 'MetrajSummary'>
export type CostEstimateProps = NativeStackScreenProps<RootStackParamList, 'CostEstimate'>
export type SummaryProps = NativeStackScreenProps<RootStackParamList, 'Summary'>
export type ExportProps = NativeStackScreenProps<RootStackParamList, 'Export'>
