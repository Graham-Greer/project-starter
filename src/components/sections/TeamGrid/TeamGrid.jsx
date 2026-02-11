import { Section, SectionHeader, TeamSection } from "../../patterns";
import styles from "./team-grid.module.css";

export default function TeamGrid({ eyebrow, title, description, members = [], className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="center" />
      <TeamSection members={members} />
    </Section>
  );
}
