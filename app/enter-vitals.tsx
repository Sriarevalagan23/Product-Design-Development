import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar } from '@/components/ui/MediComponents';

export default function EnterVitalsScreen() {
  const [v, setV] = useState({
    age: '22', bp: '118 / 76', glucose: 108, cholesterol: 185, bmi: '22.4', smoking: 'Non-smoker',
  });

  return (
    <View style={styles.container}>
      <TopBar title="Health prediction" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Enter your vitals for an AI-powered risk assessment.</Text>

        <InputField label="Age" placeholder="22" value={v.age} onChangeText={(val) => setV({ ...v, age: val })} keyboardType="numeric" />
        <InputField label="Blood pressure (mmHg)" placeholder="118 / 76" value={v.bp} onChangeText={(val) => setV({ ...v, bp: val })} />

        {/* Glucose slider */}
        <View style={styles.sliderWrap}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>GLUCOSE (MG/DL)</Text>
            <Text style={styles.sliderVal}>{v.glucose}</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((v.glucose - 60) / 240) * 100}%` as any }]} />
            <TouchableOpacity
              style={[styles.sliderThumb, { left: `${((v.glucose - 60) / 240) * 100}%` as any }]}
              activeOpacity={1}
            />
          </View>
          <View style={styles.sliderMinMax}>
            <Text style={styles.sliderMinMaxText}>60</Text>
            <Text style={styles.sliderMinMaxText}>300</Text>
          </View>
          {/* Buttons to adjust */}
          <View style={styles.adjRow}>
            <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, glucose: Math.max(60, v.glucose - 5) })} activeOpacity={0.8}>
              <Text style={styles.adjBtnText}>−5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, glucose: Math.min(300, v.glucose + 5) })} activeOpacity={0.8}>
              <Text style={styles.adjBtnText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cholesterol slider */}
        <View style={styles.sliderWrap}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>CHOLESTEROL (MG/DL)</Text>
            <Text style={styles.sliderVal}>{v.cholesterol}</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((v.cholesterol - 100) / 200) * 100}%` as any }]} />
          </View>
          <View style={styles.sliderMinMax}>
            <Text style={styles.sliderMinMaxText}>100</Text>
            <Text style={styles.sliderMinMaxText}>300</Text>
          </View>
          <View style={styles.adjRow}>
            <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, cholesterol: Math.max(100, v.cholesterol - 5) })} activeOpacity={0.8}>
              <Text style={styles.adjBtnText}>−5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, cholesterol: Math.min(300, v.cholesterol + 5) })} activeOpacity={0.8}>
              <Text style={styles.adjBtnText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        <InputField label="BMI" placeholder="22.4" value={v.bmi} onChangeText={(val) => setV({ ...v, bmi: val })} keyboardType="decimal-pad" />
        <SelectDisplay
          label="Smoking status"
          value={v.smoking}
          onChange={(val) => setV({ ...v, smoking: val })}
          options={['Non-smoker', 'Ex-smoker', 'Current smoker']}
        />

        <BtnPrimary onPress={() => router.push('/prediction-result')}>Run AI prediction →</BtnPrimary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  intro: { fontSize: 13, color: Colors.gray[500], lineHeight: 20 },
  sliderWrap: { gap: 8 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[500], letterSpacing: 1 },
  sliderVal: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  sliderTrack: {
    height: 6, backgroundColor: Colors.cloud[100], borderRadius: 3, overflow: 'hidden',
    position: 'relative',
  },
  sliderFill: { height: '100%', backgroundColor: Colors.cloud[500], borderRadius: 3, position: 'absolute', left: 0, top: 0 },
  sliderThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.cloud[500], top: -5, marginLeft: -8 },
  sliderMinMax: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderMinMaxText: { fontSize: 9, color: Colors.gray[400] },
  adjRow: { flexDirection: 'row', gap: 8 },
  adjBtn: { flex: 1, paddingVertical: 8, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200], borderRadius: 10, alignItems: 'center' },
  adjBtnText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
});
