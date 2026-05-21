import { supabase } from './supabase';

export type Frequency = string;
export type MealTime = 'Before meal' | 'After meal' | 'Any time';

export interface Reminder {
  id: string;
  name: string;
  dosage: string;
  time: any;
  frequency: Frequency;
  mealTime: MealTime;
  active: boolean;
}

/**
 * Maps a raw Supabase medicine reminder database record to the frontend Reminder interface.
 */
function mapRowToReminder(row: any): Reminder {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    time: row.time,
    frequency: row.frequency as Frequency,
    mealTime: row.meal_time as MealTime,
    active: row.active,
  };
}

/**
 * Fetches all medicine reminders for a specific user.
 */
export async function getReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('medicine_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }

  return (data || []).map(mapRowToReminder);
}

/**
 * Creates a new medicine reminder for a specific user.
 */
export async function createReminder(reminder: Omit<Reminder, 'id'>, userId: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('medicine_reminders')
    .insert([
      {
        user_id: userId,
        name: reminder.name,
        dosage: reminder.dosage,
        time: reminder.time,
        frequency: reminder.frequency,
        meal_time: reminder.mealTime,
        active: reminder.active,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }

  return mapRowToReminder(data);
}

/**
 * Updates a medicine reminder by its ID.
 */
export async function updateReminder(id: string, updates: Partial<Omit<Reminder, 'id'>>): Promise<void> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.dosage !== undefined) dbUpdates.dosage = updates.dosage;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
  if (updates.mealTime !== undefined) dbUpdates.meal_time = updates.mealTime;
  if (updates.active !== undefined) dbUpdates.active = updates.active;

  const { error } = await supabase
    .from('medicine_reminders')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
}

/**
 * Deletes a medicine reminder by its ID.
 */
export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase
    .from('medicine_reminders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}
