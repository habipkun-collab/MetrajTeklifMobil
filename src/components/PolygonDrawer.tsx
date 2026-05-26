import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';

interface Props {
  imageUri: string | null;
  onCancel: () => void;
  onComplete: (pixelArea: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const PolygonDrawer: React.FC<Props> = ({ imageUri, onCancel, onComplete }) => {
  const [points, setPoints] = useState<Array<{ x:number, y:number }>>([]);

  const addPoint = (e:any) => {
    // For simplicity this is a placeholder: in a real app use gesture responder or pan handler
  };

  const handleAddPoint = () => {
    // Add a dummy point to demonstrate
    const next = { x: Math.random() * (screenWidth-40) + 20, y: Math.random() * 300 + 20 };
    setPoints(p => [...p, next]);
  };

  const computeArea = (pts: Array<{x:number,y:number}>) => {
    // Shoelace formula
    if (pts.length < 3) return 0;
    let sum = 0;
    for (let i=0;i<pts.length;i++){
      const j = (i+1) % pts.length;
      sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(sum)/2;
  };

  const handleComplete = () => {
    const area = computeArea(points);
    onComplete(area);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alan Çizimi (örnek prototip)</Text>
      <View style={styles.canvas}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}><Text>Görsel yok</Text></View>
        )}
        <Svg style={StyleSheet.absoluteFill}>
          {points.length>0 && (
            <Polygon
              points={points.map(p=>`${p.x},${p.y}`).join(' ')}
              fill="rgba(0,150,0,0.3)"
              stroke="green"
            />
          )}
          {points.map((p, idx)=> (
            <Circle key={idx} cx={p.x} cy={p.y} r={6} fill="red" />
          ))}
        </Svg>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handleAddPoint} style={styles.btn}><Text>Nokta Ekle (demo)</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPoints([])} style={styles.btn}><Text>Temizle</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleComplete} style={styles.btn}><Text>Tamamla</Text></TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={styles.btn}><Text>İptal</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { fontWeight: '600', marginBottom: 8 },
  canvas: { height: 360, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  image: { width: '100%', height: '100%' },
  placeholder: { flex:1, alignItems:'center', justifyContent:'center' },
  controls: { flexDirection: 'row', flexWrap: 'wrap' },
  btn: { padding: 8, backgroundColor: '#eee', marginRight: 8, marginBottom: 8 }
});

export default PolygonDrawer;
