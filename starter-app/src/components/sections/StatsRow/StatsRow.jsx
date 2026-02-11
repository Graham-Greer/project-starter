import { Section, SectionHeader, StatsSection } from "../../patterns";
import styles from "./stats-row.module.css";

export default function StatsRow({ eyebrow, title, description, items = [], className = "", ...props }) {
  return (
    <Section density="md" className={`${styles.root} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="center" />
      <StatsSection items={items} />
    </Section>
  );
}
