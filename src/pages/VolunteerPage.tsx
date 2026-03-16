import { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns';
import { TIME_SLOTS } from '../types';
import type { AvailabilitySlot } from '../types';
import {
  registerVolunteer,
  submitAvailability,
  removeAvailability,
  getMyAvailability,
} from '../api';
import styles from './VolunteerPage.module.css';

interface VolunteerInfo {
  id: string;
  name: string;
  email: string;
}

export default function VolunteerPage() {
  const [volunteer, setVolunteer] = useState<VolunteerInfo | null>(() => {
    const saved = localStorage.getItem('volunteer');
    return saved ? JSON.parse(saved) : null;
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const slotKey = (date: Date, timeSlot: string) =>
    `${format(date, 'yyyy-MM-dd')}|${timeSlot}`;

  const loadSavedSlots = useCallback(async () => {
    if (!volunteer) return;
    try {
      const rows: AvailabilitySlot[] = await getMyAvailability(volunteer.id);
      const keys = new Set(rows.map((r) => `${r.date}|${r.time_slot}`));
      setSaved(keys);
      setSelected(keys);
    } catch {
      /* ignore */
    }
  }, [volunteer]);

  useEffect(() => {
    loadSavedSlots();
  }, [loadSavedSlots, weekStart]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const v = await registerVolunteer(name, email);
      const info = { id: v.id, name: v.name, email: v.email };
      setVolunteer(info);
      localStorage.setItem('volunteer', JSON.stringify(info));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const toggleSlot = (date: Date, timeSlot: string) => {
    const key = slotKey(date, timeSlot);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!volunteer) return;
    setSaving(true);
    setMessage('');

    try {
      const toAdd = [...selected]
        .filter((k) => !saved.has(k))
        .map((k) => {
          const [date, timeSlot] = k.split('|');
          return { date, timeSlot };
        });

      const toRemove = [...saved]
        .filter((k) => !selected.has(k))
        .map((k) => {
          const [date, timeSlot] = k.split('|');
          return { date, timeSlot };
        });

      if (toAdd.length > 0) {
        await submitAvailability(volunteer.id, toAdd);
      }
      if (toRemove.length > 0) {
        await removeAvailability(volunteer.id, toRemove);
      }

      setSaved(new Set(selected));
      setMessage('Availability saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (() => {
    if (selected.size !== saved.size) return true;
    for (const k of selected) {
      if (!saved.has(k)) return true;
    }
    return false;
  })();

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (!volunteer) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Join the Campaign</h1>
          <p className={styles.formSubtitle}>
            Enter your details to start submitting your availability.
          </p>
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Continue
            </button>
            {message && <p className={styles.error}>{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Your Availability</h1>
        <span className={styles.userBadge}>{volunteer.name}</span>
      </header>

      <div className={styles.weekNav}>
        <button onClick={() => setWeekStart((w) => subWeeks(w, 1))}>
          &larr; Previous Week
        </button>
        <span className={styles.weekLabel}>
          {format(weekStart, 'MMM d')} &ndash;{' '}
          {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setWeekStart((w) => addWeeks(w, 1))}>
          Next Week &rarr;
        </button>
      </div>

      <p className={styles.hint}>
        Click cells to toggle your availability. Weekend days are highlighted.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.timeHeader}>Time</th>
              {weekDays.map((d) => (
                <th
                  key={d.toISOString()}
                  className={`${styles.dayHeader} ${isWeekend(d) ? styles.weekend : ''}`}
                >
                  <div>{format(d, 'EEE')}</div>
                  <div className={styles.dayDate}>{format(d, 'MMM d')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                <td className={styles.timeCell}>{slot}</td>
                {weekDays.map((d) => {
                  const key = slotKey(d, slot);
                  const isSelected = selected.has(key);
                  const isSaved = saved.has(key);
                  const isPast =
                    d < new Date() && !isSameDay(d, new Date());
                  return (
                    <td
                      key={key}
                      className={`
                        ${styles.slotCell}
                        ${isWeekend(d) ? styles.weekendCell : ''}
                        ${isSelected ? styles.selectedCell : ''}
                        ${isSaved && isSelected ? styles.savedCell : ''}
                        ${isPast ? styles.pastCell : ''}
                      `}
                      onClick={() => !isPast && toggleSlot(d, slot)}
                    >
                      {isSelected && (
                        <span className={styles.check}>&#10003;</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        {message && (
          <span
            className={
              message.includes('saved') ? styles.success : styles.error
            }
          >
            {message}
          </span>
        )}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
}
