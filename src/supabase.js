import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pryozvjbpvwlkfzambpi.supabase.co'; 
const supabaseKey = 'sb_publishable_QLyhq9BUIf1FNHAwGngCyQ_l53CC4Zx';

export const supabase = createClient(supabaseUrl, supabaseKey);