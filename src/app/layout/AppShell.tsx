import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';

export const AppShell = () => {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>BankOps Workbench</header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
