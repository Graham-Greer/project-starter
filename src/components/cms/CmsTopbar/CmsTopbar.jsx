import { Button } from "@/components/ui";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function CmsTopbar({ user, onSignOut, styles }) {
  return (
    <div className={styles.topbar}>
      <div>
        <h1 className={styles.title}>CMS Workspace</h1>
        <p className={styles.subtitle}>Signed in as {user?.email || user?.uid}</p>
      </div>
      <div className={styles.topbarActions}>
        <ThemeToggle />
        <Button variant="secondary" onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
