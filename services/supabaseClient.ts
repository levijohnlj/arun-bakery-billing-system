import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate that the URL is a real HTTP(S) URL and not a placeholder
const isValidUrl = SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\/.+/.test(SUPABASE_URL);

if (!isValidUrl) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

let _supabase: SupabaseClient | null = null;
try {
    if (isValidUrl) {
        _supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    }
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
}

export const supabase: SupabaseClient | null = _supabase;
export default supabase;
