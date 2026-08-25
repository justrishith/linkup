const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzllpkcoazvtmaxwqmho.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_X6D5oBXZNLGHqROuJXuwxw_Mu4d7c9h'
export const supabase = { url: SUPABASE_URL, key: SUPABASE_KEY }
