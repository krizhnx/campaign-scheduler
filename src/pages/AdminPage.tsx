import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { TIME_SLOTS } from '../types';
import type { AdminAvailabilityRow, Volunteer } from '../types';
import { getAdminAvailability, getVolunteers } from '../api';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [data, setData] = useState<AdminAvailabilityRow[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'heatmap' | 'list'>('heatmap');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekOf = format(weekStart, 'yyyy-MM-dd');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [avail, vols] = await Promise.all([
        getAdminAvailability(weekOf),
        getVolunteers(),
      ]);
      setData(avail);
      setVolunteers(vols);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [weekOf]);

  useEffect(() => {
    load();
  }, [load]);

  const getSlotVolunteers = (date: string, timeSlot: string) =>
    data.filter((r) => r.date === date && r.time_slot === timeSlot);

  const getVolunteerDaySlots = (volunteerId: string) =>
    data.filter((r) => r.volunteer_id === volunteerId);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const maxCount = Math.max(
    1,
    ...weekDays.flatMap((d) =>
      TIME_SLOTS.map(
        (slot) => getSlotVolunteers(format(d, 'yyyy-MM-dd'), slot).length
      )
    )
  );

  const heatColor = (count: number) => {
    if (count === 0) return '';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.33) return styles.heat1;
    if (intensity < 0.66) return styles.heat2;
    return styles.heat3;
  };

  const totalSlots = data.length;
  const uniqueVolunteers = new Set(data.map((r) => r.volunteer_id)).size;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backLink} onClick={() => navigate('/')}>
            &larr; Home
          </button>
          <h1>Admin Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.viewToggle} ${view === 'heatmap' ? styles.active : ''}`}
            onClick={() => setView('heatmap')}
          >
            Calendar
          </button>
          <button
            className={`${styles.viewToggle} ${view === 'list' ? styles.active : ''}`}
            onClick={() => setView('list')}
          >
            By Person
          </button>
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>{uniqueVolunteers}</div>
          <div className={styles.statLabel}>Active Volunteers</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>{totalSlots}</div>
          <div className={styles.statLabel}>Total Slot Signups</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>{volunteers.length}</div>
          <div className={styles.statLabel}>Registered</div>
        </div>
      </div>

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

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : view === 'heatmap' ? (
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
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const vols = getSlotVolunteers(dateStr, slot);
                    return (
                      <td
                        key={`${dateStr}-${slot}`}
                        className={`${styles.slotCell} ${heatColor(vols.length)} ${isWeekend(d) ? styles.weekendCell : ''}`}
                        title={
                          vols.length > 0
                            ? vols.map((v) => v.name).join(', ')
                            : 'No volunteers'
                        }
                      >
                        {vols.length > 0 && (
                          <div className={styles.cellContent}>
                            <span className={styles.count}>{vols.length}</span>
                            <div className={styles.names}>
                              {vols.slice(0, 3).map((v) => (
                                <span key={v.volunteer_id} className={styles.nameTag}>
                                  {v.name.split(' ')[0]}
                                </span>
                              ))}
                              {vols.length > 3 && (
                                <span className={styles.more}>
                                  +{vols.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.listView}>
          {volunteers.map((v) => {
            const slots = getVolunteerDaySlots(v.id);
            const weekSlots = slots.filter((s) =>
              weekDays.some(
                (d) => format(d, 'yyyy-MM-dd') === s.date
              )
            );
            if (weekSlots.length === 0) return null;
            return (
              <div key={v.id} className={styles.personCard}>
                <div className={styles.personHeader}>
                  <div>
                    <span className={styles.personName}>{v.name}</span>
                  </div>
                  <span className={styles.personEmail}>{v.email}</span>
                </div>
                <div className={styles.personSlots}>
                  {weekSlots.map((s) => (
                    <span key={`${s.date}-${s.time_slot}`} className={styles.slotTag}>
                      {format(new Date(s.date + 'T00:00:00'), 'EEE MMM d')} &middot;{' '}
                      {s.time_slot}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {volunteers.every(
            (v) =>
              getVolunteerDaySlots(v.id).filter((s) =>
                weekDays.some((d) => format(d, 'yyyy-MM-dd') === s.date)
              ).length === 0
          ) && (
            <div className={styles.empty}>
              No availability submitted for this week yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
