import { Section, SectionHeader, StatsSection } from "../../patterns";
import styles from "./stats-cards.module.css";

export default function StatsCards({ eyebrow, title, description, items = [], className = "", ...props }) {
  return (
    <Section tone="muted" density="md" className={`${styles.section} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <StatsSection items={items} />
    </Section>
  );
}
