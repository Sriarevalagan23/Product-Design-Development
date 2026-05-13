import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar, Card } from '@/components/ui/MediComponents';

export default function EnterVitalsScreen() {
  const [v, setV] = useState({
    age: '22', bp: '118 / 76', glucose: 108, cholesterol: 185, bmi: '22.4', smoking: 'Non-smoker',
  });

  return (
    <View style={styles.container}>
      <TopBar title="Health prediction" onBack={() => router.back()} />
      <View style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Smart Risk Assessment</Text>
            <Text style={styles.heroSub}>Enter your vitals below. Our AI will analyze these factors to predict potential health risks.</Text>
          </View>

          {/* Section: Basic Info */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          </View>
          <Card style={styles.formCard}>
            <InputField 
              label="Current Age" 
              placeholder="e.g. 25" 
              value={v.age} 
              onChangeText={(val) => setV({ ...v, age: val })} 
              keyboardType="numeric"
              icon={<Ionicons name="calendar-outline" size={18} color={Colors.cloud[500]} />}
            />
            <View style={styles.divider} />
            <InputField 
              label="Blood Pressure (mmHg)" 
              placeholder="e.g. 120 / 80" 
              value={v.bp} 
              onChangeText={(val) => setV({ ...v, bp: val })} 
              icon={<Ionicons name="pulse-outline" size={18} color={Colors.cloud[500]} />}
            />
            <View style={styles.divider} />
            <InputField 
              label="Body Mass Index (BMI)" 
              placeholder="e.g. 22.5" 
              value={v.bmi} 
              onChangeText={(val) => setV({ ...v, bmi: val })} 
              keyboardType="decimal-pad"
              icon={<Ionicons name="body-outline" size={18} color={Colors.cloud[500]} />}
            />
          </Card>

          {/* Section: Lab Results */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LAB RESULTS</Text>
          </View>
          <Card style={styles.formCard}>
            {/* Glucose */}
            <View style={styles.metricWrap}>
              <View style={styles.metricHeader}>
                <View style={styles.metricLabelRow}>
                  <Ionicons name="water-outline" size={16} color={Colors.cloud[500]} />
                  <Text style={styles.metricLabel}>GLUCOSE (MG/DL)</Text>
                </View>
                <Text style={styles.metricValue}>{v.glucose}</Text>
              </View>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((v.glucose - 60) / 240) * 100}%` as any }]} />
                <View style={[styles.sliderThumb, { left: `${((v.glucose - 60) / 240) * 100}%` as any }]} />
              </View>
              <View style={styles.adjRow}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, glucose: Math.max(60, v.glucose - 5) })}>
                  <Text style={styles.adjBtnText}>−5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, glucose: Math.min(300, v.glucose + 5) })}>
                  <Text style={styles.adjBtnText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Cholesterol */}
            <View style={styles.metricWrap}>
              <View style={styles.metricHeader}>
                <View style={styles.metricLabelRow}>
                  <Ionicons name="flask-outline" size={16} color={Colors.cloud[500]} />
                  <Text style={styles.metricLabel}>CHOLESTEROL (MG/DL)</Text>
                </View>
                <Text style={styles.metricValue}>{v.cholesterol}</Text>
              </View>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((v.cholesterol - 100) / 200) * 100}%` as any }]} />
                <View style={[styles.sliderThumb, { left: `${((v.cholesterol - 100) / 200) * 100}%` as any }]} />
              </View>
              <View style={styles.adjRow}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, cholesterol: Math.max(100, v.cholesterol - 5) })}>
                  <Text style={styles.adjBtnText}>−5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adjBtn} onPress={() => setV({ ...v, cholesterol: Math.min(300, v.cholesterol + 5) })}>
                  <Text style={styles.adjBtnText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Section: Lifestyle */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LIFESTYLE</Text>
          </View>
          <Card style={styles.formCard}>
            <SelectDisplay
              label="Smoking Status"
              value={v.smoking}
              onChange={(val) => setV({ ...v, smoking: val })}
              options={['Non-smoker', 'Ex-smoker', 'Current smoker']}
            />
          </Card>

          <View style={styles.footer}>
            <BtnPrimary onPress={() => router.push('/prediction-result')}>
              Generate AI Risk Report
            </BtnPrimary>
            <Text style={styles.disclaimer}>* This prediction is for informational purposes only and is not a medical diagnosis.</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 20, gap: 4, paddingBottom: 60 },
  
  hero: { marginBottom: 12, gap: 4 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.cloud[900], letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: Colors.gray[500], lineHeight: 20 },

  sectionHeader: { marginTop: 8, marginBottom: 8, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.gray[400], letterSpacing: 1.2 },
  
  formCard: { padding: 16, gap: 20 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginVertical: 4 },

  metricWrap: { gap: 12 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { fontSize: 10, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.5 },
  metricValue: { fontSize: 18, fontWeight: '800', color: Colors.cloud[800] },
  
  sliderTrack: {
    height: 8, backgroundColor: Colors.cloud[50], borderRadius: 4, overflow: 'visible',
    position: 'relative',
  },
  sliderFill: { height: '100%', backgroundColor: Colors.cloud[300], borderRadius: 4, position: 'absolute', left: 0, top: 0 },
  sliderThumb: { 
    position: 'absolute', width: 18, height: 18, borderRadius: 9, 
    backgroundColor: Colors.white, borderWidth: 3, borderColor: Colors.cloud[500],
    top: -5, marginLeft: -9,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3
  },

  adjRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  adjBtn: { 
    flex: 1, height: 36, borderRadius: 10, backgroundColor: Colors.cloud[50], 
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cloud[100]
  },
  adjBtnText: { fontSize: 14, fontWeight: '700', color: Colors.cloud[700] },

  footer: { marginTop: 32, gap: 16 },
  disclaimer: { fontSize: 11, color: Colors.gray[400], textAlign: 'center', fontStyle: 'italic', lineHeight: 16 },
});
