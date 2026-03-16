import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { volunteerId } = req.query;

  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('volunteer_id', volunteerId as string)
    .order('date')
    .order('time_slot');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
