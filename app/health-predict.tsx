import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { TopBar } from '@/components/ui/MediComponents';
import { LinearGradient } from 'expo-linear-gradient';

// ── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = 'low' | 'moderate' | 'high' | null;

interface PredictionResult {
  level: RiskLevel;
  score: number;
  message: string;
  tips: string[];
}

// ── Simple rule-based risk calculator ────────────────────────────────────────
function calcHeartRisk(age: number, bp: number, cholesterol: number, smoking: boolean, bmi: number): PredictionResult {
  let score = 0;
  if (age > 55) score += 30;
  else if (age > 45) score += 15;
  if (bp > 140) score += 25;
  else if (bp > 120) score += 10;
  if (cholesterol > 240) score += 25;
  else if (cholesterol > 200) score += 10;
  if (smoking) score += 20;
  if (bmi > 30) score += 10;
  else if (bmi > 25) score += 5;
  score = Math.min(score, 100);

  if (score < 30) return { level: 'low', score, message: 'Low heart attack risk detected.', tips: ['Maintain regular exercise', 'Keep a heart-healthy diet', 'Monitor BP annually'] };
  if (score < 65) return { level: 'moderate', score, message: 'Moderate heart attack risk. Take precautions.', tips: ['Reduce sodium intake', 'Exercise 30 min/day', 'Consult your doctor', 'Quit smoking if applicable'] };
  return { level: 'high', score, message: 'High heart attack risk. Consult a doctor soon.', tips: ['Seek medical consultation', 'Start cardiac medications if prescribed', 'Stop smoking immediately', 'Monitor heart daily'] };
}

function calcBPRisk(bp: number, age: number, bmi: number, stress: boolean): PredictionResult {
  let score = 0;
  if (bp > 160) score += 40;
  else if (bp > 140) score += 25;
  else if (bp > 120) score += 10;
  if (age > 60) score += 20;
  else if (age > 45) score += 10;
  if (bmi > 30) score += 20;
  else if (bmi > 25) score += 10;
  if (stress) score += 15;
  score = Math.min(score, 100);

  if (score < 30) return { level: 'low', score, message: 'Blood pressure is in healthy range.', tips: ['Stay hydrated', 'Limit caffeine', 'Practice meditation'] };
  if (score < 65) return { level: 'moderate', score, message: 'Elevated BP risk. Lifestyle changes recommended.', tips: ['Reduce salt intake', 'Manage stress levels', 'Exercise regularly', 'Limit alcohol'] };
  return { level: 'high', score, message: 'High BP risk. Medical attention recommended.', tips: ['Consult a cardiologist', 'Monitor BP daily', 'Take prescribed medications', 'Reduce stress urgently'] };
}

function calcDiabetesRisk(glucose: number, bmi: number, age: number, familyHistory: boolean): PredictionResult {
  let score = 0;
  if (glucose > 200) score += 40;
  else if (glucose > 126) score += 25;
  else if (glucose > 100) score += 10;
  if (bmi > 30) score += 25;
  else if (bmi > 25) score += 12;
  if (age > 55) score += 15;
  else if (age > 40) score += 7;
  if (familyHistory) score += 20;
  score = Math.min(score, 100);

  if (score < 30) return { level: 'low', score, message: 'Low diabetes risk detected.', tips: ['Maintain healthy weight', 'Eat low-glycemic foods', 'Exercise 150 min/week'] };
  if (score < 65) return { level: 'moderate', score, message: 'Pre-diabetic range. Take action now.', tips: ['Reduce sugar intake', 'Increase fiber in diet', 'Monitor fasting glucose', 'Lose 5-7% body weight'] };
  return { level: 'high', score, message: 'High diabetes risk. Consult an endocrinologist.', tips: ['Get HbA1c tested', 'Start a diabetic diet', 'Check blood sugar daily', 'Consult a specialist'] };
}

// ── Risk Card ─────────────────────────────────────────────────────────────────
const RISK_COLORS: Record<string, { bg: string; bar: string; text: string; badge: string }> = {
  low:      { bg: '#E3F5C7', bar: '#7BC42A', text: '#3A6B10', badge: '#D6EEA5' },
  moderate: { bg: '#FFF8E1', bar: '#F0A500', text: '#7A5500', badge: '#FFE9A0' },
  high:     { bg: '#FDECEA', bar: '#E53935', text: '#7A1A1A', badge: '#FBBBB9' },
};

function RiskMeter({ score, color }: { score: number; color: string }) {
  return (
    <View style={rm.wrap}>
      <View style={rm.track}>
        <View style={[rm.fill, { width: `${score}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[rm.label, { color }]}>{score}%</Text>
    </View>
  );
}
const rm = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  track: { flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  label: { fontSize: 13, fontWeight: '800', minWidth: 38, textAlign: 'right' },
});

function ResultCard({ result, title, emoji }: { result: PredictionResult; title: string; emoji: string }) {
  const c = RISK_COLORS[result.level!];
  return (
    <View style={[rc.card, { backgroundColor: c.bg }]}>
      <View style={rc.header}>
        <Text style={rc.emoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[rc.title, { color: c.text }]}>{title}</Text>
          <Text style={[rc.msg, { color: c.text }]}>{result.message}</Text>
        </View>
        <View style={[rc.badge, { backgroundColor: c.badge }]}>
          <Text style={[rc.badgeText, { color: c.text }]}>{result.level!.toUpperCase()}</Text>
        </View>
      </View>
      <RiskMeter score={result.score} color={c.bar} />
      <View style={rc.tips}>
        {result.tips.map((t, i) => (
          <View key={i} style={rc.tipRow}>
            <View style={[rc.dot, { backgroundColor: c.bar }]} />
            <Text style={[rc.tipText, { color: c.text }]}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const rc = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emoji: { fontSize: 32, marginTop: 2 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  msg: { fontSize: 12, fontWeight: '500', marginTop: 3, lineHeight: 17 },
  badge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tips: { gap: 8, marginTop: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tipText: { fontSize: 12, fontWeight: '500', flex: 1 },
});

// ── Input Row helper ──────────────────────────────────────────────────────────
function InputRow({ label, value, onChangeText, keyboardType, unit, icon }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ir.wrap}>
      <View style={ir.labelRow}>
        <Ionicons name={icon} size={14} color={Colors.cloud[600]} />
        <Text style={ir.label}>{label.toUpperCase()}</Text>
      </View>
      <View style={[ir.box, focused && ir.boxFocused]}>
        <TextInput
          style={ir.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'numeric'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Colors.gray[400]}
          placeholder="—"
        />
        {unit && <Text style={ir.unit}>{unit}</Text>}
      </View>
    </View>
  );
}
const ir = StyleSheet.create({
  wrap: { flex: 1, gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 9, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.7 },
  box: { borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white },
  boxFocused: { borderColor: '#9FCC3B', backgroundColor: '#F5F8F4' },
  input: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.gray[800], padding: 0 },
  unit: { fontSize: 11, color: Colors.gray[400], fontWeight: '500' },
});

function ToggleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[tc.chip, active && tc.chipActive]}
    >
      <Text style={[tc.text, active && tc.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const tc = StyleSheet.create({
  chip: { borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  chipActive: { borderColor: '#9FCC3B', backgroundColor: '#E3F5C7' },
  text: { fontSize: 12, fontWeight: '600', color: Colors.gray[500] },
  textActive: { color: '#5A8A2E', fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HealthPredictScreen() {
  const [age, setAge] = useState('35');
  const [bp, setBP] = useState('118');
  const [cholesterol, setCholesterol] = useState('185');
  const [glucose, setGlucose] = useState('95');
  const [bmi, setBMI] = useState('22.4');
  const [smoking, setSmoking] = useState(false);
  const [stress, setStress] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [results, setResults] = useState<{
    heart: PredictionResult;
    bp: PredictionResult;
    diabetes: PredictionResult;
  } | null>(null);

  const handlePredict = () => {
    const ageN = parseInt(age) || 35;
    const bpN = parseInt(bp) || 120;
    const cholN = parseInt(cholesterol) || 185;
    const gluN = parseInt(glucose) || 95;
    const bmiN = parseFloat(bmi) || 22;

    setResults({
      heart: calcHeartRisk(ageN, bpN, cholN, smoking, bmiN),
      bp: calcBPRisk(bpN, ageN, bmiN, stress),
      diabetes: calcDiabetesRisk(gluN, bmiN, ageN, familyHistory),
    });
  };

  return (
    <View style={styles.container}>
      <TopBar title="Predict Health Risk" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Smart Risk Assessment</Text>
          <Text style={styles.heroSub}>
            Enter your vitals to get predictions for heart attack, blood pressure, and diabetes risk.
          </Text>
        </View>

        {/* Inputs Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YOUR VITALS</Text>
          <View style={styles.row}>
            <InputRow label="Age" value={age} onChangeText={setAge} unit="yrs" icon="calendar-outline" />
            <InputRow label="Blood Pressure" value={bp} onChangeText={setBP} unit="mmHg" icon="pulse-outline" />
          </View>
          <View style={styles.row}>
            <InputRow label="Cholesterol" value={cholesterol} onChangeText={setCholesterol} unit="mg/dL" icon="flask-outline" />
            <InputRow label="Glucose" value={glucose} onChangeText={setGlucose} unit="mg/dL" icon="water-outline" />
          </View>
          <View style={styles.row}>
            <InputRow label="BMI" value={bmi} onChangeText={setBMI} keyboardType="decimal-pad" icon="body-outline" />
            <View style={{ flex: 1 }} />
          </View>

          {/* Toggles */}
          <Text style={styles.cardTitle}>RISK FACTORS</Text>
          <View style={styles.chips}>
            <ToggleChip label="🚬 Smoker" active={smoking} onPress={() => setSmoking(!smoking)} />
            <ToggleChip label="😰 High Stress" active={stress} onPress={() => setStress(!stress)} />
            <ToggleChip label="👪 Family History" active={familyHistory} onPress={() => setFamilyHistory(!familyHistory)} />
          </View>
        </View>

        {/* Predict Button */}
        <TouchableOpacity onPress={handlePredict} activeOpacity={0.85} style={styles.btn}>
          <LinearGradient colors={['#9FCC3B', '#7BAD27']} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="analytics-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Analyse My Risk</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Results */}
        {results && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Your Risk Report</Text>
            <ResultCard result={results.heart} title="Heart Attack Risk" emoji="❤️" />
            <ResultCard result={results.bp} title="Blood Pressure Risk" emoji="🩺" />
            <ResultCard result={results.diabetes} title="Diabetes Risk" emoji="🩸" />
            <Text style={styles.disclaimer}>
              * These predictions are indicative only and are not a substitute for professional medical advice.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 20, gap: 16, paddingBottom: 60 },

  hero: { gap: 6 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.gray[800], letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: Colors.gray[500], lineHeight: 20 },

  card: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 20, gap: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 10, fontWeight: '800', color: Colors.gray[400], letterSpacing: 1.2, marginBottom: 2 },
  row: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  btn: { borderRadius: 99, overflow: 'hidden' },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  results: { gap: 14 },
  resultsTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray[800], letterSpacing: -0.4 },
  disclaimer: { fontSize: 11, color: Colors.gray[400], textAlign: 'center', fontStyle: 'italic', lineHeight: 16, marginTop: 4 },
});
