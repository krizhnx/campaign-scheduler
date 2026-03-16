import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { weekOf } = req.query;

  let query = supabase
    .from('availability')
    .select(`
      date,
      time_slot,
      volunteer_id,
      volunteers ( name, email )
    `)
    .order('date')
    .order('time_slot');

  if (weekOf) {
    const start = weekOf as string;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];
    query = query.gte('date', start).lte('date', endStr);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  const rows = (data || []).map((r: any) => ({
    date: r.date,
    time_slot: r.time_slot,
    volunteer_id: r.volunteer_id,
    name: r.volunteers?.name ?? '',
    email: r.volunteers?.email ?? '',
  }));

  return res.json(rows);
}
