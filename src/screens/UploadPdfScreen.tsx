import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Modal, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'react-native-document-picker';
import PdfViewer from '../components/PdfViewer';
import PolygonDrawer from '../components/PolygonDrawer';
import * as FileSystem from 'expo-file-system';

const UploadPdfScreen: React.FC = () => {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [unit, setUnit] = useState<'mm'|'cm'|'m'>('m');
  const [knownDistance, setKnownDistance] = useState<string>('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lastArea, setLastArea] = useState<number | null>(null);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.allFiles]
      });
      // copy to app local storage
      const dest = `${FileSystem.documentDirectory}${res.name}`;
      await FileSystem.copyAsync({ uri: res.uri, to: dest });
      setFileUri(dest);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) return;
      console.error(err);
    }
  };

  const onPolygonComplete = (pixelArea: number) => {
    // convert pixel area to real area using knownDistance and unit
    // For MVP we expect user to input a known distance between two points on the plan
    if (!knownDistance || Number(knownDistance) <= 0) {
      alert('Lütfen bilinen bir mesafe girin (ölçek için)');
      return;
    }
    const known = Number(knownDistance);
    // Assume user marked two points that correspond to a pixel distance; PolygonDrawer should provide scalePixelDistance
    // For MVP we'll ask PolygonDrawer to return pixelPerUnit via callback; here we only display pixel area
    setLastArea(pixelArea);
    setDrawerVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proje Yükle (PDF / DWG)</Text>
      <Button title="Dosya Seç" onPress={pickFile} />
      {fileUri ? (
        <View style={{ flex: 1, width: '100%' }}>
          <PdfViewer uri={fileUri} />
          <View style={styles.controls}>
            <Text>Ölçü Birimi:</Text>
            <View style={styles.unitRow}>
              <TouchableOpacity onPress={() => setUnit('mm')} style={[styles.unitBtn, unit==='mm' && styles.unitBtnActive]}>
                <Text>mm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUnit('cm')} style={[styles.unitBtn, unit==='cm' && styles.unitBtnActive]}>
                <Text>cm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUnit('m')} style={[styles.unitBtn, unit==='m' && styles.unitBtnActive]}>
                <Text>m</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="İki nokta arası gerçek mesafe (ör. 5)"
              value={knownDistance}
              keyboardType="numeric"
              onChangeText={setKnownDistance}
              style={styles.input}
            />
            <Button title="Alan Seçimi Yap" onPress={() => setDrawerVisible(true)} />
            {lastArea !== null && (
              <Text>Seçilen alan (piksel²): {lastArea.toFixed(2)}</Text>
            )}
          </View>
        </View>
      ) : (
        <Text>Henüz dosya seçilmedi.</Text>
      )}

      <Modal visible={drawerVisible} animationType="slide">
        <PolygonDrawer
          imageUri={fileUri}
          onCancel={() => setDrawerVisible(false)}
          onComplete={(pixelArea:number) => onPolygonComplete(pixelArea)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  controls: { padding: 8 },
  unitRow: { flexDirection: 'row', marginVertical: 8 },
  unitBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8, borderRadius: 4 },
  unitBtnActive: { backgroundColor: '#ddd' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginVertical: 8 }
});

export default UploadPdfScreen;
