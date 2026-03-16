export interface Volunteer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  volunteer_id: string;
  date: string;
  time_slot: string;
  created_at: string;
}

export interface AdminAvailabilityRow {
  date: string;
  time_slot: string;
  volunteer_id: string;
  name: string;
  email: string;
}

export interface SummaryRow {
  date: string;
  time_slot: string;
  volunteer_count: number;
  volunteers: string;
}

export const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];
