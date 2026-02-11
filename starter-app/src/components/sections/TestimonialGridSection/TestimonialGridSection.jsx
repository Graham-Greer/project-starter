import { Section, SectionHeader, TestimonialGrid } from "../../patterns";
import styles from "./testimonial-grid-section.module.css";

export default function TestimonialGridSection({ eyebrow, title, description, items = [], className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="center" />
      <TestimonialGrid items={items} />
    </Section>
  );
}
