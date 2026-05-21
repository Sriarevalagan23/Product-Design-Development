import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { TopBar } from '@/components/ui/MediComponents';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import {
  Reminder, Frequency, MealTime,
  getReminders, createReminder, updateReminder, deleteReminder
} from '@/lib/reminders';



const FREQUENCY_OPTIONS: Frequency[] = ['Daily', 'Weekly', 'As needed'];
const MEAL_OPTIONS: MealTime[] = ['Before meal', 'After meal', 'Any time'];
const DOSAGE_UNITS = [
  'tablet', 'capsule', 'pill', 'ml', 'drop', 'spoon', 'teaspoon',
  'puff', 'spray', 'sachet', 'mg', 'unit', 'injection', 'application', 'patch'
];

// ── Chip Selector ─────────────────────────────────────────────────────────────
function ChipSelector<T extends string>({
  options, value, onChange,
}: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={cs.row}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          style={[cs.chip, value === o && cs.chipActive]}
          onPress={() => onChange(o)}
          activeOpacity={0.8}
        >
          <Text style={[cs.text, value === o && cs.textActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const cs = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white,
  },
  chipActive: { borderColor: '#9FCC3B', backgroundColor: '#E3F5C7' },
  text: { fontSize: 12, fontWeight: '600', color: Colors.gray[500] },
  textActive: { color: '#5A8A2E', fontWeight: '700' },
});

function formatTimeObject(obj: Record<string, any>): string {
  if (obj.legacy) return obj.legacy;
  return Object.entries(obj)
    .map(([label, val]) => `${label} (${val})`)
    .join(', ');
}

function formatReminderTime(timeValue: any): string {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') {
    try {
      const parsed = JSON.parse(timeValue);
      if (parsed && typeof parsed === 'object') {
        return formatTimeObject(parsed);
      }
    } catch (e) {
      // Ignore parse error, legacy plain string
    }
    return timeValue;
  }
  if (typeof timeValue === 'object') {
    return formatTimeObject(timeValue);
  }
  return '';
}

// ── Reminder Card ─────────────────────────────────────────────────────────────
function ReminderCard({
  reminder, onToggle, onDelete,
}: {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const dotColor = reminder.active ? '#9FCC3B' : Colors.gray[300];
  return (
    <View style={rcard.card}>
      <View style={rcard.top}>
        <View style={rcard.left}>
          <View style={[rcard.dot, { backgroundColor: dotColor }]} />
          <View>
            <Text style={[rcard.name, { color: Colors.gray[800] }]}>{reminder.name}</Text>
            <Text style={[rcard.dosage, { color: Colors.gray[500] }]}>{reminder.dosage}</Text>
          </View>
        </View>
        <View style={rcard.right}>
          <Switch
            value={reminder.active}
            onValueChange={onToggle}
            trackColor={{ false: Colors.gray[200], true: '#9FCC3B' }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.gray[200]}
          />
          <TouchableOpacity onPress={onDelete} style={rcard.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={rcard.chips}>
        <View style={[rcard.chip, { backgroundColor: '#E3F5C7' }]}>
          <Ionicons name="time-outline" size={12} color="#5A8A2E" />
          <Text style={[rcard.chipText, { color: '#5A8A2E' }]}>{formatReminderTime(reminder.time)}</Text>
        </View>
        <View style={rcard.chip}>
          <Ionicons name="repeat-outline" size={12} color={Colors.gray[500]} />
          <Text style={[rcard.chipText, { color: Colors.gray[600] }]}>{reminder.frequency}</Text>
        </View>
        <View style={rcard.chip}>
          <Ionicons name="restaurant-outline" size={12} color={Colors.gray[500]} />
          <Text style={[rcard.chipText, { color: Colors.gray[600] }]}>{reminder.mealTime}</Text>
        </View>
      </View>
    </View>
  );
}
const rcard = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 16, fontWeight: '800' },
  dosage: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { padding: 4 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, fontWeight: '700' },
});

// ── Add Reminder Form ─────────────────────────────────────────────────────────
const TIME_OPTIONS = [
  { label: 'Morning', icon: 'sunny-outline' as const },
  { label: 'Afternoon', icon: 'sunny' as const },
  { label: 'Evening', icon: 'cloudy-night-outline' as const },
  { label: 'Night', icon: 'moon-outline' as const },
];

// ── Add Reminder Form ─────────────────────────────────────────────────────────
function AddReminderForm({ onAdd }: { onAdd: (r: Omit<Reminder, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [dosageQty, setDosageQty] = useState(1);
  const [dosageUnit, setDosageUnit] = useState('tablet');
  const [timeSettings, setTimeSettings] = useState<{
    [key: string]: { enabled: boolean; time: string };
  }>({
    Morning: { enabled: true, time: '08:00 AM' },
    Afternoon: { enabled: false, time: '01:00 PM' },
    Evening: { enabled: false, time: '06:00 PM' },
    Night: { enabled: false, time: '09:00 PM' },
  });
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [mealTime, setMealTime] = useState<MealTime>('After meal');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const handleIncrement = () => setDosageQty((prev) => prev + 0.5);
  const handleDecrement = () => setDosageQty((prev) => Math.max(0.5, prev - 0.5));

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }
    const formattedQty = dosageQty % 1 === 0 ? dosageQty.toString() : dosageQty.toFixed(1);
    const pluralizableUnits = [
      'tablet', 'capsule', 'pill', 'drop', 'spoon', 'teaspoon',
      'puff', 'spray', 'sachet', 'unit', 'injection', 'application', 'patch'
    ];
    const isPluralizable = pluralizableUnits.includes(dosageUnit.toLowerCase().trim());
    let pluralUnit = dosageUnit.trim();
    if (dosageQty > 1 && !dosageUnit.endsWith('s') && isPluralizable) {
      pluralUnit = dosageUnit.trim() === 'patch' ? 'patches' : `${dosageUnit.trim()}s`;
    }
    const dosageStr = `${formattedQty} ${pluralUnit}`;

    const timeObj: Record<string, string> = {};
    const defaultTimes: Record<string, string> = {
      Morning: '08:00 AM',
      Afternoon: '01:00 PM',
      Evening: '06:00 PM',
      Night: '09:00 PM',
    };

    Object.entries(timeSettings).forEach(([label, v]) => {
      if (v.enabled) {
        timeObj[label] = v.time.trim() || defaultTimes[label] || '08:00 AM';
      }
    });

    if (Object.keys(timeObj).length === 0) {
      Alert.alert('Required', 'Please select at least one time of day.');
      return;
    }

    let freqStr = frequency;
    if (frequency === 'Weekly' && selectedDays.length > 0) {
      freqStr = `Weekly (${selectedDays.join(', ')})`;
    }

    onAdd({
      name: name.trim(),
      dosage: dosageStr,
      time: timeObj,
      frequency: freqStr,
      mealTime,
      active: true,
    });

    setName('');
    setDosageQty(1);
    setDosageUnit('tablet');
    setTimeSettings({
      Morning: { enabled: true, time: '08:00 AM' },
      Afternoon: { enabled: false, time: '01:00 PM' },
      Evening: { enabled: false, time: '06:00 PM' },
      Night: { enabled: false, time: '09:00 PM' },
    });
    setFrequency('Daily');
    setSelectedDays([]);
    setMealTime('After meal');
  };

  return (
    <View style={form.card}>

      {/* Medicine Name */}
      <View style={form.field}>
        <Text style={form.label}>MEDICINE NAME</Text>
        <View style={[form.box, focusedField === 'name' && form.boxFocused]}>
          <Ionicons name="medkit-outline" size={16} color={focusedField === 'name' ? '#9FCC3B' : Colors.gray[400]} />
          <TextInput
            style={form.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Metformin, Aspirin"
            placeholderTextColor={Colors.gray[400]}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </View>

      {/* Dosage Stepper */}
      <View style={form.field}>
        <Text style={form.label}>DOSAGE</Text>
        <View style={form.stepperRow}>
          <View style={form.stepper}>
            <TouchableOpacity onPress={handleDecrement} style={form.stepBtn} activeOpacity={0.7}>
              <Ionicons name="remove-outline" size={18} color="#5A8A2E" />
            </TouchableOpacity>
            <Text style={form.stepValue}>
              {dosageQty % 1 === 0 ? dosageQty.toString() : dosageQty.toFixed(1)}
            </Text>
            <TouchableOpacity onPress={handleIncrement} style={form.stepBtn} activeOpacity={0.7}>
              <Ionicons name="add-outline" size={18} color="#5A8A2E" />
            </TouchableOpacity>
          </View>

          {/* Unit Selection Trigger */}
          <View style={form.dropdownContainer}>
            <TouchableOpacity
              style={form.box}
              onPress={() => setShowUnitDropdown(!showUnitDropdown)}
              activeOpacity={0.8}
            >
              <Ionicons name="flask-outline" size={16} color={Colors.gray[400]} />
              <Text style={form.dropdownText}>{dosageUnit}</Text>
              <Ionicons
                name={showUnitDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.gray[400]}
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Selection Grid (Resolves React Native nested scroll conflicts) */}
        {showUnitDropdown && (
          <View style={form.inlineDropdown}>
            {DOSAGE_UNITS.map((unit) => {
              const isSelected = dosageUnit === unit;
              return (
                <TouchableOpacity
                  key={unit}
                  style={[form.inlineOption, isSelected && form.inlineOptionActive]}
                  onPress={() => {
                    setDosageUnit(unit);
                    setShowUnitDropdown(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[form.inlineOptionText, isSelected && form.inlineOptionTextActive]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Times of Day Multi-select */}
      <View style={form.field}>
        <Text style={form.label}>WHEN TO TAKE (SELECT ALL THAT APPLY)</Text>
        <View style={form.timeList}>
          {TIME_OPTIONS.map((opt) => {
            const setting = timeSettings[opt.label] || { enabled: false, time: '' };
            return (
              <View key={opt.label} style={form.timeRow}>
                <TouchableOpacity
                  style={[form.timeToggle, setting.enabled && form.timeToggleActive]}
                  onPress={() => {
                    setTimeSettings((prev) => ({
                      ...prev,
                      [opt.label]: {
                        ...prev[opt.label],
                        enabled: !prev[opt.label].enabled,
                      },
                    }));
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={setting.enabled ? '#5A8A2E' : Colors.gray[400]}
                  />
                  <Text style={[form.timeToggleText, setting.enabled && form.timeToggleTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>

                {setting.enabled && (
                  <View style={form.timeInputWrapper}>
                    <Ionicons name="time-outline" size={14} color={Colors.gray[400]} />
                    <TextInput
                      style={form.timeInput}
                      value={setting.time}
                      onChangeText={(newTime) => {
                        setTimeSettings((prev) => ({
                          ...prev,
                          [opt.label]: {
                            ...prev[opt.label],
                            time: newTime,
                          },
                        }));
                      }}
                      placeholder="08:00 AM"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Frequency */}
      <View style={form.field}>
        <Text style={form.label}>FREQUENCY</Text>
        <ChipSelector options={FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} />
        {frequency === 'Weekly' && (
          <View style={form.weekdayContainer}>
            <Text style={form.subLabel}>SELECT DAYS</Text>
            <View style={form.weekdayGrid}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[form.weekdayChip, isSelected && form.weekdayChipActive]}
                    onPress={() => {
                      setSelectedDays((prev) => {
                        const newDays = prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day];
                        
                        if (newDays.length === 7) {
                          setFrequency('Daily');
                          return [];
                        }
                        return newDays;
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[form.weekdayText, isSelected && form.weekdayTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Meal Time */}
      <View style={form.field}>
        <Text style={form.label}>WHEN TO TAKE</Text>
        <ChipSelector options={MEAL_OPTIONS} value={mealTime} onChange={setMealTime} />
      </View>

      {/* Add Button */}
      <TouchableOpacity onPress={handleAdd} activeOpacity={0.85} style={form.btn}>
        <LinearGradient colors={[Colors.cloud[800], Colors.cloud[800]]} style={form.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={form.btnText}>Set Reminder</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const form = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, gap: 16,
  },
  title: { fontSize: 10, fontWeight: '800', color: Colors.gray[400], letterSpacing: 1.2 },
  field: { gap: 8 },
  label: { fontSize: 9, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.8 },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: Colors.white,
  },
  boxFocused: { borderColor: '#9FCC3B', backgroundColor: '#F5F8F4' },
  input: { flex: 1, fontSize: 14, color: Colors.gray[800], padding: 0 },
  btn: { borderRadius: 99, overflow: 'hidden', marginTop: 4 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.gray[200],
    paddingHorizontal: 8, height: 48,
  },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#E3F5C7',
    alignItems: 'center', justifyContent: 'center',
  },
  stepValue: {
    fontSize: 16, fontWeight: '700', color: Colors.gray[800], minWidth: 40, textAlign: 'center',
  },

  timeList: { gap: 8 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    flex: 1,
  },
  timeToggleActive: {
    borderColor: '#9FCC3B',
    backgroundColor: '#E3F5C7',
  },
  timeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  timeToggleTextActive: {
    color: '#5A8A2E',
    fontWeight: '700',
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    width: 120,
    height: 48,
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[800],
    padding: 0,
  },

  dropdownContainer: {
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.gray[800],
    textTransform: 'capitalize',
  },
  inlineDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inlineOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inlineOptionActive: {
    backgroundColor: '#E3F5C7',
    borderColor: '#9FCC3B',
  },
  inlineOptionText: {
    fontSize: 12,
    color: Colors.gray[700],
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  inlineOptionTextActive: {
    color: '#5A8A2E',
    fontWeight: '700',
  },
  weekdayContainer: {
    marginTop: 6,
    gap: 6,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.gray[400],
    letterSpacing: 0.6,
  },
  weekdayGrid: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  weekdayChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  weekdayChipActive: {
    borderColor: '#9FCC3B',
    backgroundColor: '#E3F5C7',
  },
  weekdayText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontWeight: '600',
  },
  weekdayTextActive: {
    color: '#5A8A2E',
    fontWeight: '700',
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MedicineReminderScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const data = await getReminders(user.id);
          setReminders(data);
        } else {
          Alert.alert('Authentication required', 'Please sign in to manage reminders.');
          router.replace('/login');
        }
      } catch (err) {
        console.error('Error loading reminders:', err);
        Alert.alert('Error', 'Failed to load reminders. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    const target = reminders.find(r => r.id === id);
    if (!target) return;
    const newActive = !target.active;

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: newActive } : r))
    );

    try {
      await updateReminder(id, { active: newActive });
    } catch (err) {
      console.error('Error toggling reminder status:', err);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !newActive } : r))
      );
      Alert.alert('Error', 'Failed to update reminder status. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Reminder', 'Remove this medicine reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const originalReminders = [...reminders];
          setReminders((prev) => prev.filter((r) => r.id !== id));
          try {
            await deleteReminder(id);
          } catch (err) {
            console.error('Error deleting reminder:', err);
            setReminders(originalReminders);
            Alert.alert('Error', 'Failed to delete reminder. Please try again.');
          }
        }
      },
    ]);
  };

  const handleAdd = async (newReminderDraft: Omit<Reminder, 'id'>) => {
    if (!userId) {
      Alert.alert('Error', 'User session not found. Please log in again.');
      return;
    }
    try {
      const savedReminder = await createReminder(newReminderDraft, userId);
      setReminders((prev) => [savedReminder, ...prev]);
    } catch (err) {
      console.error('Error saving reminder:', err);
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    }
  };

  const activeCount = reminders.filter((r) => r.active).length;

  return (
    <View style={styles.container}>
      <TopBar title="Medicine Reminders" onBack={() => router.back()} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9FCC3B" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Set New Reminder Button */}
            <TouchableOpacity onPress={() => setShowModal(true)} activeOpacity={0.85} style={styles.addButton}>
              <LinearGradient colors={[Colors.cloud[800], Colors.cloud[800]]} style={styles.addButtonGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Set New Reminder</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Existing reminders */}
            {reminders.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>YOUR REMINDERS</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{activeCount} Active</Text>
                  </View>
                </View>
                {reminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onToggle={() => handleToggle(r.id)}
                    onDelete={() => handleDelete(r.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={Colors.gray[300]} />
                <Text style={styles.emptyText}>No reminders set yet</Text>
                <Text style={styles.emptySub}>Tap the button above to set a medication reminder</Text>
              </View>
            )}

            <Text style={styles.disclaimer}>
              * Reminders are saved to your account. Notification delivery requires device notification permissions.
            </Text>
          </ScrollView>

          {/* New Reminder Slide-up Bottom Sheet Modal */}
          <Modal
            visible={showModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Set New Reminder</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
                    <Ionicons name="close" size={24} color={Colors.gray[500]} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  contentContainerStyle={styles.modalScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <AddReminderForm
                    onAdd={(newReminder) => {
                      handleAdd(newReminder);
                      setShowModal(false);
                    }}
                  />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 20, gap: 16, paddingBottom: 60 },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: Colors.gray[400], letterSpacing: 1.2 },
  activeBadge: {
    backgroundColor: '#E3F5C7',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A8A2E',
  },
  addButton: {
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 8,
  },
  addButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray[800],
    letterSpacing: 0.5,
  },
  modalClose: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },

  disclaimer: { fontSize: 11, color: Colors.gray[400], textAlign: 'center', fontStyle: 'italic', lineHeight: 16 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.gray[500], fontWeight: '600' },
  emptyContainer: { alignItems: 'center', padding: 32, gap: 8, backgroundColor: Colors.cloud[50], borderRadius: 24, borderWidth: 1, borderColor: Colors.cloud[100] },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.gray[700] },
  emptySub: { fontSize: 12, color: Colors.gray[400], textAlign: 'center' },
});
