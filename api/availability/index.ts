import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { volunteerId, slots } = req.body as {
      volunteerId: string;
      slots: { date: string; timeSlot: string }[];
    };

    if (!volunteerId || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'volunteerId and slots array are required' });
    }

    const rows = slots.map((s) => ({
      volunteer_id: volunteerId,
      date: s.date,
      time_slot: s.timeSlot,
    }));

    const { error } = await supabase
      .from('availability')
      .upsert(rows, { onConflict: 'volunteer_id,date,time_slot' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { volunteerId, slots } = req.body as {
      volunteerId: string;
      slots: { date: string; timeSlot: string }[];
    };

    if (!volunteerId || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'volunteerId and slots array are required' });
    }

    for (const s of slots) {
      await supabase
        .from('availability')
        .delete()
        .eq('volunteer_id', volunteerId)
        .eq('date', s.date)
        .eq('time_slot', s.timeSlot);
    }

    return res.json({ success: true });
  }

  res.setHeader('Allow', 'POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
