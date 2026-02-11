import { FeatureComparison, Section, SectionHeader } from "../../patterns";
import styles from "./feature-comparison-compact.module.css";

export default function FeatureComparisonCompact({ eyebrow, title, description, columns = [], rows = [], className = "", ...props }) {
  return (
    <Section density="md" className={`${styles.root} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <FeatureComparison columns={columns} rows={rows} />
    </Section>
  );
}
