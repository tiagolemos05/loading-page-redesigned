import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser/public use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client - only use on server side
export function getSupabaseAdmin() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not available')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export type Post = {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  author: string
  reading_time: number | null
  tags: string[]
  draft: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}
