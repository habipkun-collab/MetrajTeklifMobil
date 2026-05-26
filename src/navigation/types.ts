diff --git a/src/navigation/types.ts b/src/navigation/types.ts
index 81bbb51..0000000 100644
--- a/src/navigation/types.ts
+++ b/src/navigation/types.ts
@@
 export type RootStackParamList = {
   ProjectList: undefined
   OrganizationProfile: undefined
   NormSettings: undefined
+  UploadPdf: undefined
   ProjectEditor: { projectId: string }
   SpaceEditor: { projectId: string; spaceId: string }
   MetrajSummary: { projectId: string }
@@
 export type ExportProps = NativeStackScreenProps<RootStackParamList, 'Export'>
+export type UploadPdfProps = NativeStackScreenProps<RootStackParamList, 'UploadPdf'>
