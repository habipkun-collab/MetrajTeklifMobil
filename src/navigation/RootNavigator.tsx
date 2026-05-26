diff --git a/src/navigation/RootNavigator.tsx b/src/navigation/RootNavigator.tsx
index 7b0d899..0000000 100644
--- a/src/navigation/RootNavigator.tsx
+++ b/src/navigation/RootNavigator.tsx
@@
 import SummaryScreen from '../screens/SummaryScreen'
 import ExportScreen from '../screens/ExportScreen'
 import OrganizationProfileScreen from '../screens/OrganizationProfileScreen'
 import NormSettingsScreen from '../screens/NormSettingsScreen'
+import UploadPdfScreen from '../screens/UploadPdfScreen'
@@
         <Stack.Screen name="MetrajSummary" component={MetrajSummaryScreen} options={{ title: 'Metraj özeti' }} />
         <Stack.Screen
           name="CostEstimate"
           component={CostEstimateScreen}
           options={{ title: 'Yaklaşık maliyet' }}
         />
+        <Stack.Screen name="UploadPdf" component={UploadPdfScreen} options={{ title: 'Proje Yükle' }} />
         <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Teklif' }} />
         <Stack.Screen name="Export" component={ExportScreen} options={{ title: 'Dışa aktar' }} />
