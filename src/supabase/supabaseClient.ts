// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxfxensvinkgmipaylrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZnhlbnN2aW5rZ21pcGF5bHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQwMzUsImV4cCI6MjA3MDQ3MDAzNX0.jL72IRZmxDHi1lr4FeOE9Vsr8L1H1TOtOPMnEYUhQUw';
export const supabase = createClient(supabaseUrl, supabaseKey);
