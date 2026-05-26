import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  uri: string;
}

const PdfViewer: React.FC<Props> = ({ uri }) => {
  // For mobile, WebView can load file:// URIs or a simple pdf.js viewer could be used.
  // This is a minimal viewer: on native, react-native-pdf or WebView with pdf.js is recommended.

  if (!uri) return <Text>Dosya bulunamadı</Text>;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <iframe title="pdf-view" src={uri} style={{ width: '100%', height: '100%' }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        // on mobile some platforms block loading file://; using react-native-pdf is recommended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 400, borderWidth: 1, borderColor: '#eee', marginVertical: 8 },
  webview: { flex: 1 },
  webContainer: { height: 600 }
});

export default PdfViewer;
