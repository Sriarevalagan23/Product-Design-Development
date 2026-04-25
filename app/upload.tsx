import { TopBar } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadDocumentFile, saveUserDocument } from '@/lib/documents';
import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────
const BLUE_GRAD: [string, string] = ['#0a7aff', '#3a9bff'];
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const REPORT_TYPES: { key: string; label: string; desc: string; icon: IoniconsName }[] = [
  { key: 'Blood Test', label: 'Blood Test Reports', desc: 'CBC, lipid panel, glucose & more', icon: 'flask-outline' },
  { key: 'General Medical', label: 'General Medical Reports', desc: 'Diagnostic tests, immunization records', icon: 'medkit-outline' },
  { key: 'ECG', label: 'ECG Reports', desc: 'Electrocardiogram & cardiac records', icon: 'pulse-outline' },
  { key: 'X-ray / Scan', label: 'X-ray / Scan', desc: 'MRI, CT, X-ray & ultrasound reports', icon: 'scan-outline' },
  { key: 'Prescription', label: 'Prescriptions', desc: 'Doctor-issued medication orders', icon: 'document-text-outline' },
  { key: 'Other', label: 'Other Reports', desc: "Anything that doesn't fit above", icon: 'folder-open-outline' },
];

// ─── Small reusable field ─────────────────────────────────────────────────────
function Field({
  label, icon, placeholder, value, onChangeText, multiline,
}: {
  label: string; icon: IoniconsName; placeholder: string;
  value: string; onChangeText: (v: string) => void; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={field.wrap}>
      {!!label && <Text style={field.label}>{label.toUpperCase()}</Text>}
      <View style={[field.box, focused && field.boxFocused]}>
        <Ionicons name={icon} size={17} color={focused ? '#0a7aff' : Colors.gray[400]} style={field.icon} />
        <TextInput
          style={[field.input, multiline && { height: 72, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

const field = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 10, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.8 },
  box: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.cloud[200],
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  boxFocused: { borderColor: '#0a7aff', backgroundColor: '#f6f9ff' },
  icon: { marginTop: 1 },
  input: { flex: 1, fontSize: 14, color: Colors.gray[800], padding: 0 },
});

// ─── Section card wrapper ──────────────────────────────────────────────────────
function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <View style={sec.card}>
      <View style={sec.titleRow}>
        <Text style={sec.title}>{title}</Text>
        {badge && (
          <View style={sec.badge}>
            <Text style={sec.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}
const sec = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cloud[100],
    padding: 16, gap: 10,
    shadowColor: '#0a7aff', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 11, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.6 },
  badge: {
    backgroundColor: '#f0f6ff', borderWidth: 1, borderColor: '#c8deff',
    borderRadius: 99, paddingHorizontal: 7, paddingVertical: 1,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#0a7aff' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UploadScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState('');
  const [reportName, setReportName] = useState('');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleTypeSelect = (key: string) => {
    setSelectedType(key);
    setTimeout(() => setStep(2), 120);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setFileSelected(true);
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const currentType = REPORT_TYPES.find((r) => r.key === selectedType);

  const handleSubmit = async () => {
    if (!file) {
      Alert.alert("Missing File", "Please select a file to upload.");
      return;
    }
    if (!currentType) {
      Alert.alert("Missing Type", "Please select a report type.");
      return;
    }
    if (!reportName.trim()) {
      Alert.alert("Missing Info", "Please enter a report name.");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload documents.");
      }

      // Generate filePath synchronously so we can save DB record instantly
      const timestamp = new Date().getTime();
      const safeName = file.name || 'document';
      const cleanFileName = safeName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${user.id}/${timestamp}_${cleanFileName}`;

      // Parse DD/MM/YYYY to YYYY-MM-DD for Postgres
      let parsedDate: string | undefined = undefined;
      const cleanDate = date.trim();
      if (cleanDate) {
        const match = cleanDate.match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/);
        if (match) {
          const [_, d, m, y] = match;
          parsedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else {
          parsedDate = cleanDate;
        }
      }

      // 1. Save document metadata to the Database FIRST so the user doesn't wait
      const savedDoc = await saveUserDocument({
        user_id: user.id,
        report_category: currentType.label,
        report_name: reportName.trim(),
        hospital_name: hospital.trim(),
        report_date: parsedDate,
        additional_notes: notes.trim(),
        file_url: filePath,
        file_name: file.name,
        file_type: file.mimeType,
        file_size: file.size,
      });

      // 2. Alert success and navigate back instantly!
      Alert.alert("Success", "Report uploaded successfully! We are analyzing the document in the background.");
      router.back();

      // 3. Do Storage Upload and OCR Extraction in the background
      // We do NOT await this IIFE so it doesn't block the UI
      (async () => {
        try {
          // A) Upload to Supabase Storage
          await uploadDocumentFile(
            user.id,
            file.uri,
            file.name,
            file.mimeType || 'application/octet-stream',
            filePath
          );

          // B) Send to OCR Backend
          const formData = new FormData();
          formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name || 'report.pdf',
          } as any);

          const ocrResponse = await fetch('http://172.23.23.180:5001/ocr', {
            method: 'POST',
            body: formData,
          });

          if (ocrResponse.ok) {
            const result = await ocrResponse.json();
            if (result.text) {
              // Update the document silently in the background
              await supabase
                .from('user_documents')
                .update({ extracted_text: result.text })
                .eq('id', savedDoc.id);
            }
          } else {
            console.warn('OCR Backend error:', ocrResponse.statusText);
          }
        } catch (bgErr) {
          console.warn('Background processing failed:', bgErr);
        }
      })();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Upload Failed", err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inner}>
            <TopBar title="Upload report" onBack={() => router.back()} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.heroWrap}>
                <Text style={styles.heroTitle}>What are you uploading?</Text>
                <Text style={styles.heroSub}>Select the report type to get started</Text>
              </View>

              {REPORT_TYPES.map((rt) => (
                <TouchableOpacity key={rt.key} style={styles.typeCard} activeOpacity={0.75} onPress={() => handleTypeSelect(rt.key)}>
                  <LinearGradient colors={BLUE_GRAD} style={styles.typeIconBubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Ionicons name={rt.icon} size={24} color="#fff" />
                  </LinearGradient>
                  <View style={styles.typeText}>
                    <Text style={styles.typeLabel}>{rt.label}</Text>
                    <Text style={styles.typeDesc}>{rt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color={Colors.gray[300]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
      >
        <View style={styles.inner}>
          <TopBar title="Upload report" onBack={() => setStep(1)} />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ── Selected type pill ── */}
            {currentType && (
              <TouchableOpacity style={styles.selectedPill} onPress={() => setStep(1)} activeOpacity={0.8}>
                <LinearGradient colors={BLUE_GRAD} style={styles.pillIconBubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name={currentType.icon} size={16} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillLabel}>{currentType.label}</Text>
                  <Text style={styles.pillDesc}>{currentType.desc}</Text>
                </View>
                <View style={styles.changeBtn}>
                  <Text style={styles.changeBtnText}>Change</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* ── Section 1: Report info ── */}
            <Section title="REPORT INFORMATION">
              <Field
                label="Report name"
                icon="document-outline"
                placeholder="e.g. CBC, Lipid profile, ECG…"
                value={reportName}
                onChangeText={setReportName}
              />
              <Field
                label="Hospital / Clinic"
                icon="business-outline"
                placeholder="e.g. Apollo Hospital"
                value={hospital}
                onChangeText={setHospital}
              />
              <Field
                label="Date of report"
                icon="calendar-outline"
                placeholder="DD / MM / YYYY"
                value={date}
                onChangeText={setDate}
              />
            </Section>

            {/* ── Section 2: Upload file ── */}
            <Section title="UPLOAD DOCUMENT">
              <TouchableOpacity
                style={[styles.dropZone, fileSelected && styles.dropZoneSelected]}
                activeOpacity={0.8}
                onPress={handlePickDocument}
              >
                {fileSelected ? (
                  <>
                    <LinearGradient colors={BLUE_GRAD} style={styles.dropSuccessIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="checkmark-outline" size={28} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.dropSuccessText}>{file ? file.name : 'File selected'}</Text>
                    <Text style={styles.dropSuccessHint}>Tap to change file</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.dropIconWrap}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#0a7aff" />
                    </View>
                    <Text style={styles.dropText}>Tap to browse files</Text>
                    <View style={styles.dropFormats}>
                      {['PDF', 'JPG', 'PNG'].map((fmt) => (
                        <View key={fmt} style={styles.fmtChip}>
                          <Text style={styles.fmtText}>{fmt}</Text>
                        </View>
                      ))}
                      <Text style={styles.dropHint}>· max 10 MB</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </Section>

            {/* ── Section 3: Notes ── */}
            <Section title="ADDITIONAL NOTES" badge="Optional">
              <Field
                label=""
                icon="create-outline"
                placeholder="Add any relevant context or observations…"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </Section>

            {/* ── Submit ── */}
            <TouchableOpacity
              style={[styles.submitBtn, uploading && styles.submitBtnLoading]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <LinearGradient colors={BLUE_GRAD} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {uploading ? (
                  <>
                    <Ionicons name="sync-outline" size={18} color="#fff" />
                    <Text style={styles.submitText}>Uploading…</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                    <Text style={styles.submitText}>Upload report</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 14, paddingBottom: 80 },

  // Step 1
  heroWrap: { paddingVertical: 8, gap: 4 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[800] },
  heroSub: { fontSize: 12, color: Colors.gray[400] },

  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 20, padding: 16,
    backgroundColor: Colors.white, borderColor: Colors.cloud[200],
  },
  typeIconBubble: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeText: { flex: 1, gap: 2 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: Colors.gray[800] },
  typeDesc: { fontSize: 11, color: Colors.gray[400] },

  // Step 2 – selected pill
  selectedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0f6ff', borderWidth: 1.5, borderColor: '#c8deff',
    borderRadius: 18, padding: 12,
  },
  pillIconBubble: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pillLabel: { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  pillDesc: { fontSize: 10, color: Colors.gray[400], marginTop: 1 },
  changeBtn: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: '#c8deff',
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5,
  },
  changeBtnText: { fontSize: 11, fontWeight: '700', color: '#0a7aff' },


  // Drop zone
  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#c8deff',
    borderRadius: 18, padding: 28, alignItems: 'center', gap: 10,
    backgroundColor: '#f8fbff',
  },
  dropZoneSelected: {
    borderStyle: 'solid', borderColor: '#0a7aff', backgroundColor: '#f0f6ff',
  },
  dropIconWrap: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: '#e8f1ff', borderWidth: 1, borderColor: '#c8deff',
    alignItems: 'center', justifyContent: 'center',
  },
  dropSuccessIcon: { width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dropSuccessText: { fontSize: 14, fontWeight: '700', color: '#0a7aff' },
  dropSuccessHint: { fontSize: 10, color: Colors.gray[400] },
  dropText: { fontSize: 13, fontWeight: '700', color: '#0a7aff' },
  dropFormats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fmtChip: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: '#c8deff',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
  },
  fmtText: { fontSize: 9, fontWeight: '700', color: '#0a7aff' },
  dropHint: { fontSize: 10, color: Colors.gray[400] },

  // Submit button
  submitBtn: { borderRadius: 99, overflow: 'hidden' },
  submitBtnLoading: { opacity: 0.75 },
  submitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 99,
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
