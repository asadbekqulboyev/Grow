import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern — bitta client instance barcha componentlar uchun ishlatiladi
// Bu memory leak va cookie ziddiyatlarining oldini oladi
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return supabaseInstance;
}
