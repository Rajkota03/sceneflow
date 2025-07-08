import { PropsWithChildren } from 'react';
import styles from './SceneEditor.module.css';

export default function PaginatedScroll({ children }: PropsWithChildren) {
  return (
    <div className={styles.paginatedScroll}>
      {children}
    </div>
  );
}