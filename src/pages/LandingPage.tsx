import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>Campaign 2026</div>
        <h1 className={styles.title}>Volunteer Scheduler</h1>
        <p className={styles.subtitle}>
          Coordinate weekend canvassing across the borough. Submit your
          availability so the team can plan effectively.
        </p>
        <div className={styles.buttons}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/volunteer')}
          >
            Submit Availability
          </button>
        </div>
      </div>
    </div>
  );
}
