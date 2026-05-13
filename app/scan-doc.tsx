import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function ScanDocScreen() {
  return (
    <View style={styles.container}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan document</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinder}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.scanLine} />
          <Text style={styles.frameHint}>Align document in frame</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.galleryBtn} activeOpacity={0.8}>
            <Text style={styles.galleryText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureBtn} onPress={() => router.push('/ocr-preview')} activeOpacity={0.85}>
            <Text style={styles.captureText}>Capture</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Hold steady in good lighting for best OCR results</Text>
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: Colors.white, fontSize: 22, lineHeight: 26 },
  headerTitle: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  frame: { width: '100%', aspectRatio: 0.75, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: Colors.cloud[400] },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 8 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(159,204,59,0.8)', top: '50%' },
  frameHint: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' },
  controls: { paddingHorizontal: 24, paddingBottom: 48, gap: 14 },
  btnRow: { flexDirection: 'row', gap: 12 },
  galleryBtn: { flex: 1, paddingVertical: 16, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  galleryText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  captureBtn: { flex: 1, paddingVertical: 16, borderRadius: 99, backgroundColor: Colors.cloud[800], alignItems: 'center' },
  captureText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' },
});
