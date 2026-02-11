import { Badge } from "../../ui";
import { FeatureComparison, Section, SectionHeader } from "../../patterns";
import styles from "./feature-comparison-detailed.module.css";

export default function FeatureComparisonDetailed({ eyebrow, title, description, columns = [], rows = [], className = "", ...props }) {
  return (
    <Section density="lg" className={className} {...props}>
      <div className={styles.meta}><Badge tone="brand">Detailed comparison</Badge></div>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <FeatureComparison columns={columns} rows={rows} />
    </Section>
  );
}
