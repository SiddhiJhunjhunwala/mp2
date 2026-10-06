import styles from './TypeTag.module.css';
import { formatName } from '../utils';

export default function TypeTag({ type }: { type: string }) {
  return (
    <span className={styles.tag}>
      <span className={`${styles.dot} ${styles[type] ?? ''}`} aria-hidden="true" />
      {formatName(type)}
    </span>
  );
}
