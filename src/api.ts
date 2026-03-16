import type { Volunteer, AvailabilitySlot, AdminAvailabilityRow, SummaryRow } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function registerVolunteer(name: string, email: string) {
  return request<Volunteer>('/volunteers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function submitAvailability(volunteerId: string, slots: { date: string; timeSlot: string }[]) {
  return request<{ success: boolean }>('/availability', {
    method: 'POST',
    body: JSON.stringify({ volunteerId, slots }),
  });
}

export function removeAvailability(volunteerId: string, slots: { date: string; timeSlot: string }[]) {
  return request<{ success: boolean }>('/availability', {
    method: 'DELETE',
    body: JSON.stringify({ volunteerId, slots }),
  });
}

export function getMyAvailability(volunteerId: string) {
  return request<AvailabilitySlot[]>(`/availability/${volunteerId}`);
}

export function getAdminAvailability(weekOf?: string) {
  const qs = weekOf ? `?weekOf=${weekOf}` : '';
  return request<AdminAvailabilityRow[]>(`/admin/availability${qs}`);
}

export function getAdminSummary(weekOf?: string) {
  const qs = weekOf ? `?weekOf=${weekOf}` : '';
  return request<SummaryRow[]>(`/admin/summary${qs}`);
}

export function getVolunteers() {
  return request<Volunteer[]>('/volunteers');
}
