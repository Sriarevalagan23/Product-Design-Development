import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar } from '@/components/ui/MediComponents';

export default function UploadScreen() {
  const [form, setForm] = useState({ type: 'Blood test', hospital: '', date: '', notes: '' });
  const [uploading, setUploading] = useState(false);

  const f = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  return (
    <View style={styles.container}>
      <TopBar title="Upload report" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Drop zone */}
        <TouchableOpacity style={styles.dropZone} activeOpacity={0.8}>
          <View style={styles.dropIcon}><Text style={{ fontSize: 28 }}>📤</Text></View>
          <Text style={styles.dropText}>Tap to upload</Text>
          <Text style={styles.dropHint}>PDF, JPG, PNG · max 10 MB</Text>
        </TouchableOpacity>

        <SelectDisplay
          label="Report type"
          value={form.type}
          onChange={f('type')}
          options={['Blood test', 'Lipid profile', 'X-ray / Scan', 'Prescription', 'ECG', 'Other']}
        />
        <InputField label="Hospital / clinic" placeholder="Apollo Hospital" value={form.hospital} onChangeText={f('hospital')} />
        <InputField label="Date of report" placeholder="DD / MM / YYYY" value={form.date} onChangeText={f('date')} />
        <InputField label="Notes (optional)" placeholder="Any notes…" value={form.notes} onChangeText={f('notes')} multiline numberOfLines={3} />

        <BtnPrimary
          onPress={() => {
            setUploading(true);
            setTimeout(() => router.back(), 1200);
          }}
        >
          {uploading ? 'Uploading…' : 'Upload report'}
        </BtnPrimary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.cloud[300],
    borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, backgroundColor: Colors.cloud[50],
  },
  dropIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center' },
  dropText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  dropHint: { fontSize: 10, color: Colors.gray[400] },
});
