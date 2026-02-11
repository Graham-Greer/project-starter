import styles from "./menu-toggle-button.module.css";

export default function MenuToggleButton({ isOpen, onToggle, controlsId }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span className={`${styles.line} ${styles.top} ${isOpen ? styles.topOpen : ""}`} />
      <span className={`${styles.line} ${styles.middle} ${isOpen ? styles.middleOpen : ""}`} />
      <span className={`${styles.line} ${styles.bottom} ${isOpen ? styles.bottomOpen : ""}`} />
    </button>
  );
}
