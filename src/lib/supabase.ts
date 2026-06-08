import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Le credenziali Supabase potrebbero non essere presenti in alcuni ambienti
// (dev locale senza storage, CI). Inizializziamo il client in modo lazy: così
// l'import del modulo non lancia mai, e l'errore arriva solo se si usa davvero
// lo storage senza configurazione.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} non configurato: Supabase Storage non disponibile in questo ambiente`);
  }
  return value;
}

let cachedClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }
  return cachedClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const STORAGE_BUCKETS = {
  EXERCISE_VIDEOS: "exercise-videos",
  ANALYSIS_VIDEOS: "analysis-videos",
  USER_AVATARS: "user-avatars",
  PROGRESS_PHOTOS: "progress-photos",
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
) {
  const { data, error } = await getSupabase().storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? false, contentType: options?.contentType });
  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = getSupabase().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  if (error) throw error;
}
