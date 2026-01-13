
import { createClient } from '@supabase/supabase-js';
import { AppState, Task, FocusSession } from '../types';

// Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Only initialize if keys are present to prevent "supabaseUrl is required" crash
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: async () => ({ error: new Error('Supabase URL or Anon Key is missing. Check your environment variables.') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        upsert: async () => ({ error: new Error('Supabase not configured') }),
        select: () => ({ 
          eq: () => ({ 
            single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Not configured' } }) 
          }) 
        }),
      })
    } as any;

export const syncDataToCloud = async (userId: string, data: { tasks: Task[], focusHistory: FocusSession[], appState: AppState }) => {
  if (!isSupabaseConfigured || !userId) return;

  try {
    const { error } = await supabase
      .from('user_sync')
      .upsert({ 
        user_id: userId, 
        payload: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) console.error('Cloud sync error:', error);
  } catch (e) {
    console.error('Failed to sync to cloud:', e);
  }
};

export const fetchCloudData = async (userId: string) => {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_sync')
      .select('payload')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fetch cloud data error:', error);
      return null;
    }
    
    return data?.payload || null;
  } catch (e) {
    console.error('Failed to fetch from cloud:', e);
    return null;
  }
};
